// Cloudflare Turnstile: the security check under the enquiry form. The widget gives the visitor's browser a
// one-time token, and the API asks Cloudflare whether that token is genuine before saving the enquiry.
// It is on only when both keys are set (Cloudflare dashboard → Turnstile → the widget's settings), so the
// form never shows a widget the server doesn't check, or demands a token the page can't produce.
import "server-only";
import { TURNSTILE_ACTION } from "@/lib/enquiry";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** The public site key for the widget, or undefined while Turnstile isn't set up. */
export function turnstileSiteKey() {
  const siteKey = process.env.TURNSTILE_SITE_KEY;
  return siteKey && process.env.TURNSTILE_SECRET_KEY ? siteKey : undefined;
}

type SiteVerify = { success: boolean; action?: string; "error-codes"?: string[] };

/** "ok" when the token is genuine, unused and recent (or Turnstile is off); "unavailable" when Cloudflare can't be reached. */
export async function verifyTurnstile(token: unknown, ip: string | null): Promise<"ok" | "failed" | "unavailable"> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!turnstileSiteKey() || !secret) return "ok";
  // Cloudflare's tokens are at most 2048 characters.
  if (typeof token !== "string" || !token || token.length > 2048) return "failed";

  let data: SiteVerify;
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error("[enquiry] Turnstile verification unreachable:", err);
    return "unavailable";
  }

  // Cloudflare's test keys return no action; real tokens carry the one the widget was rendered with.
  if (data.success && (data.action === undefined || data.action === TURNSTILE_ACTION)) return "ok";
  console.warn("[enquiry] Turnstile rejected a submission:", data["error-codes"]?.join(", ") || `action ${data.action}`);
  return "failed";
}
