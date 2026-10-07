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

// The Titan email signature, rebuilt in HTML so its links work. The logo block and icons are cut
// from the signature image (public/email/).
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
  const row = ([label, value]: [string, string]) =>
    `<tr><td style="${font}padding:7px 0;width:110px;vertical-align:top;font-size:13px;color:#7a7264;">${esc(label)}</td>` +
    `<td style="${font}padding:7px 0;vertical-align:top;font-size:14px;color:#1c1a17;font-weight:600;">${esc(value)}</td></tr>`;
  const step = (s: string, i: number) =>
    `<tr><td style="${serif}width:34px;vertical-align:top;padding:6px 0;font-size:18px;color:#a67c2e;">0${i + 1}</td>` +
    `<td style="${font}vertical-align:top;padding:8px 0;font-size:15px;line-height:1.55;color:#3a362f;">${esc(s)}</td></tr>`;
  const contact = (icon: string, label: string, href?: string) =>
    `<tr><td width="24" style="padding:5px 0;vertical-align:middle;"><img src="${SITE_URL}/email/icon-${icon}.png" width="17" height="17" alt="" style="display:block;border:0;"></td>` +
    `<td width="18" style="${font}padding:5px 0;vertical-align:middle;font-size:14px;color:#c9a24f;">|</td>` +
    `<td style="${font}padding:5px 0;vertical-align:middle;font-size:14px;color:#1c1a17;">` +
    (href ? `<a href="${href}" style="color:#1c1a17;text-decoration:none;">${esc(label)}</a>` : esc(label)) +
    `</td></tr>`;
  const socials = site.socials
    .map((s) => `<a href="${s.href}" style="color:#e2b960;text-decoration:none;">${esc(s.label)}</a>`)
    .join(`<span style="color:#5c564b;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(subject)}</title>
<style>
  @media (max-width: 520px) {
    .sig-col { display: block !important; width: auto !important; }
    .sig-details { border-left: 0 !important; border-top: 2px solid #b8913f !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f4f1ea;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f1ea;">
<tr><td align="center" style="padding:32px 14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
  <tr><td style="background:#0b0b0a;padding:26px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:middle;"><img src="${SITE_URL}/apple-icon.png" width="52" height="52" alt="" style="display:block;border:0;border-radius:12px;"></td>
      <td style="${serif}vertical-align:middle;padding-left:12px;font-size:19px;letter-spacing:5px;color:#e2b960;">URBAN BEETLE</td>
    </tr></table>
  </td></tr>
  <tr><td style="height:3px;line-height:3px;font-size:0;background:#d4a94f;">&nbsp;</td></tr>
  <tr><td style="padding:40px 36px 8px;">
    <p style="${font}margin:0 0 10px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#a67c2e;">Enquiry received &nbsp;·&nbsp; ${esc(reference)}</p>
    <h1 style="${serif}margin:0 0 20px;font-size:30px;line-height:1.2;font-weight:normal;color:#0b0b0a;">Thank you, ${esc(firstName)}.</h1>
    <p style="${font}margin:0 0 16px;font-size:16px;line-height:1.65;color:#3a362f;">We've received your enquiry for <strong style="color:#1c1a17;">${esc(e.company_name)}</strong>, and our team is already reviewing it.</p>
    <p style="${font}margin:0;font-size:16px;line-height:1.65;color:#3a362f;">A member of our team will personally get back to you <strong style="color:#1c1a17;">within 24 hours</strong>, by phone on ${esc(e.phone)} or by email.</p>
  </td></tr>
  <tr><td style="padding:28px 36px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf7f0;border:1px solid #ecdfc4;border-radius:12px;">
      <tr><td style="padding:20px 24px 14px;">
        <p style="${font}margin:0 0 8px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#a67c2e;">Your enquiry</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${summary.map(row).join("")}</table>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:28px 36px 4px;">
    <p style="${font}margin:0 0 8px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#a67c2e;">What happens next</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${steps.map(step).join("")}</table>
  </td></tr>
  <tr><td style="padding:20px 36px 30px;">
    <p style="${font}margin:0;font-size:15px;line-height:1.65;color:#3a362f;">Need to add something, like a deadline or a reference you love? Simply reply to this email, or <a href="${WHATSAPP_URL}" style="color:#a67c2e;font-weight:600;text-decoration:none;">message us on WhatsApp</a>.</p>
  </td></tr>
  <tr><td style="padding:0 36px 36px;">
    <p style="${font}margin:0 0 16px;font-size:15px;color:#3a362f;">Warm regards,</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f6ec;border-radius:12px;"><tr>
      <td class="sig-col sig-logo" width="196" style="padding:20px 16px 20px 20px;vertical-align:middle;text-align:center;">
        <a href="${SITE_URL}"><img src="${SITE_URL}/email/signature-logo.jpg" width="176" alt="Urban Beetle, creative marketing agency. ${esc(SIGNATURE.tagline)}" style="display:block;width:176px;max-width:100%;height:auto;border:0;margin:0 auto;"></a>
      </td>
      <td class="sig-col sig-details" style="padding:20px 22px;vertical-align:middle;border-left:2px solid #b8913f;">
        <p style="${serif}margin:0 0 4px;font-size:21px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#11131a;">${esc(SIGNATURE.name)}</p>
        <p style="${font}margin:0 0 12px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#a67c2e;">${esc(SIGNATURE.title).replace("|", "&nbsp;|&nbsp;")}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">${SIGNATURE.contacts.map((c) => contact(c.icon, c.label, c.href)).join("")}</table>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:64px;height:10px;border-bottom:1px solid #c9a24f;font-size:0;line-height:0;">&nbsp;</td></tr></table>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">${contact("location", SIGNATURE.location)}</table>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#0b0b0a;padding:22px 36px;">
    <p style="${font}margin:0 0 8px;font-size:13px;">${socials}</p>
    <p style="${font}margin:0;font-size:11.5px;line-height:1.6;color:#8a8376;">You're receiving this email because you submitted an enquiry at <a href="${SITE_URL}" style="color:#8a8376;">urbanbeetle.com</a>.</p>
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
