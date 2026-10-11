// Copy for the service pages at /services/<slug> (one per entry in `services` in lib/content.ts). Each page
// targets what people search for, e.g. "social media marketing agency in Kalyan", so keep the titles and
// headings plain and specific. A shared "Do you only work in Kalyan?" answer is added to every page.

export type ServicePage = {
  /** The page title in search results, before " | Urban Beetle". */
  title: string;
  /** The main heading, which ends with "Kalyan". */
  heading: string;
  /** The search-result description (about 150 characters). */
  description: string;
  intro: string;
  included: { title: string; body: string }[];
  idealFor: string[];
  faqs: { q: string; a: string }[];
};

export const servicePages: Record<string, ServicePage> = {
  branding: {
    title: "Branding Agency in Kalyan",
    heading: "Branding agency in",
    description:
      "Urban Beetle is a branding agency in Kalyan: positioning, naming, logo and identity design, and brand guidelines for businesses that want to be remembered.",
    intro:
      "Your brand is the first thing people judge and the last thing they forget. We build brands for businesses in Kalyan and beyond: a clear position, a name and identity that fit it, and guidelines that keep every touchpoint consistent.",
    included: [
      {
        title: "Brand strategy & positioning",
        body: "Research into your market, competitors and customers, distilled into what you stand for and why people should choose you.",
      },
      { title: "Naming", body: "Business, product and campaign names that are memorable, easy to say and checked for availability." },
      {
        title: "Logo & identity system",
        body: "Logo, colours, typography and visual elements designed to work everywhere, from a shop sign to an Instagram profile.",
      },
      { title: "Voice & messaging", body: "How your brand speaks: key messages, tone of voice and the words you use and avoid." },
      { title: "Brand guidelines", body: "A clear guide so your team, printers and partners always apply the brand correctly." },
      {
        title: "Launch & rebrand rollout",
        body: "Stationery, signage, packaging, social profiles and website updated together, so the new brand lands at once.",
      },
    ],
    idealFor: [
      "New businesses that need a brand from day one",
      "Established businesses that have outgrown their look",
      "Brands that look different on every platform",
      "Founders preparing to expand or open new outlets",
    ],
    faqs: [
      {
        q: "How long does a branding project take?",
        a: "Most branding projects take three to six weeks, depending on whether research and naming are included. We agree the timeline before we start.",
      },
      {
        q: "Do you only design logos?",
        a: "A logo is one part of a brand. We start with strategy and positioning, then design the full identity and guidelines around it, so everything works together.",
      },
      {
        q: "Can you rebrand an existing business without losing recognition?",
        a: "Yes. We look at what your customers already recognise and keep what is worth keeping, while modernising the rest.",
      },
    ],
  },

  "website-design": {
    title: "Website Design Company in Kalyan",
    heading: "Website design company in",
    description:
      "Website design and development in Kalyan: fast, mobile-first, SEO-ready websites and online stores built to turn visitors into enquiries and sales.",
    intro:
      "Your website works for you around the clock, or against you. We design and build fast, mobile-first websites for businesses in Kalyan that look premium, load quickly and turn visitors into enquiries.",
    included: [
      { title: "Planning & structure", body: "Pages, content and journeys planned around what your customers need to decide." },
      { title: "Custom design", body: "A design made for your brand rather than a template, built for phones first." },
      {
        title: "Development",
        body: "Clean, fast code, with enquiry forms, WhatsApp and instant lead alerts set up so no enquiry is missed.",
      },
      { title: "Online stores", body: "E-commerce with secure payments, product management and order notifications." },
      {
        title: "SEO foundations",
        body: "Page titles, structured data, a sitemap and speed optimisation built in from day one, so Google can find you.",
      },
      { title: "Care after launch", body: "Hosting setup, security, backups and updates once your site is live." },
    ],
    idealFor: [
      "Businesses without a website, or with a slow or outdated one",
      "Shops ready to sell online",
      "Service businesses that rely on enquiries and calls",
      "Brands whose website doesn't match their quality",
    ],
    faqs: [
      {
        q: "How long does it take to build a website?",
        a: "A business website usually takes two to six weeks, and an online store a little longer. The timeline depends on the number of pages and features.",
      },
      {
        q: "Will my website work well on mobile phones?",
        a: "Yes. Most people browse on their phones, so we design for mobile first and test on real devices before launch.",
      },
      {
        q: "Will my website show up on Google?",
        a: "Every site we build has SEO foundations: fast loading, proper page titles, structured data and a sitemap submitted to Google. Ranking for competitive searches also takes content and local SEO, which we can handle too.",
      },
    ],
  },

  "social-media-marketing": {
    title: "Social Media Marketing Agency in Kalyan",
    heading: "Social media marketing agency in",
    description:
      "Social media marketing in Kalyan: Instagram and Facebook strategy, content calendars, reels and community management that build a real audience.",
    intro:
      "Posting is easy. Growing an audience that buys from you is not. We plan, create and manage social media for businesses in Kalyan, with content made for each platform and reports you can actually understand.",
    included: [
      { title: "Strategy", body: "Who you're talking to, what to post and which platforms matter for your business." },
      { title: "Content calendar", body: "Posts, reels and stories planned a month ahead and approved by you." },
      { title: "Reels & creatives", body: "Short-form video, carousels and graphics designed to stop the scroll." },
      { title: "Account management", body: "Posting, captions, hashtags and profile optimisation handled for you." },
      { title: "Community management", body: "Replies to comments and messages, so customers feel heard." },
      { title: "Monthly reports", body: "Reach, engagement, followers and enquiries, explained in plain language." },
    ],
    idealFor: [
      "Restaurants, cafés and retail stores",
      "Clinics, salons and other service businesses",
      "Brands that post regularly but see little result",
      "Owners who don't have time to manage social media",
    ],
    faqs: [
      {
        q: "Which platforms do you manage?",
        a: "Mainly Instagram and Facebook, plus YouTube and LinkedIn where they suit your business. We recommend the platforms your customers actually use.",
      },
      {
        q: "How often will you post?",
        a: "It depends on your goals and plan. Most businesses do well with three to five posts or reels a week, plus stories.",
      },
      {
        q: "How long before we see results?",
        a: "Engagement usually improves within the first month. Steady growth in followers and enquiries typically builds over three to six months of consistent posting.",
      },
    ],
  },

  "content-creation": {
    title: "Content Creation Agency in Kalyan",
    heading: "Content creation agency in",
    description:
      "Content creation in Kalyan: reels, brand films, motion graphics and copywriting, produced to feel premium on every screen and platform.",
    intro:
      "Attention is won in the first second. We script, shoot and edit reels, brand films and motion content for businesses in Kalyan, made to feel premium on every screen.",
    included: [
      { title: "Reels & short videos", body: "Concepts, scripts, shooting and editing for Instagram Reels and YouTube Shorts." },
      { title: "Brand films", body: "Short films that tell your story, for your website, launches and ads." },
      { title: "Motion graphics", body: "Animated logos, explainers and graphics that make information easy to follow." },
      { title: "Copywriting", body: "Captions, scripts, website copy and ad copy written in your brand's voice." },
      { title: "Editing & post-production", body: "Colour, sound, subtitles and the right format for every platform." },
      { title: "Content shoot days", body: "Planned shoots that produce weeks of content in a single day." },
    ],
    idealFor: [
      "Brands that need a steady stream of quality content",
      "Businesses launching a product, outlet or service",
      "Founders who want to be the face of their brand",
      "Teams with footage but no time to edit it",
    ],
    faqs: [
      {
        q: "Do you shoot at our location?",
        a: "Yes. We shoot at your shop, office, restaurant or site, and plan the day so one shoot produces several pieces of content.",
      },
      {
        q: "Can you edit footage we already have?",
        a: "Yes. Send us your clips and we'll edit them into reels, ads or a brand film.",
      },
      {
        q: "Do you come up with the ideas and scripts too?",
        a: "Yes. We handle concepts, hooks and scripts, and share them for your approval before we shoot.",
      },
    ],
  },

  "paid-advertising": {
    title: "Google & Meta Ads Agency in Kalyan",
    heading: "Paid advertising agency in",
    description:
      "Paid advertising in Kalyan: Meta (Facebook and Instagram) and Google Ads campaigns that are planned, tracked and optimised for leads and sales.",
    intro:
      "Ads should bring customers, not just clicks. We plan, run and optimise Meta and Google Ads campaigns for businesses in Kalyan, with tracking in place so you can see what every rupee returns.",
    included: [
      { title: "Campaign strategy", body: "Goals, audiences, budgets and offers planned before a rupee is spent." },
      { title: "Meta Ads", body: "Facebook and Instagram campaigns for awareness, leads, messages and sales." },
      { title: "Google Ads", body: "Search, Maps and YouTube ads that reach people already looking for what you offer." },
      { title: "Ad creatives", body: "Images, videos and copy designed for each placement and tested against each other." },
      { title: "Tracking", body: "Conversion tracking and lead alerts set up, so results are measured rather than guessed." },
      { title: "Optimisation & reports", body: "Regular adjustments and a clear monthly report on spend, leads and cost per result." },
    ],
    idealFor: [
      "Businesses that need enquiries quickly",
      "Local stores and services targeting nearby customers",
      "Brands launching an offer, outlet or product",
      "Businesses whose boosted posts aren't paying off",
    ],
    faqs: [
      {
        q: "Can you target customers only in and around Kalyan?",
        a: "Yes. Meta and Google both let us target by location, down to a radius around your shop or office, as well as by age, interests and what people search for.",
      },
      {
        q: "How much should we spend on ads?",
        a: "It depends on your goals and market. We recommend a starting budget once we understand your business, then put more behind what works.",
      },
      {
        q: "How soon will ads bring results?",
        a: "Ads can start bringing enquiries within days of going live. The first weeks are for testing, and results usually improve as we learn what works.",
      },
    ],
  },

  photography: {
    title: "Commercial Photography in Kalyan",
    heading: "Commercial photography in",
    description:
      "Commercial photography in Kalyan: product, food, fashion and campaign shoots with an art-directed, editorial eye, ready for web, social media and print.",
    intro:
      "Great photos sell before a word is read. We plan and shoot product, food, fashion and campaign photography for businesses in Kalyan, art-directed to match your brand.",
    included: [
      { title: "Product photography", body: "Clean catalogue and e-commerce shots, plus styled lifestyle images." },
      { title: "Food photography", body: "Menu and social media photos that make dishes look as good as they taste." },
      { title: "Fashion & lookbooks", body: "Model shoots, lookbooks and campaign imagery for fashion and jewellery brands." },
      { title: "Campaign shoots", body: "Concept-led shoots for launches, ads and your website." },
      { title: "Art direction & styling", body: "Moodboards, props, locations and styling planned before the shoot." },
      { title: "Editing & retouching", body: "Colour-corrected, retouched images in the sizes you need for web, social media and print." },
    ],
    idealFor: [
      "Restaurants and cafés refreshing menus and social media",
      "E-commerce and retail brands",
      "Fashion, jewellery and lifestyle labels",
      "Businesses launching a product or campaign",
    ],
    faqs: [
      {
        q: "Do you shoot at our premises?",
        a: "Usually, yes. We shoot at your business or at a suitable location, depending on what the shoot needs.",
      },
      {
        q: "How many photos will we receive?",
        a: "We agree the number of final edited images before the shoot, based on what you need them for.",
      },
      {
        q: "Are the photos good enough for print and ads?",
        a: "Yes. Final images are delivered in high resolution, ready for social media, ads, websites and print.",
      },
    ],
  },

  seo: {
    title: "SEO Agency in Kalyan",
    heading: "SEO agency in",
    description:
      "SEO services in Kalyan: technical, on-page, content and local SEO, including your Google Business Profile, so customers find you on Google and Maps.",
    intro:
      "When someone nearby searches for what you offer, yours should be the business they find. We handle technical, on-page, content and local SEO for businesses in Kalyan, so your visibility builds month after month.",
    included: [
      { title: "SEO audit", body: "A full check of your website's speed, structure, indexing and content, with a clear list of fixes." },
      {
        title: "Local SEO & Google Business Profile",
        body: "Your Google Business Profile set up and optimised, plus local listings, so you show up on Google Maps.",
      },
      { title: "On-page SEO", body: "Page titles, descriptions, headings, internal links and structured data done properly." },
      { title: "Content", body: "Pages and articles that answer what your customers are searching for." },
      { title: "Technical SEO", body: "Site speed, mobile usability, sitemaps and Search Console issues fixed." },
      { title: "Monthly reports", body: "Rankings, search traffic and enquiries from Google, reported every month." },
    ],
    idealFor: [
      "Local businesses that want to appear on Google Maps",
      "Websites that get little or no traffic from Google",
      "Businesses relying only on ads for leads",
      "New websites that need to be found",
    ],
    faqs: [
      {
        q: "How long does SEO take to work?",
        a: "Local improvements can show within weeks, but competitive rankings usually take three to six months of steady work. SEO compounds, so results keep building.",
      },
      {
        q: "Can you guarantee the #1 spot on Google?",
        a: "No honest agency can, because Google decides the rankings. What we can promise is the work that moves you up, with clear reports on what changed.",
      },
      {
        q: "What is local SEO?",
        a: "Local SEO helps you appear when people nearby search, for example for a café in Kalyan or a service near them. It centres on your Google Business Profile, reviews, local listings and pages about your area.",
      },
    ],
  },

  "influencer-marketing": {
    title: "Influencer Marketing Agency in Kalyan",
    heading: "Influencer marketing agency in",
    description:
      "Influencer marketing in Kalyan: creator partnerships matched to your audience, from local food and lifestyle creators to wider campaigns, managed end to end.",
    intro:
      "People trust people. We connect businesses in Kalyan with creators whose followers match their customers, and manage each campaign from the first brief to the final report.",
    included: [
      {
        title: "Creator search",
        body: "Shortlists of creators chosen for audience fit, engagement and content quality, not just follower counts.",
      },
      { title: "Campaign planning", body: "Goals, briefs, timelines and deliverables agreed up front." },
      { title: "Outreach & terms", body: "We approach creators, agree terms and handle the paperwork." },
      { title: "Content approval", body: "Scripts and drafts reviewed so every post fits your brand." },
      { title: "UGC videos", body: "Authentic, creator-made videos you can reuse in ads and on your own pages." },
      { title: "Results", body: "Reach, engagement, clicks and enquiries tracked for each creator." },
    ],
    idealFor: [
      "Restaurants, cafés and stores launching locally",
      "Consumer brands that need to build trust quickly",
      "Businesses launching a product or outlet",
      "Brands that need authentic content for ads",
    ],
    faqs: [
      {
        q: "Do you work with local creators?",
        a: "Yes. For local businesses, creators in Kalyan, Thane and Mumbai often work best because their followers can actually visit you. For wider campaigns we look further afield.",
      },
      {
        q: "How do you measure results?",
        a: "Each creator gets trackable links or codes where possible, and we report reach, engagement, clicks and enquiries for each one.",
      },
      {
        q: "What is UGC?",
        a: "User-generated content: authentic videos and photos made by creators about your product, which you can reuse in ads and on your own social media.",
      },
    ],
  },

  "creative-design": {
    title: "Graphic Design Agency in Kalyan",
    heading: "Graphic design agency in",
    description:
      "Graphic design in Kalyan: campaign visuals, packaging, brochures, menus, print and social media design with a consistent, premium signature.",
    intro:
      "Every flyer, menu, box and banner says something about your brand. We design campaign visuals, packaging, print and digital graphics for businesses in Kalyan, consistent and premium in every format.",
    included: [
      { title: "Campaign visuals", body: "One central visual idea, adapted for posters, social media, hoardings and ads." },
      { title: "Packaging", body: "Boxes, labels and bags that stand out on shelves and in unboxing videos." },
      { title: "Print", body: "Brochures, catalogues, menus, flyers, business cards and signage, ready for the printer." },
      { title: "Social media design", body: "Post and story templates that keep your feed consistent." },
      { title: "Presentations", body: "Company profiles and pitch decks that make your business look established." },
      { title: "Events & outdoor", body: "Standees, banners, hoardings and exhibition stall designs." },
    ],
    idealFor: [
      "Businesses whose print and social designs don't match",
      "Brands launching products that need packaging",
      "Restaurants updating menus and in-store displays",
      "Companies preparing for events or exhibitions",
    ],
    faqs: [
      {
        q: "Do you provide print-ready files?",
        a: "Yes. We deliver files set up for your printer, with the right sizes, bleed and colours, plus versions for web and social media.",
      },
      {
        q: "Can you work within our existing brand?",
        a: "Yes. We follow your brand guidelines, or help you create them if you don't have any yet.",
      },
      {
        q: "How quickly can you turn around a design?",
        a: "Simple designs can take a few days; larger pieces such as packaging or catalogues take longer. We confirm the timeline for each project.",
      },
    ],
  },
};
