"use client";

import { gsap } from "@/lib/motion";

// Gold dust that can pull itself into shapes: a picture (the logo) or a word. It is drawn live on a
// canvas, so it is sharp at any size. Every grain is a small body that is either drifting freely or
// being pulled toward its place in the current shape; `hold` (0 to 1) says how hard. Because it is
// physics and not a recording, it keeps moving when the scroll stops, and the pointer can push it.

export type DustShape = { image: string; height: number } | { text: string; height: number };

type Options = {
  shapes: DustShape[];
  count: number;
  /** No animation (reduced motion): the grains are simply placed where they belong. */
  still?: boolean;
};

const TONES = ["#f8e3a3", "#d9ae54", "#9c7628"];
const SAMPLE_HEIGHT = 420; // shapes are sampled at this height, then scaled to the screen
const POINTER_RADIUS = 120;

// Points inside a shape, in units of the shape's height and centred on its middle.
async function sample(shape: DustShape, count: number) {
  const c = document.createElement("canvas");
  const g = c.getContext("2d", { willReadFrequently: true })!;
  if ("image" in shape) {
    const img = new Image();
    img.src = shape.image;
    await img.decode();
    c.height = SAMPLE_HEIGHT;
    c.width = Math.round((SAMPLE_HEIGHT * img.naturalWidth) / img.naturalHeight);
    g.drawImage(img, 0, 0, c.width, c.height);
  } else {
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-sans") || "sans-serif";
    const font = `700 ${SAMPLE_HEIGHT * 0.8}px ${family}, sans-serif`;
    await document.fonts.load(font, shape.text).catch(() => {});
    g.font = font;
    c.width = Math.ceil(g.measureText(shape.text).width) + 40;
    c.height = SAMPLE_HEIGHT;
    g.font = font; // resizing the canvas resets it
    g.textBaseline = "middle";
    g.fillStyle = "#fff";
    g.fillText(shape.text, 20, SAMPLE_HEIGHT / 2);
  }

  const { data, width, height } = g.getImageData(0, 0, c.width, c.height);
  // A mask image may carry its shape in the alpha channel or, if it is opaque, in its brightness.
  let opaque = true;
  for (let i = 3; i < data.length; i += 4 * 97) if (data[i] < 250) opaque = false;
  const inside: number[] = [];
  for (let py = 0; py < height; py += 2)
    for (let px = 0; px < width; px += 2) {
      const i = (py * width + px) * 4;
      if ((opaque ? data[i] : data[i + 3]) > 128) inside.push(px, py);
    }

  const ux = new Float32Array(count);
  const uy = new Float32Array(count);
  const total = inside.length / 2;
  for (let i = 0; i < count; i++) {
    const p = total ? Math.floor(Math.random() * total) * 2 : 0;
    ux[i] = (inside[p] + Math.random() * 2 - width / 2) / height;
    uy[i] = (inside[p + 1] + Math.random() * 2 - height / 2) / height;
  }
  return { ux, uy, ratio: width / height, height: shape.height };
}

export function createDust(canvas: HTMLCanvasElement, { shapes, count: n, still = false }: Options) {
  const ctx = canvas.getContext("2d")!;
  const x = new Float32Array(n);
  const y = new Float32Array(n);
  const vx = new Float32Array(n);
  const vy = new Float32Array(n);
  const hx = new Float32Array(n); // where a grain drifts back to when it is free (0 to 1 of the canvas)
  const hy = new Float32Array(n);
  const size = new Float32Array(n);
  const stiff = new Float32Array(n);
  const seed = new Float32Array(n);
  const tone = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    hx[i] = Math.random();
    hy[i] = Math.random();
    size[i] = 0.9 + Math.random() ** 2 * 1.9;
    stiff[i] = 0.55 + Math.random() * 0.9; // grains arrive at different times, like a swarm
    seed[i] = Math.random() * 6.283;
    tone[i] = Math.random() < 0.25 ? 0 : Math.random() < 0.6 ? 1 : 2;
  }

  let masks: Awaited<ReturnType<typeof sample>>[] = [];
  const tx: Float32Array[] = shapes.map(() => new Float32Array(n));
  const ty: Float32Array[] = shapes.map(() => new Float32Array(n));
  let W = 0;
  let H = 0;
  let dpr = 1;
  let shape = 0;
  let hold = 0;
  let px = -9999;
  let py = -9999;
  let visible = false;
  let destroyed = false;

  const layout = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const first = !W;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    for (let i = 0; i < n && !first; i++) {
      x[i] *= w / W;
      y[i] *= h / H;
    }
    W = w;
    H = h;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    masks.forEach((m, k) => {
      const scale = Math.min(H * m.height, (W * 0.86) / m.ratio);
      for (let i = 0; i < n; i++) {
        tx[k][i] = W / 2 + m.ux[i] * scale;
        ty[k][i] = H / 2 + m.uy[i] * scale;
      }
    });
    if (first) for (let i = 0; i < n; i++) (x[i] = hx[i] * W), (y[i] = hy[i] * H);
    if (still) place();
    draw();
  };

  // Put every grain exactly where it belongs, with no travel.
  const place = () => {
    const formed = hold > 0.5 && masks.length > 0;
    for (let i = 0; i < n; i++) {
      x[i] = formed ? tx[shape][i] : hx[i] * W;
      y[i] = formed ? ty[shape][i] : hy[i] * H;
      vx[i] = vy[i] = 0;
    }
  };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter"; // grains add up, so a dense shape glows
    for (let b = 0; b < TONES.length; b++) {
      ctx.fillStyle = TONES[b];
      for (let i = 0; i < n; i++) {
        if (tone[i] !== b) continue;
        const s = size[i];
        ctx.fillRect(x[i] - s / 2, y[i] - s / 2, s, s);
      }
    }
  };

  const tick = (time: number, dtMs: number) => {
    if (!visible || !W) return;
    const k = Math.min(dtMs, 34) / 16.67;
    const pull = masks.length ? hold : 0;
    const free = 1 - pull;
    const damp = Math.pow(0.975 - 0.115 * pull, k);
    const txk = tx[shape];
    const tyk = ty[shape];
    for (let i = 0; i < n; i++) {
      let ax = 0;
      let ay = 0;
      if (pull > 0) {
        const f = 0.012 * stiff[i] * pull;
        ax += (txk[i] - x[i]) * f;
        ay += (tyk[i] - y[i]) * f;
      }
      if (free > 0) {
        // A slow wind that curls, plus a faint pull home so the dust stays spread over the screen.
        const a = (Math.sin(x[i] * 0.0035 + time * 0.21 + seed[i]) + Math.cos(y[i] * 0.004 - time * 0.17 + seed[i] * 1.7)) * 3.1;
        ax += (Math.cos(a) * 0.035 + (hx[i] * W - x[i]) * 0.00035) * free;
        ay += (Math.sin(a) * 0.035 + (hy[i] * H - y[i]) * 0.00035) * free;
      }
      const dx = x[i] - px;
      const dy = y[i] - py;
      const d2 = dx * dx + dy * dy;
      if (d2 < POINTER_RADIUS * POINTER_RADIUS && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const push = (1 - d / POINTER_RADIUS) * 1.5;
        ax += (dx / d) * push;
        ay += (dy / d) * push;
      }
      vx[i] = (vx[i] + ax * k) * damp;
      vy[i] = (vy[i] + ay * k) * damp;
      x[i] += vx[i] * k;
      y[i] += vy[i] * k;
    }
    draw();
  };

  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    px = e.clientX - r.left;
    py = e.clientY - r.top;
  };
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const ro = new ResizeObserver(layout);
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  ro.observe(canvas);
  if (!still) {
    io.observe(canvas);
    gsap.ticker.add(tick);
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });
  }

  const ready = Promise.all(shapes.map((s) => sample(s, n))).then((result) => {
    if (destroyed) return;
    masks = result;
    W = 0; // lay everything out again now that the shapes are known
    layout();
  });

  return {
    /** Resolves once the shapes have been read and the dust can form them. */
    ready,
    /** Which shape to form, and how firmly (0 lets the dust drift). */
    set(nextShape: number, nextHold: number) {
      const changed = nextShape !== shape || nextHold !== hold;
      shape = Math.max(0, Math.min(shapes.length - 1, nextShape));
      hold = Math.max(0, Math.min(1, nextHold));
      if (still && changed) {
        place();
        draw();
      }
    },
    /** Jump straight into place (used before the page is revealed). */
    snap() {
      place();
      draw();
    },
    /** Throw every grain outward from the middle. */
    burst(power = 1) {
      for (let i = 0; i < n; i++) {
        const dx = x[i] - W / 2;
        const dy = y[i] - H / 2;
        const d = Math.hypot(dx, dy) || 1;
        const speed = (5 + Math.random() * 13) * power;
        vx[i] += (dx / d) * speed;
        vy[i] += (dy / d) * speed;
      }
    },
    destroy() {
      destroyed = true;
      ro.disconnect();
      io.disconnect();
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onPointer);
    },
  };
}
