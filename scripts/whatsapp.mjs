// WhatsApp alert helpers (reads the WHATSAPP_* settings from .env.local):
//   npm run whatsapp:template         submits the alert template (lib/whatsapp-template.json) to Meta for approval
//   npm run whatsapp:photo-template   submits the business photo template (lib/whatsapp-photo-template.json)
//   npm run whatsapp:status           shows whether Meta has approved them
//   npm run whatsapp:test             sends a sample alert to WHATSAPP_TO
//   npm run whatsapp:test-photo       sends a sample business photo to WHATSAPP_TO

import { readFileSync } from "node:fs";

try {
  process.loadEnvFile(".env.local");
} catch {}

const GRAPH = "https://graph.facebook.com/v23.0";
const read = (file) => JSON.parse(readFileSync(new URL(`../lib/${file}`, import.meta.url), "utf8"));
const t = read("whatsapp-template.json");
const p = read("whatsapp-photo-template.json");
const env = process.env;

const need = (...names) => {
  const missing = names.filter((n) => !env[n]);
  if (missing.length) {
    console.error(`Add ${missing.join(", ")} to .env.local first (see README → WhatsApp alerts).`);
    process.exit(1);
  }
};

const check = (json) => {
  if (json.error) {
    console.error(`WhatsApp error: ${json.error.error_user_msg ?? json.error.message} (code ${json.error.code})`);
    process.exit(1);
  }
  return json;
};

const api = async (path, body) => {
  const res = await fetch(`${GRAPH}/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}`, ...(body && { "Content-Type": "application/json" }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return check(await res.json());
};

// A stand-in business photo: Meta's reviewers need a sample image for the photo template, and the
// test message needs something to show.
const samplePhoto = async () => {
  const { default: sharp } = await import("sharp");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
    <rect width="1200" height="800" fill="#141413"/>
    <rect x="40" y="40" width="1120" height="720" fill="none" stroke="#d4a94f" stroke-width="4"/>
    <text x="600" y="380" font-family="Arial" font-size="64" font-weight="bold" fill="#f3d68b" text-anchor="middle">Sample business photo</text>
    <text x="600" y="460" font-family="Arial" font-size="34" fill="#efe9dc" text-anchor="middle">Outside view, from a website enquiry</text>
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toBuffer();
};

// Template images go through Meta's resumable upload API, which returns a handle for the template.
const uploadTemplateImage = async (image) => {
  const app = await api("app");
  const session = await api(
    `${app.id}/uploads?file_name=sample-business-photo.jpg&file_length=${image.length}&file_type=image/jpeg`,
    {},
  );
  const res = await fetch(`${GRAPH}/${session.id}`, {
    method: "POST",
    headers: { Authorization: `OAuth ${env.WHATSAPP_TOKEN}`, file_offset: "0" },
    body: image,
  });
  return check(await res.json()).h;
};

// Message images go through the phone number's media endpoint, which returns a media ID.
const uploadMessageImage = async (image) => {
  const form = new FormData();
  form.set("messaging_product", "whatsapp");
  form.set("type", "image/jpeg");
  form.set("file", new Blob([image], { type: "image/jpeg" }), "sample-business-photo.jpg");
  const res = await fetch(`${GRAPH}/${env.WHATSAPP_PHONE_NUMBER_ID}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}` },
    body: form,
  });
  return check(await res.json()).id;
};

const command = process.argv[2];

if (command === "template") {
  need("WHATSAPP_TOKEN", "WHATSAPP_BUSINESS_ACCOUNT_ID");
  const res = await api(`${env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`, {
    name: t.name,
    language: t.language,
    category: t.category,
    components: [
      { type: "HEADER", format: "TEXT", text: t.header },
      { type: "BODY", text: t.body, example: { body_text: [t.example.body] } },
      { type: "FOOTER", text: t.footer },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: t.button.text, url: t.button.url, example: [t.button.url.replace("{{1}}", t.example.button)] },
        ],
      },
    ],
  });
  console.log(`Template "${t.name}" submitted (${res.status}, ${res.category}). Check approval with: npm run whatsapp:status`);
} else if (command === "photo-template") {
  need("WHATSAPP_TOKEN", "WHATSAPP_BUSINESS_ACCOUNT_ID");
  const handle = await uploadTemplateImage(await samplePhoto());
  const res = await api(`${env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`, {
    name: p.name,
    language: p.language,
    category: p.category,
    components: [
      { type: "HEADER", format: "IMAGE", example: { header_handle: [handle] } },
      { type: "BODY", text: p.body, example: { body_text: [p.example.body] } },
      { type: "FOOTER", text: p.footer },
    ],
  });
  console.log(`Template "${p.name}" submitted (${res.status}, ${res.category}). Check approval with: npm run whatsapp:status`);
} else if (command === "status") {
  need("WHATSAPP_TOKEN", "WHATSAPP_BUSINESS_ACCOUNT_ID");
  for (const name of [t.name, p.name]) {
    const res = await api(
      `${env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates?name=${name}&fields=name,status,category,language,rejected_reason`,
    );
    const found = res.data?.filter((x) => x.name === name) ?? [];
    if (!found.length) console.log(`No template "${name}" yet.`);
    for (const x of found) {
      const reason = x.rejected_reason && x.rejected_reason !== "NONE" ? `, reason: ${x.rejected_reason}` : "";
      console.log(`${x.name} (${x.language}): ${x.status}, ${x.category}${reason}`);
    }
  }
} else if (command === "test") {
  need("WHATSAPP_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_TO");
  await api(`${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    messaging_product: "whatsapp",
    to: env.WHATSAPP_TO,
    type: "template",
    template: {
      name: t.name,
      language: { code: t.language },
      components: [
        { type: "body", parameters: t.example.body.map((text) => ({ type: "text", text })) },
        { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: t.example.button }] },
      ],
    },
  });
  console.log("Sample alert sent. Check WhatsApp.");
} else if (command === "test-photo") {
  need("WHATSAPP_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_TO");
  const id = await uploadMessageImage(await samplePhoto());
  await api(`${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    messaging_product: "whatsapp",
    to: env.WHATSAPP_TO,
    type: "template",
    template: {
      name: p.name,
      language: { code: p.language },
      components: [
        { type: "header", parameters: [{ type: "image", image: { id } }] },
        { type: "body", parameters: p.example.body.map((text) => ({ type: "text", text })) },
      ],
    },
  });
  console.log("Sample business photo sent. Check WhatsApp.");
} else {
  console.log(
    "Usage: npm run whatsapp:template | whatsapp:photo-template | whatsapp:status | whatsapp:test | whatsapp:test-photo",
  );
}
