import type { NextRequest } from "next/server";
import { sendTelegram } from "@/lib/telegram";

// Supabase pauses Free Plan projects after about a week without database activity, and a paused project
// takes the enquiry form down. Vercel calls this twice a day (vercel.json) so the database always gets a
// small, real query. If it doesn't answer, the team hears about it on Telegram.
export const dynamic = "force-dynamic";

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET(request: NextRequest) {
  // With CRON_SECRET set on Vercel, only Vercel's scheduler can run this. Without it anyone can, which is
  // harmless: it makes one tiny read.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`)
    return new Response("Unauthorized", { status: 401 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return Response.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });

  const rpc = (name: string, args: object) =>
    fetch(`${url}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

  let via = "keepalive";
  let problem: string | null = null;
  try {
    let res = await rpc("keepalive", {});
    // Until supabase/migrations/*_keepalive.sql has been run, reach the database through the form's own
    // function instead: it refuses a payload that isn't an object on its first line, so nothing is saved.
    if (res.status === 404) {
      via = "submit_enquiry";
      res = await rpc("submit_enquiry", { payload: "keepalive" });
      const answer = (await res.json().catch(() => ({}))) as { message?: string };
      if (answer.message !== "invalid_payload") problem = `unexpected answer (HTTP ${res.status})`;
    } else if (!res.ok) {
      problem = `HTTP ${res.status}`;
    }
  } catch (err) {
    problem = err instanceof Error ? err.message : String(err);
  }

  if (!problem) {
    console.info(`[keepalive] Supabase answered (${via}).`);
    return Response.json({ ok: true, via });
  }

  console.error(`[keepalive] Supabase didn't answer (${via}): ${problem}`);
  // Only the scheduled runs raise the alarm, so calling this URL by hand can't flood the Telegram group.
  if (request.headers.get("x-vercel-cron-schedule")) {
    const project = new URL(url).hostname.split(".")[0];
    await sendTelegram(
      [
        "⚠️ <b>Website database not responding</b>",
        "",
        `The twice-daily check couldn't reach Supabase (${escapeHtml(problem)}). New enquiries will fail until it's back.`,
        "",
        `If the project is paused, open it and click <b>Resume project</b>: https://supabase.com/dashboard/project/${project}`,
      ].join("\n"),
    );
  }
  return Response.json({ ok: false, error: "The database didn't answer." }, { status: 503 });
}
