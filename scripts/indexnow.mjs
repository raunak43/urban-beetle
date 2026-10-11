// Tells Bing (which powers ChatGPT's web search), Yandex and other IndexNow search engines about every page
// in the live sitemap, so new or changed pages are crawled within hours instead of weeks.
// Run after a deploy that adds or changes pages: `npm run indexnow`.
// The key isn't a secret: IndexNow checks it at https://urbanbeetle.com/<key>.txt (public/<key>.txt).

const SITE = "https://urbanbeetle.com";
const KEY = "3ab3a0408b109ae5325517b2ca44b825";

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (!urlList.length) throw new Error("No URLs found in the live sitemap.");

const keyFile = await fetch(`${SITE}/${KEY}.txt`);
if (!keyFile.ok || (await keyFile.text()).trim() !== KEY)
  throw new Error(`${SITE}/${KEY}.txt isn't live yet. Deploy first, then run this again.`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
// 200 = accepted, 202 = accepted and the key is still being verified.
console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs`);
if (!res.ok) {
  console.log(await res.text());
  process.exit(1);
}
