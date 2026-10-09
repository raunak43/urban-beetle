import "server-only";
import nodemailer from "nodemailer";
import { site } from "./content";
import { BUDGETS, SERVICES, START_TIMELINES, labelOf, type EnquiryInput } from "./enquiry";
import { photoLabel, type EnquiryPhoto } from "./photos";

// The confirmation email a client gets after submitting the enquiry form. It's sent through the Titan
// mailbox over SMTP, so it comes from hello@urbanbeetle.com and replies land in that inbox.

const SITE_URL = "https://urbanbeetle.com";
const FROM = site.generalEmail; // hello@urbanbeetle.com
const WHATSAPP_URL = `https://wa.me/${site.phone.replace(/\D/g, "")}`;
const INSTAGRAM = site.socials.find((s) => s.label === "Instagram")!.href;

// The email is dark, in the brand's black and gold. Phone mail apps in dark mode recolour light emails,
// and Gmail on Android even inverts small images on dark backgrounds (the old black logo tile turned white).
// A dark design is left alone, and every image is gold on a transparent background, which nothing recolours.
// public/email/beetle-gold.png and gold-*.png are those images. The older files there (apple-icon tile,
// icon-*.png, signature-logo.jpg) are kept because emails already sent still load them.
const C = {
  page: "#0b0b0a",
  card: "#131210",
  panel: "#1a1813",
  line: "#2f291c",
  header: "#070707",
  heading: "#f5efe3",
  text: "#cfc6b4",
  muted: "#9a917f",
  gold: "#d4a94f",
  goldText: "#e2b960",
};

// The Titan email signature, rebuilt in HTML so its links work.
const SIGNATURE = {
  name: "Raunak Gupta",
  title: "Founder | Urban Beetle",
  tagline: "Turn attention into impact.",
  contacts: [
    { icon: "phone", label: "+91 8356940351", href: "tel:+918356940351" },
    { icon: "mail", label: FROM, href: `mailto:${FROM}` },
    { icon: "web", label: "www.urbanbeetle.com", href: SITE_URL },
    { icon: "instagram", label: "@urban.beetle", href: INSTAGRAM },
  ],
  location: "Kalyan, Maharashtra",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function confirmationEmail(e: EnquiryInput, reference: string, photos: EnquiryPhoto[]) {
  const firstName = e.full_name.trim().split(/\s+/)[0];
  const services = e.services_required
    .map((s) => (s === "other" && e.services_other ? `Other (${e.services_other})` : labelOf(SERVICES, s)))
    .join(", ");
  const summary: [string, string][] = [
    ["Reference", reference],
    ["Company", e.company_name],
    ["Services", services],
    ["Budget", labelOf(BUDGETS, e.budget)],
    ["Start", labelOf(START_TIMELINES, e.start_timeline)],
    ...(photos.length ? [["Photos", photos.map((p) => photoLabel(p.slot)).join(", ")] as [string, string]] : []),
  ];
  const steps = [
    "Our team reviews your goals and your business.",
    "We contact you within 24 hours to understand what you need.",
    "We share a clear plan, built around your brand.",
  ];
  const subject = `Thank you for your enquiry · Urban Beetle (${reference})`;
  const preheader = "We've received your enquiry. Our team will get back to you within 24 hours.";

  const text = [
    `Hi ${firstName},`,
    "",
    `Thank you for contacting Urban Beetle. We've received your enquiry for ${e.company_name}, and our team is already reviewing it.`,
    "",
    `A member of our team will personally get back to you within 24 hours, by phone on ${e.phone} or by email.`,
    "",
    "YOUR ENQUIRY",
    ...summary.map(([label, value]) => `${label}: ${value}`),
    "",
    "WHAT HAPPENS NEXT",
    ...steps.map((step, i) => `${i + 1}. ${step}`),
    "",
    `Need to add something, like a deadline or a reference you love? Simply reply to this email, or message us on WhatsApp: ${WHATSAPP_URL}`,
    "",
    "Warm regards,",
    "",
    SIGNATURE.name,
    SIGNATURE.title,
    ...SIGNATURE.contacts.map((c) => (c.icon === "instagram" ? `Instagram: ${c.label}` : c.label)),
    SIGNATURE.location,
    "",
    SIGNATURE.tagline,
    "",
    `You're receiving this email because you submitted an enquiry at ${SITE_URL}.`,
  ].join("\n");

  const font = "font-family:Helvetica,Arial,sans-serif;";
  const serif = "font-family:Georgia,'Times New Roman',serif;";
  // The logo's typeface where it's installed (Apple devices often have it), otherwise a clean sans.
  const brand = "font-family:Montserrat,'Helvetica Neue',Helvetica,Arial,sans-serif;";
  const label = (s: string) =>
    `<p style="${font}margin:0 0 10px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${C.gold};">${s}</p>`;
  const row = ([name, value]: [string, string]) =>
    `<tr><td style="${font}padding:7px 0;width:110px;vertical-align:top;font-size:13px;color:${C.muted};">${esc(name)}</td>` +
    `<td style="${font}padding:7px 0;vertical-align:top;font-size:14px;color:${C.heading};font-weight:600;">${esc(value)}</td></tr>`;
  const step = (s: string, i: number) =>
    `<tr><td style="${serif}width:34px;vertical-align:top;padding:6px 0;font-size:18px;color:${C.gold};">0${i + 1}</td>` +
    `<td style="${font}vertical-align:top;padding:8px 0;font-size:15px;line-height:1.55;color:${C.text};">${esc(s)}</td></tr>`;
  const contact = (icon: string, text: string, href?: string) =>
    `<tr><td width="24" style="padding:5px 0;vertical-align:middle;"><img src="${SITE_URL}/email/gold-${icon}.png" width="17" height="17" alt="" style="display:block;border:0;"></td>` +
    `<td width="18" style="${font}padding:5px 0;vertical-align:middle;font-size:14px;color:${C.gold};">|</td>` +
    `<td style="${font}padding:5px 0;vertical-align:middle;font-size:14px;color:${C.heading};">` +
    (href ? `<a href="${href}" style="color:${C.heading};text-decoration:none;">${esc(text)}</a>` : esc(text)) +
    `</td></tr>`;
  const socials = site.socials
    .map((s) => `<a href="${s.href}" style="color:${C.goldText};text-decoration:none;">${esc(s.label)}</a>`)
    .join(`<span style="color:${C.muted};">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(subject)}</title>
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  @media (max-width: 520px) {
    .sig-col { display: block !important; width: auto !important; }
    .sig-details { border-left: 0 !important; border-top: 1px solid ${C.gold} !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
<tr><td align="center" style="padding:32px 14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${C.card};border:1px solid ${C.line};border-radius:16px;overflow:hidden;">
  <tr><td style="background:${C.header};padding:24px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:middle;"><img src="${SITE_URL}/email/beetle-gold.png" width="27" height="44" alt="" style="display:block;border:0;"></td>
      <td style="${brand}vertical-align:middle;padding-left:14px;font-size:17px;font-weight:600;letter-spacing:5px;color:${C.goldText};">URBAN BEETLE</td>
    </tr></table>
  </td></tr>
  <tr><td style="height:2px;line-height:2px;font-size:0;background:${C.gold};">&nbsp;</td></tr>
  <tr><td style="padding:40px 36px 8px;">
    ${label(`Enquiry received &nbsp;·&nbsp; <span style="white-space:nowrap;">${esc(reference)}</span>`)}
    <h1 style="${serif}margin:0 0 20px;font-size:30px;line-height:1.2;font-weight:normal;color:${C.heading};">Thank you, ${esc(firstName)}.</h1>
    <p style="${font}margin:0 0 16px;font-size:16px;line-height:1.65;color:${C.text};">We've received your enquiry for <strong style="color:${C.heading};">${esc(e.company_name)}</strong>, and our team is already reviewing it.</p>
    <p style="${font}margin:0;font-size:16px;line-height:1.65;color:${C.text};">A member of our team will personally get back to you <strong style="color:${C.heading};">within 24 hours</strong>, by phone on ${esc(e.phone)} or by email.</p>
  </td></tr>
  <tr><td style="padding:28px 36px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.panel};border:1px solid ${C.line};border-radius:12px;">
      <tr><td style="padding:20px 24px 14px;">
        ${label("Your enquiry")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${summary.map(row).join("")}</table>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:28px 36px 4px;">
    ${label("What happens next")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${steps.map(step).join("")}</table>
  </td></tr>
  <tr><td style="padding:20px 36px 30px;">
    <p style="${font}margin:0;font-size:15px;line-height:1.65;color:${C.text};">Need to add something, like a deadline or a reference you love? Simply reply to this email, or <a href="${WHATSAPP_URL}" style="color:${C.goldText};font-weight:600;text-decoration:none;">message us on WhatsApp</a>.</p>
  </td></tr>
  <tr><td style="padding:0 36px 36px;">
    <p style="${font}margin:0 0 16px;font-size:15px;color:${C.text};">Warm regards,</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.panel};border:1px solid ${C.line};border-radius:12px;"><tr>
      <td class="sig-col sig-logo" width="220" style="padding:22px 16px;vertical-align:middle;text-align:center;">
        <a href="${SITE_URL}"><img src="${SITE_URL}/email/beetle-gold.png" width="39" height="64" alt="Urban Beetle" style="display:block;border:0;margin:0 auto 14px;"></a>
        <p style="${brand}margin:0;padding-left:4px;font-size:15px;font-weight:600;letter-spacing:4px;color:${C.heading};">URBAN BEETLE</p>
        <p style="${brand}margin:7px 0 0;padding-left:1px;font-size:9px;letter-spacing:1.2px;color:${C.muted};">CREATIVE MARKETING AGENCY</p>
        <p style="${brand}margin:12px 0 0;padding-left:1px;font-size:9px;letter-spacing:1.2px;color:${C.gold};">${esc(SIGNATURE.tagline.toUpperCase())}</p>
      </td>
      <td class="sig-col sig-details" style="padding:20px 22px;vertical-align:middle;border-left:1px solid ${C.gold};">
        <p style="${serif}margin:0 0 4px;font-size:21px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${C.heading};">${esc(SIGNATURE.name)}</p>
        <p style="${font}margin:0 0 12px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${C.gold};">${esc(SIGNATURE.title).replace("|", "&nbsp;|&nbsp;")}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">${SIGNATURE.contacts.map((c) => contact(c.icon, c.label, c.href)).join("")}</table>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:64px;height:10px;border-bottom:1px solid ${C.line};font-size:0;line-height:0;">&nbsp;</td></tr></table>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">${contact("location", SIGNATURE.location)}</table>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="background:${C.header};padding:22px 36px;border-top:1px solid ${C.line};">
    <p style="${font}margin:0 0 8px;font-size:13px;">${socials}</p>
    <p style="${font}margin:0;font-size:11.5px;line-height:1.6;color:${C.muted};">You're receiving this email because you submitted an enquiry at <a href="${SITE_URL}" style="color:${C.muted};">urbanbeetle.com</a>.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}

// Whether confirmation emails can be sent (the success screen only mentions one if so).
export const canEmail = () => Boolean(process.env.SMTP_PASSWORD);

// Best effort: a failed email must never fail the submission (the enquiry is already stored).
export async function sendConfirmationEmail(e: EnquiryInput, reference: string, photos: EnquiryPhoto[]) {
  const pass = process.env.SMTP_PASSWORD;
  if (!pass) {
    console.warn("[enquiry] Confirmation email skipped: SMTP_PASSWORD not set.");
    return false;
  }
  const user = process.env.SMTP_USER || FROM;
  const port = Number(process.env.SMTP_PORT) || 465;
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.titan.email",
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    const { subject, html, text } = confirmationEmail(e, reference, photos);
    await transport.sendMail({
      from: { name: site.name, address: user },
      to: { name: e.full_name, address: e.email },
      replyTo: user,
      subject,
      html,
      text,
    });
    console.info(`[enquiry] Confirmation email sent for ${reference}.`);
    return true;
  } catch (err) {
    console.error("[enquiry] Confirmation email failed:", err instanceof Error ? err.message : err);
    return false;
  }
}
