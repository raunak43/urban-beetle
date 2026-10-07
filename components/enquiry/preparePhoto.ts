import {
  PHOTO_MAX_EDGE,
  PHOTO_MAX_PICK_BYTES,
  PHOTO_MAX_UPLOAD_BYTES,
  PHOTO_MIN_LONG,
  PHOTO_MIN_SHORT,
  photoSizeProblem,
} from "@/lib/photos";

// A problem worth showing the visitor as is.
export class PhotoError extends Error {}

// Phones refuse canvases much larger than this.
const MAX_CANVAS_PIXELS = 16_000_000;
const QUALITIES = [0.85, 0.75, 0.65, 0.55];

// Turns a picked image into an upright JPEG of at most 2048 px and 1 MB, small enough that four of
// them upload quickly. Re-encoding also drops camera details such as the GPS location.
export async function preparePhoto(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  if (file.type && !file.type.startsWith("image/"))
    throw new PhotoError("That file isn't a photo. Please choose a JPG or PNG image.");
  if (file.size > PHOTO_MAX_PICK_BYTES) throw new PhotoError("This photo is over 30 MB. Please choose a smaller one.");

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    try {
      await img.decode();
    } catch {
      throw new PhotoError("We couldn't open this photo. Please choose a JPG or PNG image.");
    }
    const { naturalWidth: width, naturalHeight: height } = img;
    const problem = photoSizeProblem(width, height);
    if (problem) throw new PhotoError(problem);

    const long = Math.max(width, height);
    const short = Math.min(width, height);
    // Never shrink below the minimum size, or the server would turn the photo down.
    const floor = Math.max(PHOTO_MIN_LONG / long, PHOTO_MIN_SHORT / short);
    let scale = Math.min(1, Math.max(PHOTO_MAX_EDGE / long, floor));
    for (;;) {
      const canvas = draw(img, Math.round(width * scale), Math.round(height * scale));
      try {
        for (const quality of QUALITIES) {
          const blob = await toJpeg(canvas, quality);
          if (blob.size <= PHOTO_MAX_UPLOAD_BYTES) return { blob, width: canvas.width, height: canvas.height };
        }
      } finally {
        release(canvas);
      }
      if (scale <= floor) throw new PhotoError("This photo has too much detail to send. Please choose another one.");
      scale = Math.max(floor, scale * 0.8);
    }
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Draws the photo at the target size. Big reductions go in halving steps: one large jump makes
// browsers skip pixels and leaves edges jagged.
function draw(img: HTMLImageElement, width: number, height: number) {
  let source: HTMLImageElement | HTMLCanvasElement = img;
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  const steps: HTMLCanvasElement[] = [];
  try {
    while (w / 2 >= width && h / 2 >= height) {
      const k = Math.min(0.5, Math.sqrt(MAX_CANVAS_PIXELS / (w * h)));
      w = Math.max(width, Math.round(w * k));
      h = Math.max(height, Math.round(h * k));
      const step = canvasOf(w, h);
      steps.push(step);
      context(step).drawImage(source, 0, 0, w, h);
      source = step;
    }
    const out = canvasOf(width, height);
    const ctx = context(out);
    ctx.fillStyle = "#fff"; // transparent areas of a PNG would otherwise turn black in the JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);
    return out;
  } finally {
    steps.forEach(release);
  }
}

function canvasOf(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function context(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new PhotoError("Your browser couldn't prepare this photo. Please choose a smaller one.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return ctx;
}

// Safari holds on to a canvas's memory until it is shrunk to nothing.
function release(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

function toJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob?.type === "image/jpeg"
          ? resolve(blob)
          : reject(new PhotoError("Your browser couldn't prepare this photo. Please choose another one.")),
      "image/jpeg",
      quality,
    ),
  );
}
