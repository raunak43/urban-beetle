// WhatsApp alert helpers (reads the WHATSAPP_* settings from .env.local):
//   npm run whatsapp:template   submits the alert template (lib/whatsapp-template.json) to Meta for approval
//   npm run whatsapp:status     shows whether Meta has approved it
//   npm run whatsapp:test       sends a sample alert to WHATSAPP_TO

import { readFileSync } from "node:fs";

try {
  process.loadEnvFile(".env.local");
} catch {}

const GRAPH = "https://graph.facebook.com/v23.0";
const t = JSON.parse(readFileSync(new URL("../lib/whatsapp-template.json", import.meta.url), "utf8"));
const env = process.env;

const need = (...names) => {
  const missing = names.filter((n) => !env[n]);
  if (missing.length) {
    console.error(`Add ${missing.join(", ")} to .env.local first (see README → WhatsApp alerts).`);
    process.exit(1);
  }
};

const api = async (path, body) => {
  const res = await fetch(`${GRAPH}/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}`, ...(body && { "Content-Type": "application/json" }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (json.error) {
    console.error(`WhatsApp error: ${json.error.error_user_msg ?? json.error.message} (code ${json.error.code})`);
    process.exit(1);
  }
  return json;
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
} else if (command === "status") {
  need("WHATSAPP_TOKEN", "WHATSAPP_BUSINESS_ACCOUNT_ID");
  const res = await api(
    `${env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates?name=${t.name}&fields=name,status,category,language,rejected_reason`,
  );
  const found = res.data?.filter((x) => x.name === t.name) ?? [];
  if (!found.length) console.log(`No template "${t.name}" yet. Submit it with: npm run whatsapp:template`);
  for (const x of found) {
    const reason = x.rejected_reason && x.rejected_reason !== "NONE" ? `, reason: ${x.rejected_reason}` : "";
    console.log(`${x.name} (${x.language}): ${x.status}, ${x.category}${reason}`);
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
} else {
  console.log("Usage: npm run whatsapp:template | npm run whatsapp:status | npm run whatsapp:test");
}
