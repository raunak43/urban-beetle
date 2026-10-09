# urban-beetle

Cinematic website for Urban Beetle, a creative marketing agency. Built with Next.js, GSAP ScrollTrigger and Lenis smooth scrolling.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Where things live

| What | Where |
| --- | --- |
| All text, services, projects, stats, testimonials, contact details | `lib/content.ts` |
| Page section order | `app/page.tsx` |
| Colours, fonts, layout, responsive rules | `app/globals.css` |
| Scroll-driven beetle video (hero) | `components/HeroSequence.tsx` |
| Logo mark | `components/BeetleMark.tsx` |

Anything marked `PLACEHOLDER` in `lib/content.ts` (stats, testimonials, contact details, project descriptions) must be replaced with real information before launch.

## Client enquiry system (/enquiry)

Every "Start a project" button leads to `/enquiry`. Submissions go to `app/api/enquiry/route.ts`, which validates them, filters spam (hidden honeypot field, minimum fill time, link limits, rate limits) and stores them in the Supabase project **kitkreckzfccjvcxkifg** (`https://kitkreckzfccjvcxkifg.supabase.co`) through the `submit_enquiry` database function.

- **Security:** visitors' browsers never talk to Supabase. Row Level Security blocks all reads; the public key can only call `submit_enquiry` (validated, rate-limited). No secret keys are used anywhere.
- **Database:** schema in `supabase/migrations/`. Tables: `client_enquiries`, `enquiry_notes`, `enquiry_status_history` (auto-logged), `team_members` (for the future admin dashboard; team members can read enquiries and change only `enquiry_status` / `assigned_to`).
- **Statuses:** `new` → `contacted` → `qualified` → `proposal_sent` → `converted` / `closed`.
- **View enquiries:** [Supabase Table Editor](https://supabase.com/dashboard/project/kitkreckzfccjvcxkifg/editor) → `client_enquiries`.
- **New Supabase project?** Run the file in `supabase/migrations/` in that project's SQL Editor, then update `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.

### Spam protection (Cloudflare Turnstile)

A Cloudflare security check sits under the last question, above the Submit button. Cloudflare passes most real visitors by itself and asks for a click only when something looks automated. The API asks Cloudflare whether each enquiry's one-time token is genuine before saving anything, so bots that post to the API directly are refused too. This is on top of the existing hidden field, minimum fill time, link limit and rate limit.

1. At [dash.cloudflare.com](https://dash.cloudflare.com) (a free account works; the domain doesn't need to be on Cloudflare), open **Turnstile → Add widget**. Name it, add the hostname `urbanbeetle.com`, choose **Managed**, and create it.
2. Put the **Site Key** in `TURNSTILE_SITE_KEY` and the **Secret Key** in `TURNSTILE_SECRET_KEY`, in `.env.local` and on Vercel (mark the secret as sensitive). Then redeploy.

The check is on only when both keys are set; without them the form works as before. For local testing, use Cloudflare's [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/). The logic lives in `lib/turnstile.ts` (server) and `components/enquiry/Turnstile.tsx` (widget).

### Business photos

Step 05 of the form lets clients add one photo of the outside of their business and up to three of the inside (optional). Photos must be at least **800 × 600 pixels** (either way round) and up to 30 MB each; panoramas wider than 4:1 are refused. Vercel rejects requests over 4.5 MB, so the visitor's browser shrinks each photo before upload: upright, at most 2048 px and 1 MB as a JPEG, with camera details such as GPS location removed. The API checks every photo again, then posts them to the Telegram group as an album replying to the enquiry alert (as image files if Telegram refuses them as photos), and to WhatsApp as one message per photo after the alert. Photos are not stored in Supabase, so the copies in Telegram and WhatsApp are the only ones. The rules live in `lib/photos.ts`.

### Confirmation email

Every client who submits the form gets a branded confirmation email from **hello@urbanbeetle.com**. It thanks them, promises a reply within 24 hours, summarises their enquiry and ends with Raunak's signature. It's designed dark, in black and gold, because phone mail apps in dark mode recolour light emails (Gmail on Android even inverts small dark images). Its images in `public/email/` (`beetle-gold.png`, `gold-*.png`) are gold on transparent backgrounds so nothing recolours them; the older files there stay because emails already sent still load them. The email is sent through the Titan mailbox over SMTP (`smtp.titan.email`, port 465), so replies land in that inbox. Set `SMTP_PASSWORD` to the mailbox's password in `.env.local` and on Vercel (as a sensitive variable), then redeploy. Without it, enquiries work as before, no email is sent, and the thank-you screen doesn't mention one. The wording and signature live in `lib/email.ts`.

### Environment variables

Copy `.env.example` to `.env.local` for local development, and add the same variables in Vercel → Project → Settings → Environment Variables before deploying.

### Telegram alerts

1. In Telegram, open **@BotFather**, send `/newbot`, and follow the prompts. Copy the token it gives you.
2. Create a Telegram group (e.g. "Urban Beetle Enquiries") and add your new bot to it. Send any message in the group.
3. Paste the token into `.env.local` as `TELEGRAM_BOT_TOKEN=...`
4. Run `npm run telegram:chat-id` and copy the `TELEGRAM_CHAT_ID=...` line it prints into `.env.local`.
5. Run `npm run telegram:test`. A test message should appear in the group.
6. Restart `npm run dev`. Every new enquiry is now posted to the group with the client's full details, followed by their business photos.

If Telegram is not configured or fails, enquiries are still stored. Alerts never block a submission.

### WhatsApp alerts

Each new enquiry is also sent to the business WhatsApp (`WHATSAPP_TO`) as a short alert with a **Chat with client** button, followed by any business photos (a template holds one image, so each photo is its own message). Meta doesn't allow WhatsApp links in buttons, so the button opens `urbanbeetle.com/chat/<number>`, which forwards to `wa.me` (see `next.config.ts`). WhatsApp won't let a number message itself, so the alerts come from Meta's free test number, which may send unlimited messages to up to 5 verified numbers.

1. At [developers.facebook.com](https://developers.facebook.com/apps), create an app with the **Connect with customers through WhatsApp** use case.
2. On its **Quickstart / API Setup** page, add the business number as a **To** recipient and enter the code WhatsApp sends to it. Note the test number's **Phone number ID** and the **WhatsApp Business Account ID**.
3. In [Business Settings → System users](https://business.facebook.com/settings/system-users), add an admin system user, assign it the app and the WhatsApp account (full control), and generate a token that never expires with `business_management`, `whatsapp_business_management` and `whatsapp_business_messaging`.
4. Put `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID` and `WHATSAPP_TO` (digits with country code, e.g. `918356940351`) in `.env.local`.
5. Run `npm run whatsapp:template` and `npm run whatsapp:photo-template`, wait until `npm run whatsapp:status` says both are `APPROVED`, then run `npm run whatsapp:test` and `npm run whatsapp:test-photo`. Until the photo template is approved, alerts still arrive and the photos are skipped (the log shows error 132001).
6. Add `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_TO` to Vercel and redeploy.

The alert's wording lives in `lib/whatsapp-template.json`, the photo message's in `lib/whatsapp-photo-template.json`. Meta must approve any change, so give an edited template a new `name` and submit it again. To send from your own second number later, register it in the same app, then repeat steps 4–6 with its IDs (templates don't carry over from the test number).

## Search engines (SEO)

- **Page titles and descriptions:** `metadata` in `app/layout.tsx` (home page and defaults) and in each page file. Every page sets its own canonical link with `alternates.canonical`.
- **Sitemap and robots:** `app/sitemap.ts` (served as `/sitemap.xml`; add every new page here) and `app/robots.ts` (`/robots.txt`).
- **Structured data and sharing:** `lib/seo.ts` holds the schema.org Organization and WebSite data and the share-preview defaults. The share image is `public/og-image.jpg`; rebuild it from the logo with `npm run og`.
- **One address:** `urban-beetle.vercel.app` redirects to `urbanbeetle.com` (see `next.config.ts`), so Google indexes only the real domain.

## Changing the hero video

The hero plays the video as an image sequence (smoother than scrubbing a video file). To use a new video:

```bash
npm run frames -- assets/beetle-hero.mp4
```

This needs [ffmpeg](https://ffmpeg.org/) on your PATH (or `FFMPEG_PATH` pointing to it). It regenerates `public/frames/`, the beetle stills in `public/images/`, and `lib/frames.json`.

The script also paints the video generator's small corner logo out of every frame (the original video file is left untouched). The logo's area is set by `cornerMark` near the top of `scripts/extract-frames.mjs`; set it to `null` for a video without one.

## Changing the Strategy / Creativity / Technology photos

The three photo cards are cut from one designed image, `assets/pillars.webp` (three side-by-side panels). After replacing it, run:

```bash
npm run pillars
```

This keeps each panel's photo above its printed headline, paints out the printed number mark (the page draws its own), and writes `public/images/pillars/`. The panel positions and crop are set at the top of `scripts/pillar-images.mjs`.
