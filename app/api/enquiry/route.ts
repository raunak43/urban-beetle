import { createHash } from "node:crypto";
import { after, type NextRequest } from "next/server";
import { normaliseUrl, sanitiseEnquiry, validateEnquiry, type EnquiryInput } from "@/lib/enquiry";
import { PHOTO_SLOTS, photoField, uploadedPhotoProblem, type EnquiryPhoto, type PhotoSlot } from "@/lib/photos";
import { formatEnquiryMessage, sendTelegram, sendTelegramPhotos } from "@/lib/telegram";
import { sendWhatsApp, sendWhatsAppPhotos } from "@/lib/whatsapp";
import { canEmail, sendConfirmationEmail } from "@/lib/email";

// The photos go to Telegram and WhatsApp after the response, within this many seconds.
export const maxDuration = 60;

const MAX_BODY_BYTES = 40_000;
const MAX_UPLOAD_BYTES = 4_400_000; // answers + four resized photos; Vercel refuses request bodies over 4.5 MB
const MIN_FILL_MS = 4_000; // humans can't complete this form faster; bots can
const MAX_LINKS = 6;

type PhotoErrors = Partial<Record<PhotoSlot, string>>;
type Fail = { ok: false; error: string; fieldErrors?: Record<string, string>; photoErrors?: PhotoErrors };
const fail = (status: number, error: string, fieldErrors?: Fail["fieldErrors"], photoErrors?: PhotoErrors) =>
  Response.json({ ok: false, error, fieldErrors, photoErrors } satisfies Fail, { status });
const unreadable = () => fail(400, "We couldn't read your enquiry. Please try again.");

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("[enquiry] SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY are not configured.");
    return fail(503, "Enquiries are temporarily unavailable. Please email us instead.");
  }

  // Only accept enquiries posted from this site: the form sends its answers as JSON in a "data"
  // field, plus any business photos. Plain JSON (no photos) is still accepted.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && URL.parse(origin)?.host !== host) return fail(403, "Request not allowed.");
  const contentType = request.headers.get("content-type") ?? "";
  let raw: string;
  const photos: EnquiryPhoto[] = [];
  if (contentType.includes("multipart/form-data")) {
    if (Number(request.headers.get("content-length")) > MAX_UPLOAD_BYTES)
      return fail(413, "Your photos are too large to send. Please remove one and try again.");
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return unreadable();
    }
    const data = form.getAll("data");
    if (data.length !== 1 || typeof data[0] !== "string") return unreadable();
    raw = data[0];
    for (const [key, value] of form) {
      if (key === "data") continue;
      const slot = PHOTO_SLOTS.find((s) => photoField(s.id) === key)?.id;
      if (!slot || typeof value === "string" || photos.some((p) => p.slot === slot)) return unreadable();
      photos.push({ slot, file: value });
    }
    photos.sort((a, b) => PHOTO_SLOTS.findIndex((s) => s.id === a.slot) - PHOTO_SLOTS.findIndex((s) => s.id === b.slot));
  } else if (contentType.includes("application/json")) {
    raw = await request.text();
  } else {
    return fail(415, "Unsupported request.");
  }
  if (raw.length > MAX_BODY_BYTES) return fail(413, "Your enquiry is too long. Please shorten it and try again.");

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return unreadable();
  }
  if (!body || typeof body !== "object") return unreadable();

  // Spam checks: a hidden field only bots fill in, and a minimum time spent on the form.
  const elapsed = Number(body.elapsed_ms);
  if (typeof body.company_website === "string" && body.company_website.trim() !== "")
    return fail(400, "We couldn't verify this submission. Please try again.");
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS)
    return fail(400, "That was quick! Please review your answers and submit again.");

  const enquiry = sanitiseEnquiry(body.enquiry);
  const fieldErrors = validateEnquiry(enquiry);
  if (Object.keys(fieldErrors).length) return fail(422, "Please check the highlighted fields.", fieldErrors);

  const allText = [enquiry.business_description, enquiry.project_goals, enquiry.current_challenges,
    enquiry.target_audience, enquiry.additional_information].join(" ");
  if ((allText.match(/https?:\/\//gi) ?? []).length > MAX_LINKS)
    return fail(422, "Please remove some of the links from your answers.");

  // Checked before anything is stored, so a bad photo never leaves a half-sent enquiry.
  const photoErrors: PhotoErrors = {};
  for (const photo of photos) {
    const problem = uploadedPhotoProblem(new Uint8Array(await photo.file.arrayBuffer()));
    if (problem) photoErrors[photo.slot] = problem;
  }
  if (Object.keys(photoErrors).length)
    return fail(422, "One of your photos couldn't be used. Please choose it again or remove it.", undefined, photoErrors);

  const record: EnquiryInput = {
    ...enquiry,
    email: enquiry.email.toLowerCase(),
    website: enquiry.website ? normaliseUrl(enquiry.website)! : "",
    social_media:
      enquiry.social_media && !enquiry.social_media.startsWith("@")
        ? normaliseUrl(enquiry.social_media)!
        : enquiry.social_media,
  };

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
  const salt = process.env.ENQUIRY_IP_SALT ?? "";
  const ipHash = ip ? createHash("sha256").update(`${salt}:${ip}`).digest("hex") : null;

  let result: { id: string; duplicate: boolean };
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/submit_enquiry`, {
      method: "POST",
      headers: { apikey: supabaseKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: record,
        p_ip_hash: ipHash,
        p_user_agent: request.headers.get("user-agent")?.slice(0, 400) ?? null,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
      if (err.message === "rate_limited")
        return fail(429, "We've received several enquiries from you already. Our team will be in touch, or email us directly.");
      if (err.code === "23514") return fail(422, "Some of your details look invalid. Please review and try again.");
      console.error("[enquiry] Supabase rejected the enquiry:", res.status, err);
      return fail(502, "We couldn't save your enquiry right now. Please try again in a moment.");
    }
    result = await res.json();
  } catch (err) {
    console.error("[enquiry] Supabase unreachable:", err);
    return fail(503, "We couldn't reach our servers. Please check your connection and try again.");
  }

  const reference = `UB-${result.id.slice(0, 8).toUpperCase()}`;

  // Alert the team and email the client after responding, so the visitor never waits on Telegram,
  // WhatsApp or email. On both chat apps, the photos follow the alert (on Telegram as a reply to it).
  if (!result.duplicate)
    after(() =>
      Promise.all([
        sendTelegram(formatEnquiryMessage(record, reference, supabaseUrl, photos)).then((messageId) =>
          sendTelegramPhotos(photos, record, reference, messageId),
        ),
        sendWhatsApp(record, reference).then(() => sendWhatsAppPhotos(photos, record, reference)),
        sendConfirmationEmail(record, reference, photos),
      ]),
    );

  // confirmationEmail: whether the client is being emailed, so the success screen never promises one that isn't sent.
  return Response.json({ ok: true, reference, confirmationEmail: canEmail() });
}
