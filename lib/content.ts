// All site copy lives here so it can be edited without touching layout code.
// Anything marked PLACEHOLDER must be replaced with real information before launch.

export const site = {
  name: "Urban Beetle",
  tagline: "A creative marketing agency",
  email: "support@urbanbeetle.com",
  generalEmail: "hello@urbanbeetle.com", // shown in the footer
  phone: "+91 83569 40351",
  location: "India", // PLACEHOLDER: city / studio address
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/urban.beetle/" },
    { label: "Facebook", href: "https://www.facebook.com/Urbanbeetle/" },
    { label: "YouTube", href: "https://www.youtube.com/@urbanbeetle" },
  ],
};

export const phoneHref = `tel:${site.phone.replace(/\s/g, "")}`;

// Social profiles open in a new tab so visitors don't lose the site.
export const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export const nav = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export const pillars = [
  {
    word: "Strategy",
    line: "Every move starts with a reason.",
    body: "Research, positioning and a plan that ties creative work to business goals.",
  },
  {
    word: "Creativity",
    line: "Ideas people actually remember.",
    body: "Identity, content and campaigns crafted to stop the scroll and stay in the mind.",
  },
  {
    word: "Technology",
    line: "Built to scale, measured to grow.",
    body: "Websites, automation, AI-assisted workflows and data that keeps every campaign sharp.",
  },
];

export const services = [
  {
    name: "Branding",
    body: "Naming, positioning, identity systems and brand guidelines that give a business a clear, ownable presence.",
    tags: ["Identity", "Positioning", "Guidelines"],
  },
  {
    name: "Website Design",
    body: "Cinematic, fast and conversion-focused websites designed and developed end to end.",
    tags: ["UX / UI", "Development", "E-commerce"],
  },
  {
    name: "Social Media",
    body: "Platform-native strategy, calendars and community management that build real audiences.",
    tags: ["Strategy", "Management", "Community"],
  },
  {
    name: "Content Creation",
    body: "Reels, films, motion and editorial content produced to feel premium on every screen.",
    tags: ["Video", "Motion", "Copy"],
  },
  {
    name: "Paid Advertising",
    body: "Performance campaigns across Meta and Google, tested, tracked and optimised for return.",
    tags: ["Meta Ads", "Google Ads", "Analytics"],
  },
  {
    name: "Photography",
    body: "Product, food, fashion and campaign photography with an art-directed, editorial eye.",
    tags: ["Product", "Campaign", "Editorial"],
  },
  {
    name: "SEO",
    body: "Technical, on-page and content SEO that compounds visibility month after month.",
    tags: ["Technical", "Content", "Local"],
  },
  {
    name: "Influencer Marketing",
    body: "Creator partnerships matched to your audience, managed from brief to results.",
    tags: ["Creators", "Campaigns", "UGC"],
  },
  {
    name: "Creative Design",
    body: "Campaign key visuals, packaging, print and digital design with a consistent signature.",
    tags: ["Campaigns", "Packaging", "Print"],
  },
];

// PLACEHOLDER: descriptions and services are generic; replace with the real project details.
export const work = [
  {
    slug: "rc-mega",
    name: "RC Mega",
    mark: "RC",
    year: "2025",
    services: ["Brand identity", "Social media", "Campaign"],
    line: "A bold identity and launch campaign built for presence and pace.",
    accent: "#c4483e",
  },
  {
    slug: "dosahub",
    name: "DosaHub",
    mark: "DH",
    year: "2025",
    services: ["Branding", "Food photography", "Social media"],
    line: "Turning a much-loved food concept into a brand people crave.",
    accent: "#e0a43a",
  },
  {
    slug: "yaro-fashion",
    name: "Yaro Fashion",
    mark: "Y",
    year: "2024",
    services: ["Art direction", "Campaign shoot", "E-commerce"],
    line: "An editorial fashion language, from lookbook to storefront.",
    accent: "#d9b9a5",
  },
];

export const reasons = [
  {
    title: "One team, every discipline",
    body: "Strategists, designers, creators, developers and media buyers working as one unit, not a chain of handoffs.",
  },
  {
    title: "Craft without compromise",
    body: "We obsess over the details most agencies skip, because that is what makes a brand feel expensive.",
  },
  {
    title: "Measured, not guessed",
    body: "Every campaign is tracked against clear goals, and we report in plain language.",
  },
  {
    title: "Built for momentum",
    body: "Fast, focused sprints that keep your brand moving while competitors are still in meetings.",
  },
  {
    title: "AI-accelerated",
    body: "Modern tools in our workflow mean more ideas tested, faster production and sharper targeting.",
  },
  {
    title: "Partners, not vendors",
    body: "We think like owners of your growth and stay with you long after launch day.",
  },
];

export const beetleTraits = [
  { word: "Movement", body: "Brands that stand still get forgotten. We keep yours in motion." },
  { word: "Adaptability", body: "Platforms change overnight. We adapt faster." },
  { word: "Strength", body: "Strategy that carries many times its weight." },
  { word: "Transformation", body: "Ordinary businesses, rebuilt into memorable brands." },
];

export const process = [
  {
    step: "Discover",
    body: "Deep-dive workshops, market and competitor research, and a clear read on your audience.",
  },
  {
    step: "Strategise",
    body: "Positioning, messaging and a channel plan with measurable goals for every move.",
  },
  {
    step: "Create",
    body: "Identity, content, campaigns and digital experiences crafted to the highest standard.",
  },
  {
    step: "Launch",
    body: "Coordinated roll-out across web, social and paid media, with tracking in place from day one.",
  },
  {
    step: "Evolve",
    body: "Continuous testing, reporting and refinement so results keep compounding.",
  },
];

export const tech = [
  { title: "AI-assisted research", body: "Audience, trend and competitor insight in days, not weeks." },
  { title: "Generative production", body: "Faster concepting and content variations, always finished by human craft." },
  { title: "Marketing automation", body: "Journeys, CRM flows and lead capture that work while you sleep." },
  { title: "Performance analytics", body: "Live dashboards that connect creative work to revenue." },
  { title: "Modern web stack", body: "Fast, secure, scalable websites built on current frameworks." },
  { title: "Creative testing", body: "Structured experiments to find the ads and messages that win." },
];

// PLACEHOLDER: replace with the agency's real numbers.
export const results = [
  { value: 120, suffix: "+", label: "Brands moved" },
  { value: 500, suffix: "+", label: "Campaigns launched" },
  { value: 40, suffix: "M+", label: "Impressions generated" },
  { value: 6, suffix: "", label: "Years of momentum" },
];

// PLACEHOLDER: these quotes are sample copy. Replace with real, approved client testimonials.
export const testimonials = [
  {
    quote:
      "Urban Beetle did not just redesign our brand, they gave it a personality. Customers recognise us instantly now.",
    name: "Founder",
    role: "Restaurant brand",
  },
  {
    quote:
      "The content quality jumped overnight. Our social channels finally look like the premium label we always wanted to be.",
    name: "Creative Director",
    role: "Fashion label",
  },
  {
    quote:
      "Strategy, creative and ads under one roof, and every rupee is accounted for. It is the partnership we were missing.",
    name: "Managing Director",
    role: "Retail business",
  },
];

