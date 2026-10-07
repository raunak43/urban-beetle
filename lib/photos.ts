// Business photos on the enquiry form: one of the outside and up to three of the inside.
// Shared by the /enquiry page (which resizes them in the browser) and the API route (the real check).

export const PHOTO_SLOTS = [
  { id: "outside", label: "Outside", hint: "Shopfront, entrance or building" },
  { id: "inside_1", label: "Inside 1", hint: "Interior, counter, seating or products" },
  { id: "inside_2", label: "Inside 2", hint: "Interior, counter, seating or products" },
  { id: "inside_3", label: "Inside 3", hint: "Interior, counter, seating or products" },
] as const;

export type PhotoSlot = (typeof PHOTO_SLOTS)[number]["id"];

// The form field each photo is uploaded in.
export const photoField = (slot: PhotoSlot) => `photo_${slot}`;

// Smallest photo accepted, in either orientation.
export const PHOTO_MIN_LONG = 800;
export const PHOTO_MIN_SHORT = 600;
// Wider panoramas break Telegram's photo rules.
export const PHOTO_MAX_RATIO = 4;
// Largest file a visitor can pick; the browser shrinks it before uploading.
export const PHOTO_MAX_PICK_BYTES = 30 * 1024 * 1024;
// After shrinking: the longest side, and the size each photo must fit in. Four photos plus the
// answers stay under Vercel's 4.5 MB request limit.
export const PHOTO_MAX_EDGE = 2048;
export const PHOTO_MAX_UPLOAD_BYTES = 1_000_000;
// A panorama keeps its short side at the minimum, so its long side can pass PHOTO_MAX_EDGE.
const PHOTO_MAX_UPLOAD_EDGE = Math.max(PHOTO_MAX_EDGE, PHOTO_MIN_SHORT * PHOTO_MAX_RATIO);

// Why a photo of this size can't be used (null when it can).
export function photoSizeProblem(width: number, height: number): string | null {
  const long = Math.max(width, height);
  const short = Math.min(width, height);
  if (long < PHOTO_MIN_LONG || short < PHOTO_MIN_SHORT)
    return `This photo is too small (${width} × ${height}). Please use one at least ${PHOTO_MIN_LONG} × ${PHOTO_MIN_SHORT} pixels.`;
  if (long / short > PHOTO_MAX_RATIO) return "This photo is too long and narrow. Please use a normal photo, not a panorama.";
  return null;
}

// Pixel size from a JPEG's frame header, or null if the bytes aren't a complete JPEG.
export function jpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  const n = bytes.length;
  if (n < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[n - 2] !== 0xff || bytes[n - 1] !== 0xd9) return null;
  let i = 2;
  while (i + 3 < n) {
    if (bytes[i] !== 0xff) return null;
    const marker = bytes[i + 1];
    if (marker === 0xff) {
      i += 1; // fill byte
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      i += 2; // markers without a length
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return null; // image ended, or pixel data began, before a frame header
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    if (length < 2) return null;
    // Frame headers are C0–CF, except C4 (Huffman tables), C8 (reserved) and CC (arithmetic coding).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      if (i + 8 >= n) return null;
      const height = (bytes[i + 5] << 8) | bytes[i + 6];
      const width = (bytes[i + 7] << 8) | bytes[i + 8];
      return width && height ? { width, height } : null;
    }
    i += 2 + length;
  }
  return null;
}

// The API's check of one uploaded photo, which the form has already shrunk to a JPEG (null when it's fine).
export function uploadedPhotoProblem(bytes: Uint8Array): string | null {
  if (bytes.length > PHOTO_MAX_UPLOAD_BYTES) return "This photo is too large. Please choose it again.";
  const size = jpegSize(bytes);
  if (!size) return "This photo couldn't be read. Please choose it again.";
  if (Math.max(size.width, size.height) > PHOTO_MAX_UPLOAD_EDGE) return "This photo is too large. Please choose it again.";
  return photoSizeProblem(size.width, size.height);
}
