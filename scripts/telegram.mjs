// Telegram alert helpers (reads TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID from .env.local):
//   npm run telegram:chat-id   lists the groups your bot has been added to, with their chat IDs
//   npm run telegram:test      sends a test message to TELEGRAM_CHAT_ID

try {
  process.loadEnvFile(".env.local");
} catch {}

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Add TELEGRAM_BOT_TOKEN to .env.local first (see README → Telegram alerts).");
  process.exit(1);
}

const api = async (method, body) => {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
};

const command = process.argv[2];

if (command === "chat-id") {
  const me = await api("getMe");
  if (!me.ok) {
    console.error(`Telegram rejected the bot token: ${me.description}`);
    process.exit(1);
  }
  const updates = await api("getUpdates");
  const groups = new Map();
  for (const u of updates.result ?? []) {
    const msg = u.message ?? u.edited_message ?? u.channel_post;
    // A group upgraded to a supergroup gets a new ID; prefer the new one.
    if (msg?.migrate_to_chat_id) groups.set(msg.migrate_to_chat_id, { ...msg.chat, id: msg.migrate_to_chat_id });
    for (const chat of [msg?.chat, u.my_chat_member?.chat]) {
      if (chat && chat.type !== "private" && !groups.has(chat.id)) groups.set(chat.id, chat);
    }
  }
  if (!groups.size) {
    console.log(
      `No groups found for @${me.result.username} yet.\n` +
        `Add the bot to your group, send a message in the group (e.g. "hello"), then run this again.`,
    );
  } else {
    console.log(`Groups @${me.result.username} can post to:\n`);
    for (const g of groups.values()) console.log(`  ${g.title}\n  TELEGRAM_CHAT_ID=${g.id}\n`);
    console.log("Copy the TELEGRAM_CHAT_ID line into .env.local, then run: npm run telegram:test");
  }
} else if (command === "test") {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    console.error("Add TELEGRAM_CHAT_ID to .env.local first (run: npm run telegram:chat-id).");
    process.exit(1);
  }
  const res = await api("sendMessage", {
    chat_id: chatId,
    text: "🪲 Urban Beetle enquiry alerts are connected. New project enquiries will appear in this group.",
  });
  console.log(res.ok ? "Test message sent. Check your Telegram group." : `Telegram error: ${res.description}`);
} else {
  console.log("Usage: npm run telegram:chat-id | npm run telegram:test");
}
