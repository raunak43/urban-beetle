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

// Telegram's hard limit is 4096 characters per message; long answers are trimmed (the full text is in Supabase).
const FIELD_LIMIT = 600;

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (s: string) => (s.length > FIELD_LIMIT ? `${s.slice(0, FIELD_LIMIT)}… (continued in Supabase)` : s);
const line = (label: string, value: string) => (value ? `<b>${label}:</b> ${escape(clip(value))}\n` : "");

export function formatEnquiryMessage(e: EnquiryInput, reference: string, supabaseUrl: string) {
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
    (e.additional_information || e.referral_source ? `\n<b>➕ EXTRA</b>\n` : "") +
    line("Notes", e.additional_information) +
    line("Heard via", e.referral_source ? labelOf(REFERRALS, e.referral_source) : "") +
    `\n<a href="https://supabase.com/dashboard/project/${projectRef}/editor">Open in Supabase →</a>`
  );
}

// Best effort: a failed alert must never fail the submission (the enquiry is already stored).
export async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[enquiry] Telegram alert skipped: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set.");
    return false;
  }
  const send = async (to: string) => {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: to, text, parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
      signal: AbortSignal.timeout(6000),
    });
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      description?: string;
      parameters?: { migrate_to_chat_id?: number };
    };
    return { ok: res.ok && body.ok !== false, status: res.status, body };
  };
  try {
    let result = await send(chatId);
    // Upgrading a group to a supergroup gives it a new ID; follow it so alerts keep arriving.
    const movedTo = result.body.parameters?.migrate_to_chat_id;
    if (!result.ok && movedTo) {
      console.warn(`[enquiry] Telegram group was upgraded; set TELEGRAM_CHAT_ID=${movedTo}.`);
      result = await send(String(movedTo));
    }
    if (!result.ok) {
      console.error("[enquiry] Telegram alert failed:", result.status, result.body.description ?? "");
      return false;
    }
    return true;
  } catch (err) {
    console.error("[enquiry] Telegram alert error:", err);
    return false;
  }
}
