// All site copy lives here so it can be edited without touching layout code.
// Anything marked PLACEHOLDER must be replaced with real information before launch.

export const site = {
  name: "Urban Beetle",
  tagline: "A creative marketing agency",
  // The one address search engines should index (canonical links, sitemap, structured data).
  url: "https://urbanbeetle.com",
  email: "support@urbanbeetle.com",
  generalEmail: "hello@urbanbeetle.com", // shown in the Contact section and footer
  phone: "+91 83569 40351",
  location: "Kalyan, Maharashtra, India",
  // Structured version of `location` for search engines (schema.org PostalAddress).
  address: { locality: "Kalyan", region: "Maharashtra", country: "IN" },
  founder: { name: "Raunak Gupta", role: "Founder" },
  // Where clients come from, named on the service pages and in the data search engines read.
  serviceAreas: ["Kalyan", "Dombivli", "Thane", "Navi Mumbai", "Mumbai"],
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/urban.beetle/" },
    { label: "Facebook", href: "https://www.facebook.com/Urbanbeetle/" },
    { label: "YouTube", href: "https://www.youtube.com/@urbanbeetle" },
  ],
};

export const phoneHref = `tel:${site.phone.replace(/\s/g, "")}`;

// "Chat on WhatsApp" links open a chat with the studio's number with this message already typed,
// so the visitor only has to tap Send.
export const whatsappMessage =
  "Hi Urban Beetle! I came across your website and I'd like to know more about your marketing services for my business.";
export const whatsappHref = `https://wa.me/${site.phone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;

// Social profiles open in a new tab so visitors don't lose the site.
export const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export const nav = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

// Photos are cut from assets/pillars.webp by `npm run pillars`.
export const pillars = [
  {
    word: "Strategy",
    line: "Every move starts with a reason.",
    body: "Research, positioning and a plan that ties creative work to business goals.",
    image: "/images/pillars/strategy.webp",
    alt: "Urban Beetle notebook on a desk beside brand strategy sketches of positioning, target audience, messaging and channel plan",
    icon: "ring",
  },
  {
    word: "Creativity",
    line: "Ideas people actually remember.",
    body: "Identity, content and campaigns crafted to stop the scroll and stay in the mind.",
    image: "/images/pillars/creativity.webp",
    alt: "Video editing suite showing the golden Urban Beetle on screen, with a camera and a phone preview on the desk",
    icon: "ring",
  },
  {
    word: "Technology",
    line: "Built to scale, measured to grow.",
    body: "Websites, automation, AI-assisted workflows and data that keeps every campaign sharp.",
    image: "/images/pillars/technology.webp",
    alt: "Laptop showing an AI creative dashboard with the golden beetle, surrounded by panels for AI images, video, automation and analytics",
    icon: "spark",
  },
] as const;

// Each service has its own page at /services/<slug>; that page's copy lives in lib/service-pages.ts.
export const services = [
  {
    name: "Branding",
    slug: "branding",
    body: "Naming, positioning, identity systems and brand guidelines that give a business a clear, ownable presence.",
    tags: ["Identity", "Positioning", "Guidelines"],
  },
  {
    name: "Website Design",
    slug: "website-design",
    body: "Cinematic, fast and conversion-focused websites designed and developed end to end.",
    tags: ["UX / UI", "Development", "E-commerce"],
  },
  {
    name: "Social Media",
    slug: "social-media-marketing",
    body: "Platform-native strategy, calendars and community management that build real audiences.",
    tags: ["Strategy", "Management", "Community"],
  },
  {
    name: "Content Creation",
    slug: "content-creation",
    body: "Reels, films, motion and editorial content produced to feel premium on every screen.",
    tags: ["Video", "Motion", "Copy"],
  },
  {
    name: "Paid Advertising",
    slug: "paid-advertising",
    body: "Performance campaigns across Meta and Google, tested, tracked and optimised for return.",
    tags: ["Meta Ads", "Google Ads", "Analytics"],
  },
  {
    name: "Photography",
    slug: "photography",
    body: "Product, food, fashion and campaign photography with an art-directed, editorial eye.",
    tags: ["Product", "Campaign", "Editorial"],
  },
  {
    name: "SEO",
    slug: "seo",
    body: "Technical, on-page and content SEO that compounds visibility month after month.",
    tags: ["Technical", "Content", "Local"],
  },
  {
    name: "Influencer Marketing",
    slug: "influencer-marketing",
    body: "Creator partnerships matched to your audience, managed from brief to results.",
    tags: ["Creators", "Campaigns", "UGC"],
  },
  {
    name: "Creative Design",
    slug: "creative-design",
    body: "Campaign key visuals, packaging, print and digital design with a consistent signature.",
    tags: ["Campaigns", "Packaging", "Print"],
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

// Real, approved client testimonials only (invented reviews mislead visitors and break India's consumer rules).
// The "Client voices" section stays hidden while this list is empty. Add entries like:
//   { quote: "What the client said.", name: "Priya Shah", role: "Founder, Sunrise Bakery" },
export const testimonials: { quote: string; name: string; role: string }[] = [];

// Questions people ask before enquiring, answered on the home page (and given to search engines as FAQ data).
export const faqs = [
  {
    q: "What does Urban Beetle do?",
    a: "We're a creative marketing agency. We help businesses grow through branding, website design, social media, content and reels, Google and Meta ads, photography, SEO, influencer marketing and graphic design, either as single services or as one joined-up plan.",
  },
  {
    q: "Where are you based, and which areas do you serve?",
    a: "We're based in Kalyan, Maharashtra, and work with businesses in Dombivli, Thane, Navi Mumbai and Mumbai, and with brands across India, in person or online.",
  },
  {
    q: "How much do your services cost?",
    a: "Every project is priced on its scope, so there's no one-size price list. Share your goals and budget range in the enquiry form, and we'll send a clear proposal with exactly what's included.",
  },
  {
    q: "Can we start with just one service?",
    a: "Yes. You can start with a single service, such as a website or social media management, and add more as your business grows.",
  },
  {
    q: "How soon will you get back to me?",
    a: "Within 24 hours. A member of our team will reply personally by phone, WhatsApp or email.",
  },
  {
    q: "How long before we see results?",
    a: "It depends on the service. Ads can bring enquiries within days, social media usually builds over three to six months, and SEO compounds over months. We agree goals up front and report on them clearly.",
  },
  {
    q: "How do we get started?",
    a: "Fill in the project enquiry form, which takes about five minutes, or message us on WhatsApp. We'll set up a short call to understand your business and goals.",
  },
];

