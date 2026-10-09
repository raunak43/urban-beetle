// Builds public/og-image.jpg (1200×630): the picture shown when a link to the site is shared on
// WhatsApp, LinkedIn, Facebook or X. lib/seo.ts adds it to every page.
// It recreates the logo lockup: gold beetle, wide-tracked Montserrat wordmark, rule and tagline.
// Run with `npm run og` (needs internet once, to fetch the Montserrat font from Google Fonts).
import { readFile, writeFile } from "node:fs/promises";
import { ImageResponse } from "next/og.js";
import { createElement as h } from "react";
import sharp from "sharp";

const OUT = "public/og-image.jpg";
const GOLD = "linear-gradient(180deg, #fbe9b6 0%, #e2b960 38%, #a77c2c 68%, #e9c87a 100%)";

// Google Fonts serves TrueType (which the image renderer needs) to clients that don't ask for WOFF2.
async function montserrat(weight) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Montserrat:wght@${weight}`)).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
  if (!url) throw new Error(`No TrueType Montserrat ${weight} in Google Fonts' response`);
  return { name: "Montserrat", weight, style: "normal", data: await (await fetch(url)).arrayBuffer() };
}

const logo = `data:image/png;base64,${(await readFile("assets/logo-gold.png")).toString("base64")}`;

// Tracking also follows the last letter, so matching left padding keeps each line centred.
const tracked = (text, size, spacing, style) =>
  h("div", { style: { fontSize: size, letterSpacing: spacing, paddingLeft: spacing, ...style } }, text);

const card = h(
  "div",
  {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(ellipse 60% 70% at 50% 42%, #1d1709 0%, #0b0a08 55%, #070707 100%)",
      fontFamily: "Montserrat",
      color: "#efe9dc",
    },
  },
  h("img", { src: logo, width: 132, height: 215, style: { marginBottom: 34 } }),
  tracked("URBAN BEETLE", 84, 12, {
    fontWeight: 600,
    lineHeight: 1,
    backgroundImage: GOLD,
    backgroundClip: "text",
    color: "transparent",
  }),
  h("div", { style: { width: 64, height: 2, background: "#d4a94f", margin: "30px 0 26px" } }),
  tracked("CREATIVE MARKETING AGENCY", 24, 6, { fontWeight: 500, color: "#c9c0ad" }),
  tracked("STRATEGY · CREATIVITY · TECHNOLOGY", 17, 5, { fontWeight: 500, color: "#958e7f", marginTop: 16 }),
);

const png = await new ImageResponse(card, {
  width: 1200,
  height: 630,
  fonts: [await montserrat(500), await montserrat(600)],
}).arrayBuffer();

const jpg = await sharp(Buffer.from(png)).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
await writeFile(OUT, jpg);
console.log(`Wrote ${OUT} (1200×630, ${Math.round(jpg.length / 1024)} KB)`);
