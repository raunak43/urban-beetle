import "server-only";
import {
  BUDGETS,
  DURATIONS,
  REFERRALS,
  SERVICES,
  START_TIMELINES,
  labelOf,
  type EnquiryInput,
} from "./enquiry";
import type { PhotoSlot } from "./photos";

// Telegram's hard limit is 4096 characters per message; long answers are trimmed (the full text is in Supabase).
const FIELD_LIMIT = 600;

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (s: string) => (s.length > FIELD_LIMIT ? `${s.slice(0, FIELD_LIMIT)}… (continued in Supabase)` : s);
const line = (label: string, value: string) => (value ? `<b>${label}:</b> ${escape(clip(value))}\n` : "");

// A business photo from the form, outside view first.
export type EnquiryPhoto = { slot: PhotoSlot; file: Blob };

// e.g. "Outside + 3 inside"
function photoSummary(photos: EnquiryPhoto[]) {
  const inside = photos.filter((p) => p.slot !== "outside").length;
  return [photos.some((p) => p.slot === "outside") && "Outside", inside > 0 && `${inside} inside`]
    .filter(Boolean)
    .join(" + ");
}

export function formatEnquiryMessage(e: EnquiryInput, reference: string, supabaseUrl: string, photos: EnquiryPhoto[]) {
  const services = e.services_required.map((s) => labelOf(SERVICES, s)).join(", ");
  const received = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];

  return (
    `🪲 <b>NEW ENQUIRY</b> · <code>${reference}</code>\n` +
    `<i>${escape(received)} IST</i>\n\n` +
    `<b>👤 ABOUT</b>\n` +
    line("Name", e.full_name) +
    line("Company", e.company_name) +
    line("Email", e.email) +
    line("Phone", e.phone) +
    line("City", e.city) +
    line("Website", e.website) +
    line("Social", e.social_media) +
    `\n<b>🧩 SERVICES</b>\n${escape(services)}\n` +
    (e.services_other ? line("Other", e.services_other) : "") +
    `\n<b>📝 PROJECT</b>\n` +
    line("Business", e.business_description) +
    line("Goals", e.project_goals) +
    line("Challenge", e.current_challenges) +
    line("Audience", e.target_audience) +
    `\n<b>📊 DETAILS</b>\n` +
    line("Budget", labelOf(BUDGETS, e.budget)) +
    line("Start", labelOf(START_TIMELINES, e.start_timeline)) +
    line("Duration", labelOf(DURATIONS, e.project_duration)) +
    `\n<b>📷 PHOTOS</b>\n${photos.length ? `${photoSummary(photos)} · sent below` : "Not added"}\n` +
    (e.additional_information || e.referral_source ? `\n<b>➕ EXTRA</b>\n` : "") +
    line("Notes", e.additional_information) +
    line("Heard via", e.referral_source ? labelOf(REFERRALS, e.referral_source) : "") +
    `\n<a href="https://supabase.com/dashboard/project/${projectRef}/editor">Open in Supabase →</a>`
  );
}

type Sent = { ok: true; result: unknown } | { ok: false; status: number; description: string };

// One Bot API call to the alerts group. Follows the group to its new ID if it was upgraded to a
// supergroup, and waits out a short rate limit.
async function post(
  method: string,
  build: (chatId: string) => FormData | Record<string, unknown>,
  timeoutMs: number,
): Promise<Sent> {
  let chatId = process.env.TELEGRAM_CHAT_ID!;
  for (let attempt = 1; ; attempt++) {
    const payload = build(chatId);
    const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
      method: "POST",
      ...(payload instanceof FormData
        ? { body: payload }
        : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      result?: unknown;
      description?: string;
      parameters?: { migrate_to_chat_id?: number; retry_after?: number };
    };
    if (res.ok && body.ok !== false) return { ok: true, result: body.result };

    const movedTo = body.parameters?.migrate_to_chat_id;
    const wait = body.parameters?.retry_after;
    if (attempt < 3 && movedTo && String(movedTo) !== chatId) {
      console.warn(`[enquiry] Telegram group was upgraded; set TELEGRAM_CHAT_ID=${movedTo}.`);
      chatId = String(movedTo);
    } else if (attempt < 3 && res.status === 429 && wait && wait <= 20) {
      await new Promise((resolve) => setTimeout(resolve, wait * 1000));
    } else {
      return { ok: false, status: res.status, description: body.description ?? "" };
    }
  }
}

// Best effort: a failed alert must never fail the submission (the enquiry is already stored).
// Returns the alert's message ID, so the photos can be posted as a reply to it.
export async function sendTelegram(text: string): Promise<number | null> {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.warn("[enquiry] Telegram alert skipped: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set.");
    return null;
  }
  try {
    const sent = await post(
      "sendMessage",
      (chat_id) => ({ chat_id, text, parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
      6000,
    );
    if (!sent.ok) {
      console.error("[enquiry] Telegram alert failed:", sent.status, sent.description);
      return null;
    }
    return (sent.result as { message_id?: number } | undefined)?.message_id ?? null;
  } catch (err) {
    console.error("[enquiry] Telegram alert error:", err);
    return null;
  }
}

// Posts the client's photos as one album (a single photo on its own) under the alert. If Telegram
// won't take them as photos, they're sent again as image files.
export async function sendTelegramPhotos(
  photos: EnquiryPhoto[],
  e: EnquiryInput,
  reference: string,
  replyTo: number | null,
): Promise<boolean> {
  if (!photos.length || !process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return false;

  const inside = photos.filter((p) => p.slot !== "outside").length;
  const order = photos[0].slot === "outside" ? (inside ? `Outside first, then ${inside} inside` : "Outside") : `${inside} inside`;
  const caption =
    `📷 <b>Business photos</b> · <code>${reference}</code>\n` +
    `<b>${escape(e.company_name)}</b> · ${escape(e.full_name)}\n${order}`;
  const fileName = (p: EnquiryPhoto) => `${reference}-${p.slot.replace("_", "-")}.jpg`;

  for (const type of ["photo", "document"] as const) {
    try {
      const sent = await post(
        photos.length > 1 ? "sendMediaGroup" : type === "photo" ? "sendPhoto" : "sendDocument",
        (chatId) => {
          const form = new FormData();
          form.set("chat_id", chatId);
          if (replyTo) form.set("reply_parameters", JSON.stringify({ message_id: replyTo, allow_sending_without_reply: true }));
          if (photos.length > 1) {
            form.set(
              "media",
              JSON.stringify(
                photos.map((p, i) => ({
                  type,
                  media: `attach://photo${i}`,
                  ...(i === 0 ? { caption, parse_mode: "HTML" } : {}),
                })),
              ),
            );
            photos.forEach((p, i) => form.set(`photo${i}`, p.file, fileName(p)));
          } else {
            form.set(type, photos[0].file, fileName(photos[0]));
            form.set("caption", caption);
            form.set("parse_mode", "HTML");
          }
          return form;
        },
        30_000,
      );
      if (sent.ok) {
        console.info(`[enquiry] Telegram ${type}s sent for ${reference}:`, photos.map((p) => p.slot).join(", "));
        return true;
      }
      console.error(`[enquiry] Telegram ${type} upload failed:`, sent.status, sent.description);
      if (sent.status !== 400) return false; // only a rejected image is worth resending as a file
    } catch (err) {
      console.error(`[enquiry] Telegram ${type} upload error:`, err);
      return false;
    }
  }
  return false;
}
