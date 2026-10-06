import { createHash } from "node:crypto";
import { after, type NextRequest } from "next/server";
import { normaliseUrl, sanitiseEnquiry, validateEnquiry, type EnquiryInput } from "@/lib/enquiry";
import { formatEnquiryMessage, sendTelegram } from "@/lib/telegram";
import { sendWhatsApp } from "@/lib/whatsapp";

const MAX_BODY_BYTES = 40_000;
const MIN_FILL_MS = 4_000; // humans can't complete this form faster; bots can
const MAX_LINKS = 6;

type Fail = { ok: false; error: string; fieldErrors?: Record<string, string> };
const fail = (status: number, error: string, fieldErrors?: Fail["fieldErrors"]) =>
  Response.json({ ok: false, error, fieldErrors } satisfies Fail, { status });

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("[enquiry] SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY are not configured.");
    return fail(503, "Enquiries are temporarily unavailable. Please email us instead.");
  }

  // Only accept JSON posted from this site.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && URL.parse(origin)?.host !== host) return fail(403, "Request not allowed.");
  if (!request.headers.get("content-type")?.includes("application/json")) return fail(415, "Unsupported request.");
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return fail(413, "Your enquiry is too long. Please shorten it and try again.");

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "We couldn't read your enquiry. Please try again.");
  }

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

  // Alert the team after responding, so the visitor never waits on Telegram or WhatsApp.
  if (!result.duplicate)
    after(() =>
      Promise.all([sendTelegram(formatEnquiryMessage(record, reference, supabaseUrl)), sendWhatsApp(record, reference)]),
    );

  return Response.json({ ok: true, reference });
}
