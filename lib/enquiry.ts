// Enquiry form definition shared by the /enquiry page (instant feedback) and the API route (the real check).
// Option values must match the CHECK constraints in supabase/migrations/*_client_enquiries_schema.sql.

export type Option = { value: string; label: string };

// Tags the Cloudflare security check's token, so the API only accepts tokens made for this form (lib/turnstile.ts).
export const TURNSTILE_ACTION = "enquiry";

export const SERVICES: Option[] = [
  { value: "branding", label: "Branding" },
  { value: "website", label: "Website Design & Development" },
  { value: "social_media", label: "Social Media Management" },
  { value: "content_creation", label: "Content Creation" },
  { value: "video_production", label: "Reels / Video Production" },
  { value: "photography", label: "Photography" },
  { value: "meta_ads", label: "Meta Ads" },
  { value: "google_ads", label: "Google Ads" },
  { value: "seo", label: "SEO" },
  { value: "influencer_marketing", label: "Influencer Marketing" },
  { value: "creative_design", label: "Menu / Creative Design" },
  { value: "ai_creative", label: "AI Creative Solutions" },
  { value: "complete_marketing", label: "Complete Marketing" },
  { value: "other", label: "Other" },
];

export const BUDGETS: Option[] = [
  { value: "under_25k", label: "Under ₹25,000" },
  { value: "25k_50k", label: "₹25,000 – ₹50,000" },
  { value: "50k_1l", label: "₹50,000 – ₹1,00,000" },
  { value: "1l_2_5l", label: "₹1,00,000 – ₹2,50,000" },
  { value: "2_5l_plus", label: "₹2,50,000+" },
  { value: "not_decided", label: "Not decided yet" },
];

export const START_TIMELINES: Option[] = [
  { value: "immediately", label: "Immediately" },
  { value: "within_1_week", label: "Within 1 week" },
  { value: "within_1_month", label: "Within 1 month" },
  { value: "1_3_months", label: "1–3 months" },
  { value: "just_exploring", label: "Just exploring" },
];

export const DURATIONS: Option[] = [
  { value: "one_time", label: "One-time project" },
  { value: "1_3_months", label: "1–3 months" },
  { value: "3_6_months", label: "3–6 months" },
  { value: "6_12_months", label: "6–12 months" },
  { value: "long_term", label: "Long-term / ongoing" },
  { value: "not_sure", label: "Not sure" },
];

export const REFERRALS: Option[] = [
  { value: "instagram", label: "Instagram" },
  { value: "google", label: "Google" },
  { value: "youtube", label: "YouTube" },
  { value: "referral", label: "Referral" },
  { value: "existing_client", label: "Existing client" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

export const labelOf = (options: Option[], value: string) => options.find((o) => o.value === value)?.label ?? value;

export type EnquiryInput = {
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  city: string;
  website: string;
  social_media: string;
  services_required: string[];
  services_other: string;
  business_description: string;
  project_goals: string;
  current_challenges: string;
  target_audience: string;
  budget: string;
  start_timeline: string;
  project_duration: string;
  additional_information: string;
  referral_source: string;
};

export type Field = keyof EnquiryInput;
export type FieldErrors = Partial<Record<Field, string>>;

export const EMPTY_ENQUIRY: EnquiryInput = {
  full_name: "",
  company_name: "",
  email: "",
  phone: "",
  city: "",
  website: "",
  social_media: "",
  services_required: [],
  services_other: "",
  business_description: "",
  project_goals: "",
  current_challenges: "",
  target_audience: "",
  budget: "",
  start_timeline: "",
  project_duration: "",
  additional_information: "",
  referral_source: "",
};

export const MAX_LENGTH: Partial<Record<Field, number>> = {
  full_name: 120,
  company_name: 160,
  email: 254,
  phone: 20,
  city: 120,
  website: 300,
  social_media: 300,
  services_other: 200,
  business_description: 4000,
  project_goals: 4000,
  current_challenges: 4000,
  target_audience: 2000,
  additional_information: 4000,
};

// Form sections, in order, with the fields each one owns (used for progress and error navigation).
// "photos" owns no text fields: its uploads live in lib/photos.ts.
export const SECTIONS: { id: string; title: string; fields: Field[]; optional?: boolean }[] = [
  { id: "about", title: "About you", fields: ["full_name", "company_name", "email", "phone", "city", "website", "social_media"] },
  { id: "needs", title: "What do you need?", fields: ["services_required", "services_other"] },
  {
    id: "project",
    title: "Your project",
    fields: ["business_description", "project_goals", "current_challenges", "target_audience"],
  },
  { id: "details", title: "Project information", fields: ["budget", "start_timeline", "project_duration"] },
  { id: "photos", title: "Business photos", fields: [], optional: true },
  { id: "extra", title: "Anything else", fields: ["additional_information", "referral_source"], optional: true },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;
const HANDLE_RE = /^@[A-Za-z0-9._]{1,30}$/;
// Control characters other than tab / newline.
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const isOneOf = (options: Option[], value: string) => options.some((o) => o.value === value);

// Accepts "brand.com", "www.brand.com" or a full URL; returns a normalised https URL or null.
export function normaliseUrl(value: string): string | null {
  const v = value.trim();
  if (!v || /\s/.test(v)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function validateEnquiry(v: EnquiryInput): FieldErrors {
  const e: FieldErrors = {};
  const len = (s: string) => s.trim().length;

  if (len(v.full_name) < 2) e.full_name = "Please enter your full name.";
  if (len(v.company_name) < 1) e.company_name = "Please enter your company or brand name.";
  if (!len(v.email)) e.email = "Please enter your work email.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "That email address doesn't look right.";
  const digits = v.phone.replace(/\D/g, "").length;
  if (!len(v.phone)) e.phone = "Please enter a phone number.";
  else if (!PHONE_RE.test(v.phone.trim()) || digits < 7 || digits > 15)
    e.phone = "Enter a valid phone number, e.g. +91 98765 43210.";
  if (len(v.website) && !normaliseUrl(v.website)) e.website = "Enter a valid website, e.g. yourbrand.com.";
  if (len(v.social_media) && !HANDLE_RE.test(v.social_media.trim()) && !normaliseUrl(v.social_media))
    e.social_media = "Enter a profile link or an @handle.";

  if (!v.services_required.length) e.services_required = "Select at least one service.";
  else if (v.services_required.some((s) => !isOneOf(SERVICES, s))) e.services_required = "Please choose from the list.";
  if (v.services_required.includes("other") && len(v.services_other) < 2)
    e.services_other = "Tell us briefly what else you need.";

  if (len(v.business_description) < 10)
    e.business_description = len(v.business_description)
      ? "Please add a little more detail (at least 10 characters)."
      : "Tell us what your business does.";
  if (len(v.project_goals) < 10)
    e.project_goals = len(v.project_goals)
      ? "Please add a little more detail (at least 10 characters)."
      : "Tell us what you're looking to achieve.";

  if (!isOneOf(BUDGETS, v.budget)) e.budget = "Please choose a budget range.";
  if (!isOneOf(START_TIMELINES, v.start_timeline)) e.start_timeline = "Please choose when you'd like to start.";
  if (!isOneOf(DURATIONS, v.project_duration)) e.project_duration = "Please choose an expected duration.";
  if (v.referral_source && !isOneOf(REFERRALS, v.referral_source)) e.referral_source = "Please choose from the list.";

  for (const [field, max] of Object.entries(MAX_LENGTH) as [Field, number][]) {
    const value = v[field];
    if (typeof value === "string" && value.trim().length > max && !e[field])
      e[field] = `Please keep this under ${max.toLocaleString("en-IN")} characters.`;
  }
  return e;
}

// Coerces untrusted JSON into a clean EnquiryInput (used by the API before validating).
export function sanitiseEnquiry(raw: unknown): EnquiryInput {
  const src = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const text = (key: Field) => {
    const value = src[key];
    return typeof value === "string" ? value.replace(CONTROL_RE, "").replace(/\r\n?/g, "\n").trim() : "";
  };
  const services = Array.isArray(src.services_required)
    ? Array.from(new Set(src.services_required.filter((s): s is string => typeof s === "string"))).slice(0, 20)
    : [];
  const out: EnquiryInput = { ...EMPTY_ENQUIRY, services_required: services };
  for (const key of Object.keys(EMPTY_ENQUIRY) as Field[]) {
    if (key !== "services_required") (out[key] as string) = text(key);
  }
  if (!out.services_required.includes("other")) out.services_other = "";
  return out;
}
