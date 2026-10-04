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

### Environment variables

Copy `.env.example` to `.env.local` for local development, and add the same variables in Vercel → Project → Settings → Environment Variables before deploying.

### Telegram alerts

1. In Telegram, open **@BotFather**, send `/newbot`, and follow the prompts. Copy the token it gives you.
2. Create a Telegram group (e.g. "Urban Beetle Enquiries") and add your new bot to it. Send any message in the group.
3. Paste the token into `.env.local` as `TELEGRAM_BOT_TOKEN=...`
4. Run `npm run telegram:chat-id` and copy the `TELEGRAM_CHAT_ID=...` line it prints into `.env.local`.
5. Run `npm run telegram:test`. A test message should appear in the group.
6. Restart `npm run dev`. Every new enquiry is now posted to the group with the client's full details.

If Telegram is not configured or fails, enquiries are still stored. Alerts never block a submission.

## Changing the hero video

The hero plays the video as an image sequence (smoother than scrubbing a video file). To use a new video:

```bash
npm run frames -- assets/beetle-hero.mp4
```

This needs [ffmpeg](https://ffmpeg.org/) on your PATH (or `FFMPEG_PATH` pointing to it). It regenerates `public/frames/`, the beetle stills in `public/images/`, and `lib/frames.json`.

The script also paints the video generator's small corner logo out of every frame (the original video file is left untouched). The logo's area is set by `cornerMark` near the top of `scripts/extract-frames.mjs`; set it to `null` for a video without one.
