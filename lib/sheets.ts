import "server-only";
import { BUDGETS, DURATIONS, REFERRALS, SERVICES, START_TIMELINES, labelOf, mapsLink, type EnquiryInput } from "./enquiry";
import { photoLabel, type EnquiryPhoto } from "./photos";

// Adds each enquiry as a row in a Google Sheet, through the small Apps Script web app in
// scripts/google-sheet-apps-script.gs. SHEETS_WEBHOOK_URL is that web app's address; treat it as a
// secret, since anyone with it could add rows. Without it, nothing is sent.

export const SHEET_COLUMNS = [
  "Received (IST)",
  "Reference",
  "Name",
  "Company",
  "Email",
  "Phone",
  "City",
  "Website",
  "Social media",
  "Services",
  "Budget",
  "Start",
  "Duration",
  "About the business",
  "Goals",
  "Challenges",
  "Target audience",
  "Additional information",
  "Heard about us via",
  "Photos",
  // Added later than the rest, so it goes last: rows already in the sheet keep their columns.
  "Location (Google Maps)",
] as const;

function row(e: EnquiryInput, reference: string, photos: EnquiryPhoto[]): string[] {
  const services = e.services_required
    .map((s) => (s === "other" && e.services_other ? `Other (${e.services_other})` : labelOf(SERVICES, s)))
    .join(", ");
  const received = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  return [
    received,
    reference,
    e.full_name,
    e.company_name,
    e.email,
    e.phone,
    e.city,
    e.website,
    e.social_media,
    services,
    labelOf(BUDGETS, e.budget),
    labelOf(START_TIMELINES, e.start_timeline),
    labelOf(DURATIONS, e.project_duration),
    e.business_description,
    e.project_goals,
    e.current_challenges,
    e.target_audience,
    e.additional_information,
    e.referral_source ? labelOf(REFERRALS, e.referral_source) : "",
    photos.length ? `${photos.map((p) => photoLabel(p.slot)).join(", ")} (sent to Telegram and WhatsApp)` : "",
    mapsLink(e.business_location),
  ];
}

// Best effort, like the other alerts: a failure is logged and never affects the stored enquiry.
export async function addToSheet(e: EnquiryInput, reference: string, photos: EnquiryPhoto[]) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columns: SHEET_COLUMNS, row: row(e, reference, photos) }),
      signal: AbortSignal.timeout(20_000),
    });
    const answer = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !answer?.ok) throw new Error(answer?.error ?? `HTTP ${res.status}`);
    console.info(`[enquiry] Added ${reference} to the Google Sheet.`);
    return true;
  } catch (err) {
    console.error("[enquiry] Google Sheet update failed:", err instanceof Error ? err.message : err);
    return false;
  }
}
