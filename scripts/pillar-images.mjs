// Cuts the Strategy, Creativity and Technology photos out of the designed three-panel image in
// assets/pillars.webp. Each panel keeps only its photo, above the printed headline, and the printed
// "01 ─◯" mark is painted out because the page draws its own, sharper one in its place.
//
// Usage:
//   npm run pillars

import { mkdirSync } from "node:fs";
import sharp from "sharp";

const source = "assets/pillars.webp";
const outDir = "public/images/pillars";

// Left edge of each panel in the 2000×667 source (the panels are split by 1px divider lines).
const panels = [
  { name: "strategy", left: 1 },
  { name: "creativity", left: 669 },
  { name: "technology", left: 1337 },
];
const W = 660;
const H = 405; // the printed headline starts just below this
const mark = { x: 36, y: 40, w: 132, h: 70 }; // box around the printed number mark, in panel pixels
const SCALE = 2; // Lanczos upscale so the photos stay crisp on high-density screens

mkdirSync(outDir, { recursive: true });

for (const { name, left } of panels) {
  const { data, info } = await sharp(source)
    .extract({ left, top: 0, width: W, height: H })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  paintOutMark(data, info.channels);
  const file = `${outDir}/${name}.webp`;
  await sharp(data, { raw: { width: W, height: H, channels: info.channels } })
    .resize(W * SCALE, H * SCALE, { kernel: "lanczos3" })
    .sharpen({ sigma: 0.6 })
    .webp({ quality: 82 })
    .toFile(file);
  console.log(file);
}

// Rebuilds the mark's box as a smooth membrane stretched between the untouched pixels around it.
// The backdrop there is dark and out of focus, so a smooth fill is indistinguishable from it.
function paintOutMark(data, channels) {
  const { x: X, y: Y, w, h } = mark;
  const at = (x, y, c) => (y * W + x) * channels + c;
  const plane = new Float64Array(w * h);
  for (let c = 0; c < channels; c++) {
    const edge = (x, y) => data[at(x, y, c)];
    // Start from a blend of the four surrounding edges, then relax every pixel towards the average
    // of its neighbours until the fill is perfectly smooth.
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const u = (x + 1) / (w + 1);
        const v = (y + 1) / (h + 1);
        const left = edge(X - 1, Y + y), right = edge(X + w, Y + y);
        const top = edge(X + x, Y - 1), bottom = edge(X + x, Y + h);
        plane[y * w + x] = ((1 - u) * left + u * right + (1 - v) * top + v * bottom) / 2;
      }
    const value = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? edge(X + x, Y + y) : plane[y * w + x]);
    for (let it = 0; it < 1500; it++)
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const mean = (value(x - 1, y) + value(x + 1, y) + value(x, y - 1) + value(x, y + 1)) / 4;
          plane[i] += 1.9 * (mean - plane[i]);
        }
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) data[at(X + x, Y + y, c)] = Math.max(0, Math.min(255, Math.round(plane[y * w + x])));
  }
}
