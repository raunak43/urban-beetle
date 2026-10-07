import "server-only";
import { BUDGETS, SERVICES, START_TIMELINES, labelOf, type EnquiryInput } from "./enquiry";
import { photoLabel, type EnquiryPhoto } from "./photos";
import photoTemplate from "./whatsapp-photo-template.json";
import template from "./whatsapp-template.json";

// WhatsApp only lets a business start a chat with a template Meta has approved, so each alert fills in
// lib/whatsapp-template.json, and each business photo lib/whatsapp-photo-template.json (submitted for
// approval with `npm run whatsapp:template` and `npm run whatsapp:photo-template`).
const GRAPH = "https://graph.facebook.com/v23.0";
const BODY_LIMIT = 1024; // characters, once the values are filled in

// Template values can't contain line breaks, tabs or runs of spaces, and can't be empty.
const flat = (value: string, max: number) => {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return "—";
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
};

// The chat button (urbanbeetle.com/chat/<number>, which forwards to wa.me) needs the full international
// number as digits; numbers typed without a country code are taken as Indian.
function chatNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

function alertValues(e: EnquiryInput, reference: string) {
  const services = e.services_required.map((s) =>
    s === "other" && e.services_other ? `Other (${e.services_other})` : labelOf(SERVICES, s),
  );
  const values = [
    reference,
    flat(e.full_name, 80),
    flat(e.company_name, 80),
    flat(e.phone, 25),
    flat(e.email, 100),
    flat(e.city, 60),
    flat(services.join(", "), 200),
    flat(labelOf(BUDGETS, e.budget), 40),
    flat(labelOf(START_TIMELINES, e.start_timeline), 40),
  ];
  // The goals get the room that's left; the full text is in Telegram and Supabase.
  const used = template.body.replace(/\{\{\d+\}\}/g, "").length + values.join("").length;
  return [...values, flat(e.project_goals, Math.min(300, BODY_LIMIT - used - 10))];
}

// Best effort: a failed alert must never fail the submission (the enquiry is already stored).
export async function sendWhatsApp(e: EnquiryInput, reference: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const from = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_TO;
  if (!token || !from || !to) {
    console.warn("[enquiry] WhatsApp alert skipped: WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_TO not set.");
    return false;
  }
  try {
    const res = await fetch(`${GRAPH}/${from}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template.name,
          language: { code: template.language },
          components: [
            { type: "body", parameters: alertValues(e, reference).map((text) => ({ type: "text", text })) },
            { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: chatNumber(e.phone) }] },
          ],
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: { code?: number; message?: string } };
      console.error("[enquiry] WhatsApp alert failed:", res.status, body.error?.code ?? "", body.error?.message ?? "");
      return false;
    }
    return true;
  } catch (err) {
    console.error("[enquiry] WhatsApp alert error:", err);
    return false;
  }
}

// A template carries a single image, so each business photo is its own message, sent after the alert
// and in order (outside view first). Best effort, like the alert.
export async function sendWhatsAppPhotos(photos: EnquiryPhoto[], e: EnquiryInput, reference: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const from = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_TO;
  if (!photos.length || !token || !from || !to) return false;
  const who = flat(`${e.company_name} (${e.full_name})`, 160);
  try {
    const ids = await Promise.all(photos.map((p) => uploadPhoto(p, reference, token, from)));
    for (const [i, photo] of photos.entries()) {
      const res = await fetch(`${GRAPH}/${from}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: photoTemplate.name,
            language: { code: photoTemplate.language },
            components: [
              { type: "header", parameters: [{ type: "image", image: { id: ids[i] } }] },
              {
                type: "body",
                parameters: [who, photoLabel(photo.slot), reference].map((text) => ({ type: "text", text })),
              },
            ],
          },
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: { code?: number; message?: string } };
        // The rest would fail the same way (e.g. while Meta is still reviewing the template).
        console.error("[enquiry] WhatsApp photo failed:", res.status, body.error?.code ?? "", body.error?.message ?? "");
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("[enquiry] WhatsApp photo error:", err);
    return false;
  }
}

// Uploads a photo to WhatsApp and returns its media ID (WhatsApp keeps it for 30 days).
async function uploadPhoto(photo: EnquiryPhoto, reference: string, token: string, from: string) {
  const form = new FormData();
  form.set("messaging_product", "whatsapp");
  form.set("type", "image/jpeg");
  form.set("file", new Blob([photo.file], { type: "image/jpeg" }), `${reference}-${photo.slot.replace("_", "-")}.jpg`);
  const res = await fetch(`${GRAPH}/${from}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    signal: AbortSignal.timeout(20_000),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; error?: { code?: number; message?: string } };
  if (!res.ok || !body.id)
    throw new Error(`photo upload failed: ${res.status} ${body.error?.code ?? ""} ${body.error?.message ?? ""}`);
  return body.id;
}
