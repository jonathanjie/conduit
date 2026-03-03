export const DEMO_URL = "https://calendar.notion.so/meet/jon-738gu1w4j/hkkwz4oj3";
export const DASHBOARD_URL = "https://app.conduit.app";

export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export const PROBLEM_CARDS = [
  {
    icon: "🎯",
    title: "Teacher Poaching",
    body: "One defecting teacher costs S$30k–S$80k in lost annual revenue — and there's no technical barrier stopping it.",
  },
  {
    icon: "💬",
    title: "WhatsApp Chaos",
    body: "Messages scattered across personal chats. No audit trail. No visibility. No way to step in when things go wrong.",
  },
  {
    icon: "🧾",
    title: "Billing Reconciliation",
    body: "Manual fee tracking against attendance records is error-prone, time-consuming, and a source of constant disputes.",
  },
  {
    icon: "🌙",
    title: "After-Hours Pressure",
    body: "Parents expect 24/7 access to teachers. Teachers burn out. There's no buffer.",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "Parents message your bot",
    body: "Parents connect via your center's Telegram or WhatsApp bot through a unique deep-link. A one-time PDPA consent gate, and they're in — no app download required.",
  },
  {
    number: "02",
    title: "Conduit routes anonymously",
    body: "Every message is proxied through Conduit's relay engine. Context is injected automatically — teacher, subject, child's name. Neither party ever sees the other's real contact.",
  },
  {
    number: "03",
    title: "Teachers reply, parents receive",
    body: "Teachers respond from their preferred messaging app. The reply threads back to the parent via the bot. Clean, fast, anonymous on both ends.",
  },
];

export const FEATURES = [
  {
    icon: "🔒",
    title: "Anonymous Message Relay",
    body: "Virtual Chat IDs mean parents never get a teacher's personal handle — structurally, not just by policy.",
    badge: null,
  },
  {
    icon: "🔗",
    title: "Deep-link Onboarding",
    body: "Generate enrolment tokens in seconds. Parents scan a link, consent to PDPA, and are mapped to the right teacher automatically.",
    badge: null,
  },
  {
    icon: "📣",
    title: "Broadcast Messaging",
    body: "Send announcements to all parents, a class, or a single teacher group. Rate-throttled, queued, and delivered reliably.",
    badge: null,
  },
  {
    icon: "🖥️",
    title: "Operations Dashboard",
    body: "Web-first admin panel for mappings, tokens, broadcasts, and audit logs. Your office staff will actually use it.",
    badge: null,
  },
  {
    icon: "🤖",
    title: "AI Homework Support",
    body: "An AI layer handles after-hours academic questions — so teachers aren't pinged at 11pm for trigonometry.",
    badge: "Coming Soon",
  },
  {
    icon: "✅",
    title: "PDPA Compliant by Design",
    body: "Consent-gated onboarding, AES-256 encrypted PII, no message content stored, full audit trail and deletion support.",
    badge: null,
  },
];

export const TEACHER_BENEFITS = [
  "No parent ever gets your personal number or handle",
  "Student context injected automatically — no need to remember who's who",
  "AI handles routine after-hours questions, so you actually switch off",
  "Structured inbox: every parent message routed to the right teacher",
];

export const PARENT_BENEFITS = [
  "No app download — works on WhatsApp or Telegram",
  "Reach your child's teacher directly, anytime",
  "24/7 AI support for homework questions (coming soon)",
  "Your data is protected under Singapore PDPA",
];

export const PRICING_TIERS = [
  {
    name: "Starter",
    price: "S$3",
    unit: "per student / month",
    description: "Up to 50 students",
    features: [
      "Anonymous relay for all parents + teachers",
      "Deep-link onboarding tokens",
      "Admin web dashboard",
      "Broadcast messaging",
      "PDPA-compliant audit trail",
    ],
    cta: "Book a Demo",
    popular: false,
  },
  {
    name: "Growth",
    price: "S$2.50",
    unit: "per student / month",
    description: "51–200 students",
    features: [
      "Everything in Starter",
      "Priority support",
      "Multi-admin dashboard access",
      "Advanced audit log filtering",
      "Custom bot display name",
    ],
    cta: "Book a Demo",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "contact us",
    description: "200+ students or multiple branches",
    features: [
      "Everything in Growth",
      "Multi-branch setup",
      "SLA guarantee",
      "Dedicated onboarding support",
      "AI homework module (early access)",
    ],
    cta: "Contact Us",
    popular: false,
  },
];

export const FAQ_ITEMS = [
  {
    q: "Do we need to create a new bot account?",
    a: "Yes — one shared bot account for your center. For Telegram, registered via @BotFather (5 minutes). For WhatsApp, via the WhatsApp Business API. We walk you through it during onboarding.",
  },
  {
    q: "Can parents still reach teachers directly after joining?",
    a: "No. That's the point. Conduit's architecture means there is no technical pathway for parents to obtain a teacher's personal number or handle.",
  },
  {
    q: "Is Conduit compliant with Singapore PDPA?",
    a: "Yes. Onboarding requires explicit PDPA consent. All PII is encrypted at the application layer (AES-256-GCM). Message content is never stored — only metadata. Data deletion is fully supported.",
  },
  {
    q: "What types of messages are supported?",
    a: "Text, photos, documents, voice notes, and stickers are all relayed. Media groups (photo albums) are on the roadmap.",
  },
  {
    q: "What happens if a parent messages outside office hours?",
    a: "Today, the message is queued and delivered immediately — teachers can respond at their convenience. The AI homework triage module (coming in Q3) will handle routine questions automatically.",
  },
  {
    q: "How long does teacher onboarding take?",
    a: "Under 5 minutes per teacher. They receive a deep-link, tap it in their messaging app, and they're mapped and ready.",
  },
  {
    q: "Can we use a custom bot name?",
    a: "Yes — you register the bot under your center's brand (e.g. @MathMavens_bot). Conduit powers it behind the scenes.",
  },
  {
    q: "How does billing work?",
    a: "Monthly invoicing based on your active student count. Automated billing via PayNow/Stripe is on the roadmap for Q3.",
  },
];
