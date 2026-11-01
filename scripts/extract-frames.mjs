// Turns a scroll-scene video into WebP image sequences for the scroll animation: the hero (plus a few
// still frames reused as the recurring beetle visual), or the closing take-off scene behind the CTA.
//
// Usage:
//   npm run frames -- assets/beetle-hero.mp4
//   npm run frames -- assets/beetle-takeoff.mp4 takeoff
// Needs ffmpeg on PATH, or set FFMPEG_PATH to an ffmpeg executable.

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const input = process.argv[2];
const scene = process.argv[3] || "hero";

const scenes = {
  hero: {
    // Desktop gets every frame; phones get every 2nd frame at a smaller size.
    variants: [
      { name: "desktop", width: 1600, step: 1, quality: 75 },
      { name: "mobile", width: 1280, step: 2, quality: 72 },
    ],
    // Source frame numbers (24fps) used as standalone beetle images.
    stills: {
      profile: 72, // clean side view (About)
    },
    // Box (in source-video pixels) containing the generator's small corner logo, which is painted out
    // of every frame. The exact logo pixels inside the box are detected automatically; set to null for
    // a video without one.
    cornerMark: { x: 1694, y: 854, size: 92 },
    prefilter: "",
    dir: "public/frames",
    manifest: "lib/frames.json",
  },
  takeoff: {
    // Shown dimmed behind the closing headline, so fewer, smaller and slightly soft frames are plenty
    // (the gold dust is costly to compress; the page cross-fades between frames to keep it smooth).
    variants: [
      { name: "desktop", width: 1280, step: 3, quality: 60 },
      { name: "mobile", width: 860, step: 4, quality: 58 },
    ],
    stills: {},
    // Flow's small "Veo" mark sits on a smooth glow here, so a plain delogo blends it away.
    cornerMark: null,
    prefilter: "delogo=x=1858:y=1036:w=46:h=28,gblur=sigma=1.2",
    dir: "public/frames/takeoff",
    manifest: "lib/frames-takeoff.json",
  },
};

if (!input || !scenes[scene]) {
  console.error(`Usage: npm run frames -- <video.mp4> [${Object.keys(scenes).join(" | ")}]`);
  process.exit(1);
}
const { variants, stills, cornerMark, prefilter, dir: framesDir, manifest: manifestPath } = scenes[scene];

const ffmpegRun = (args, options = {}) =>
  execFileSync(ffmpeg, ["-v", "error", "-y", ...args], { maxBuffer: 1 << 30, ...options });

// ---------------------------------------------------------------------------
// Corner-mark removal
// ---------------------------------------------------------------------------

// Returns the path of a raw video of cleaned patches (one per frame), or null if no mark was found.
function cleanCornerMark({ x: X, y: Y, size: S }) {
  const N = S * S;
  const F = N * 3;
  const buf = ffmpegRun(["-i", input, "-an", "-vf", `crop=${S}:${S}:${X}:${Y},format=gbrp`, "-f", "rawvideo", "-"]);
  const frames = buf.length / F;
  const lum = (f, i) => Math.max(buf[f * F + i], buf[f * F + N + i], buf[f * F + 2 * N + i]);

  // A static logo is brighter than its surroundings in nearly every frame, so a low percentile of
  // each pixel's brightness over time picks it out while moving content averages away.
  const low = new Float64Array(N);
  const column = new Float64Array(frames);
  for (let i = 0; i < N; i++) {
    for (let f = 0; f < frames; f++) column[f] = lum(f, i);
    column.sort();
    low[i] = column[Math.floor(0.2 * (frames - 1))];
  }
  const floor = Array.from(low).sort((a, b) => a - b)[Math.floor(N * 0.3)];
  const logo = new Uint8Array(N);
  let count = 0;
  for (let i = 0; i < N; i++) if (low[i] - floor > 4) (logo[i] = 1), count++;
  if (count < 50) return null;

  const grow = (src, r) => {
    const out = new Uint8Array(N);
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        search: for (let dy = -r; dy <= r; dy++)
          for (let dx = -r; dx <= r; dx++) {
            const xx = x + dx, yy = y + dy;
            if (xx >= 0 && yy >= 0 && xx < S && yy < S && src[yy * S + xx]) {
              out[y * S + x] = 1;
              break search;
            }
          }
      }
    return out;
  };
  const shrink = (src, r) => {
    const inverted = src.map((v) => 1 - v);
    return grow(inverted, r).map((v) => 1 - v);
  };
  const hole = grow(logo, 2); // the logo plus its soft, compressed halo
  const core = shrink(logo, 2);
  const seam = grow(logo, 3).map((v, i) => (v && !core[i] ? 1 : 0));
  const holeIdx = [];
  for (let i = 0; i < N; i++) if (hole[i]) holeIdx.push(i);

  // For each hole pixel: the first untouched pixel in 8 directions, used to seed the fill.
  const ring = new Map();
  for (const i of holeIdx) {
    const x0 = i % S, y0 = (i / S) | 0;
    const list = [];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
      let x = x0, y = y0;
      while (x >= 0 && y >= 0 && x < S && y < S && hole[y * S + x]) (x += dx), (y += dy);
      if (x >= 0 && y >= 0 && x < S && y < S) list.push(y * S + x);
    }
    ring.set(i, list);
  }

  const median = (values) => {
    values.sort((a, b) => a - b);
    const m = values.length >> 1;
    return values.length % 2 ? values[m] : (values[m - 1] + values[m]) / 2;
  };

  const out = Buffer.alloc(buf.length);
  const plane = new Float64Array(N);
  for (let f = 0; f < frames; f++)
    for (let c = 0; c < 3; c++) {
      const base = f * F + c * N;
      // Rebuild the hole as a smooth membrane stretched between the untouched pixels around it:
      // seeded with the median of the 8 surrounding samples (so a passing particle can't streak in),
      // then relaxed towards the average of its neighbours.
      for (let i = 0; i < N; i++) plane[i] = buf[base + i];
      for (const i of holeIdx) plane[i] = median(ring.get(i).map((j) => buf[base + j]));
      for (let it = 0; it < 200; it++)
        for (const i of holeIdx) plane[i] = (plane[i - 1] + plane[i + 1] + plane[i - S] + plane[i + S]) / 4;
      // Melt the seam with a small median so no outline survives compression.
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) {
          const i = y * S + x;
          let v = plane[i];
          if (seam[i]) {
            const window = [];
            for (let dy = -2; dy <= 2; dy++)
              for (let dx = -2; dx <= 2; dx++)
                window.push(plane[Math.min(S - 1, Math.max(0, y + dy)) * S + Math.min(S - 1, Math.max(0, x + dx))]);
            v = median(window);
          }
          out[base + i] = Math.max(0, Math.min(255, Math.round(v)));
        }
    }

  const file = path.join(tmpdir(), `corner-patches-${process.pid}.raw`);
  writeFileSync(file, out);
  console.log(`corner mark: ${count} px painted out of ${frames} frames`);
  return file;
}

const patches = cornerMark ? cleanCornerMark(cornerMark) : null;

// Every output is rendered through this: the source video (with the cleaned corner patched back in)
// followed by the given filters. Frames are matched by index, so the patch stream needs no timing.
const render = (filters, outputArgs) => {
  const inputs = ["-i", input];
  let graph = `[0:v]${filters}[out]`;
  if (patches) {
    const { x, y, size } = cornerMark;
    inputs.push("-f", "rawvideo", "-pix_fmt", "gbrp", "-s", `${size}x${size}`, "-i", patches);
    graph =
      `[0:v]setpts=N/TB,format=gbrp[v];[1:v]setpts=N/TB[p];` +
      `[v][p]overlay=${x}:${y}:shortest=1,${filters}[out]`;
  }
  ffmpegRun([...inputs, "-an", "-filter_complex", graph, "-map", "[out]", ...outputArgs]);
};

const framesRoot = path.resolve(framesDir);
// The version busts the long-lived browser cache whenever frames are regenerated.
const manifest = { version: Date.now().toString(36) };

for (const v of variants) {
  const dir = path.join(framesRoot, v.name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  render(`select='not(mod(n\\,${v.step}))',${prefilter ? `${prefilter},` : ""}scale=${v.width}:-2:flags=lanczos`, [
    "-fps_mode", "vfr",
    "-c:v", "libwebp", "-quality", String(v.quality), "-compression_level", "6",
    path.join(dir, "%04d.webp"),
  ]);
  const count = readdirSync(dir).filter((f) => f.endsWith(".webp")).length;
  manifest[v.name] = { count, path: `/${path.posix.relative("public", framesDir)}/${v.name}` };
  console.log(`${v.name}: ${count} frames`);
}

const stillsDir = path.resolve("public/images");
mkdirSync(stillsDir, { recursive: true });
for (const [name, frame] of Object.entries(stills)) {
  render(`select='eq(n\\,${frame})',scale=1400:-2:flags=lanczos`, [
    "-frames:v", "1",
    "-c:v", "libwebp", "-quality", "82",
    path.join(stillsDir, `beetle-${name}.webp`),
  ]);
}
if (Object.keys(stills).length) console.log(`stills: ${Object.keys(stills).join(", ")}`);

if (patches) rmSync(patches, { force: true });
writeFileSync(path.resolve(manifestPath), JSON.stringify(manifest, null, 2) + "\n");
