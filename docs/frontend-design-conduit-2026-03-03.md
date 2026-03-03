# Frontend Design Document: Conduit

**Date:** 2026-03-03
**Author:** BMAD UX Designer
**Project:** math-mavens-bot (Conduit brand)
**Status:** Draft — Frontend Design v1.0
**Companions:** product-brief-math-mavens-bot-2026-03-03.md, architecture-math-mavens-bot-2026-03-03.md, ux-design-math-mavens-bot-2026-03-03.md

---

## Table of Contents

1. [Brand Identity](#part-1-brand-identity)
   - 1.1 Brand Voice
   - 1.2 Color System
   - 1.3 Typography
   - 1.4 Logo Concept
   - 1.5 Spacing and Layout Tokens
2. [Landing Page Design](#part-2-landing-page-design)
   - 2.1 Page Structure
   - 2.2 Responsive Behavior
   - 2.3 Key Interactions
3. [Dashboard Design](#part-3-dashboard-design)
   - 3.1 Global Layout
   - 3.2 Dashboard Home
   - 3.3 Students Page
   - 3.4 Mappings Page
   - 3.5 Onboarding / Tokens Page
   - 3.6 Broadcast Page
   - 3.7 Teachers Page
   - 3.8 Parents Page
   - 3.9 User Management (Superadmin)
   - 3.10 Audit Log (Superadmin)
   - 3.11 System Status (Superadmin)
   - 3.12 Settings (Superadmin)
4. [Component Library](#part-4-component-library)
5. [File Structure](#part-5-file-structure)

---

## Part 1: Brand Identity

### 1.1 Brand Voice

**Positioning Statement**

Conduit is the infrastructure layer for secure education communication. It sits invisibly between teachers and parents — a trusted channel that protects relationships on both sides while giving operations teams the visibility and control they need.

**Brand Personality**

| Attribute | Description |
|-----------|-------------|
| Trustworthy | Like a reliable utility — water pipes, electrical conduit. It just works. You trust it implicitly. |
| Professional | Built for serious operators of tuition businesses, not for consumers. Enterprise-grade in demeanor. |
| Education-Forward | Understands the Singapore tuition context deeply. Speaks the language of teachers and parents. |
| Modern | Clean, current design language. Not corporate gray. Not startup-quirky. Quietly confident. |
| PDPA-Aware | Privacy is not a checkbox. It is foregrounded as a feature and a value, not buried in a footer. |

**Voice Characteristics**

- Active voice. Direct. No hedging.
- Short sentences. One idea at a time.
- Numbers are specific: "< 2 seconds relay latency", "99.5% uptime", not "fast" or "reliable."
- Use "your center" not "the client." Address the reader directly.
- Never use: "synergy," "seamless," "revolutionary," "game-changing," "innovative."
- Do use: "secure," "private," "structured," "compliant," "efficient."

**Tone by context:**

- Landing page: Confident, solution-oriented. Acknowledge the pain plainly, then solve it clearly.
- Dashboard UI: Efficient, informative. Zero jargon clutter. Labels over tooltips.
- Error states: Calm, diagnostic. Tell the user what happened, what to try, who to contact.
- Empty states: Inviting, instructional. "No students yet — add your first one to get started."

**What Conduit is not:**

- Not a consumer messaging app (do not borrow the voice of WhatsApp, Signal, or Slack)
- Not a heavy-enterprise SaaS (avoid the corporate coldness of Salesforce or ServiceNow)
- Not a playful edtech product (avoid the chirpiness of Duolingo or ClassDojo)

---

### 1.2 Color System

All colors include their WCAG 2.1 contrast ratio against white (#FFFFFF) and dark (#1E2433) backgrounds as applicable. AA requires 4.5:1 for normal text, 3:1 for large text. AAA requires 7:1.

#### Primary Palette — Conduit Blue

The primary hue is a deep, desaturated blue-indigo. It conveys trust, stability, and education without the aggression of pure blue or the coldness of slate. It reads as "infrastructure" — like a well-built institution.

| Token | Name | Hex | HSL | WCAG on White |
|-------|------|-----|-----|---------------|
| `--color-primary-950` | Abyss | `#0D1526` | 220, 50%, 10% | 17.4:1 (AAA) |
| `--color-primary-900` | Midnight | `#142240` | 220, 52%, 16% | 13.1:1 (AAA) |
| `--color-primary-800` | Deep Navy | `#1C3461` | 220, 56%, 24% | 8.9:1 (AAA) |
| `--color-primary-700` | Conduit Navy | `#24487F` | 220, 56%, 32% | 5.9:1 (AA) |
| `--color-primary-600` | Conduit Blue | `#2C5BA0` | 220, 56%, 40% | 4.5:1 (AA) |
| `--color-primary-500` | Mid Blue | `#3A72C4` | 220, 54%, 49% | 3.1:1 (AA large) |
| `--color-primary-400` | Sky Channel | `#5C90D8` | 218, 60%, 61% | 2.2:1 |
| `--color-primary-300` | Pale Channel | `#8AB3E8` | 216, 65%, 73% | 1.6:1 |
| `--color-primary-200` | Mist | `#BCD3F5` | 214, 74%, 85% | 1.2:1 |
| `--color-primary-100` | Frost | `#E8F0FC` | 215, 78%, 95% | 1.05:1 |
| `--color-primary-50` | Ice | `#F4F7FE` | 218, 80%, 98% | 1.02:1 |

**Primary usage:**
- `primary-700`: Default button fill, active nav items, primary text links
- `primary-600`: Button hover state
- `primary-100`: Subtle backgrounds for info panels
- `primary-50`: Page backgrounds for dashboard sidebar

#### Secondary Palette — Warm Amber

The secondary/accent color is a warm amber-gold. It creates visual tension against the cool blue — signaling action, completion, and value. Used exclusively for primary CTAs on the landing page and positive highlights in the dashboard.

| Token | Name | Hex | HSL | WCAG on White |
|-------|------|-----|-----|---------------|
| `--color-accent-900` | Burnt Ochre | `#7A4500` | 35, 100%, 24% | 9.8:1 (AAA) |
| `--color-accent-700` | Deep Amber | `#B86800` | 35, 100%, 36% | 5.8:1 (AA) |
| `--color-accent-600` | Action Amber | `#E07A00` | 33, 100%, 44% | 3.8:1 (AA large) |
| `--color-accent-500` | Highlight Gold | `#F5920A` | 35, 91%, 50% | 2.7:1 |
| `--color-accent-100` | Warm Glow | `#FEF3E2` | 37, 96%, 94% | 1.04:1 |

**Accent usage:**
- `accent-600`: Landing page primary CTA ("Book a Demo") button fill
- `accent-700`: CTA button hover
- `accent-100`: Highlight badge backgrounds in the dashboard

**Contrast note:** CTA buttons must use `accent-700` text on `accent-600` background or white text (`#FFFFFF`) on `accent-700` background to meet AA. Testing: `#FFFFFF` on `#E07A00` = 3.8:1 (passes for large text/buttons at 18px+). Use `accent-900` text on `accent-100` backgrounds for inline chips.

#### Semantic Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-success-700` | Forest | `#15803D` | Success states, active/online badges |
| `--color-success-100` | Mint | `#DCFCE7` | Success toast backgrounds |
| `--color-warning-700` | Amber Warning | `#B45309` | Warning states, pending badges |
| `--color-warning-100` | Honey | `#FEF3C7` | Warning toast backgrounds |
| `--color-error-700` | Crimson | `#B91C1C` | Error states, failed badges |
| `--color-error-100` | Blush | `#FEE2E2` | Error toast backgrounds |
| `--color-info-700` | Sapphire | `#1D4ED8` | Info states, inline tips |
| `--color-info-100` | Sky | `#DBEAFE` | Info toast backgrounds |

All semantic `700` shades meet AA contrast (4.5:1+) against white. Semantic `100` shades are background-only; never use semantic-100 as text color.

#### Neutral Palette — Cool Gray

Slightly cool-shifted gray (not warm, not pure gray) to harmonize with the primary blue.

| Token | Name | Hex | WCAG on White |
|-------|------|-----|---------------|
| `--color-gray-950` | Ink | `#0F172A` | 18.9:1 (AAA) |
| `--color-gray-900` | Near Black | `#1E2433` | 15.2:1 (AAA) |
| `--color-gray-800` | Dark Charcoal | `#2D3748` | 10.7:1 (AAA) |
| `--color-gray-700` | Charcoal | `#3F4D63` | 7.3:1 (AAA) |
| `--color-gray-600` | Slate | `#556175` | 5.1:1 (AA) |
| `--color-gray-500` | Mid Gray | `#718096` | 4.5:1 (AA) |
| `--color-gray-400` | Cool Gray | `#94A3B8` | 2.8:1 |
| `--color-gray-300` | Light Gray | `#CBD5E1` | 1.7:1 |
| `--color-gray-200` | Silver | `#E2E8F0` | 1.3:1 |
| `--color-gray-100` | Mist | `#F1F5F9` | 1.05:1 |
| `--color-gray-50` | Off White | `#F8FAFC` | 1.02:1 |

**Neutral usage:**
- `gray-900`: Primary body text
- `gray-700`: Secondary text, table metadata
- `gray-500`: Placeholder text, muted labels
- `gray-300`: Borders, dividers
- `gray-100`: Alternate row backgrounds
- `gray-50`: Page background (dashboard main area)

#### Surface Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-surface-white` | `#FFFFFF` | Cards, modal backgrounds, form inputs |
| `--color-surface-raised` | `#F8FAFC` | Dashboard main content area |
| `--color-surface-sidebar` | `#F4F7FE` | Sidebar background (primary-50 tint) |
| `--color-surface-overlay` | `rgba(15,23,42,0.5)` | Modal backdrop |

---

### 1.3 Typography

#### Heading Font: Inter

**Rationale:** Inter was designed specifically for screen readability at all sizes. It is a near-universal choice for professional web products for good reason — it has no personality quirks that would clash with the Conduit brand, yet it avoids the blandness of system sans-serifs. The variable font file covers all weights from 100–900 in a single file, keeping page load lean. Alternatively, Geist (by Vercel) provides a slightly more distinctive alternative with near-identical characteristics if differentiation from Inter's ubiquity is desired.

**Loading strategy:** Load from Google Fonts or self-host via `@fontsource/inter` npm package for reliability and no external dependency on CDN availability.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
```

**Monospace companion for tokens/IDs:** JetBrains Mono (or system monospace stack) for token display, audit log entries, and code values.

#### Body Font Stack

For body text at sizes below 18px (paragraphs, table rows, form labels), use the system font stack for maximum performance and native rendering quality:

```css
--font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

This avoids a web font download for body text while maintaining Inter for headings where the visual character of the font matters.

#### Type Scale

Based on a 1.25 modular scale (Major Third) from a 16px base.

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-xs` | 12px / 0.75rem | 16px | 400 | Captions, table footnotes, timestamps |
| `--text-sm` | 14px / 0.875rem | 20px | 400 | Table body, form helper text, secondary labels |
| `--text-base` | 16px / 1rem | 24px | 400 | Body text, form inputs, default UI text |
| `--text-lg` | 18px / 1.125rem | 28px | 500 | Card titles, section labels |
| `--text-xl` | 20px / 1.25rem | 28px | 600 | Page sub-headings |
| `--text-2xl` | 24px / 1.5rem | 32px | 600 | Dashboard section headings |
| `--text-3xl` | 30px / 1.875rem | 36px | 700 | Landing page sub-section headings |
| `--text-4xl` | 36px / 2.25rem | 40px | 700 | Landing page section headings |
| `--text-5xl` | 48px / 3rem | 52px | 800 | Landing page hero headline |
| `--text-6xl` | 60px / 3.75rem | 64px | 800 | Landing page hero headline (desktop) |

**Font weights in use:**
- 400 (Regular): Body, table data, secondary text
- 500 (Medium): UI labels, active nav items
- 600 (SemiBold): Button labels, card headings, section headings
- 700 (Bold): H2, page titles, emphasis
- 800 (ExtraBold): Hero headlines, landing page punch text

Letter spacing adjustments:
- `--tracking-tight`: -0.025em — applied to headings 3xl and above for visual density
- `--tracking-normal`: 0 — default for all other text
- `--tracking-wide`: 0.05em — applied to uppercase badge/chip labels and status text only

---

### 1.4 Logo Concept

#### Icon Mark

The icon is a stylized conduit cross-section viewed end-on — three concentric rings that terminate in a directed arrow pointing right, symbolizing flow through a channel. The rings are not circles but slightly left-angled horizontal ellipses, giving a sense of depth and motion — as if looking through a pipe at an angle.

The innermost ring is filled with `primary-700` (Conduit Navy). The middle ring is a transparent gap (white or page background). The outermost ring is `primary-400` (Sky Channel), lighter and more open. The arrow that exits the rightmost ring is `accent-600` (Action Amber) — a warm directional jab that signals outbound communication.

The effect is: a secure, structured channel (the rings) through which something valuable passes (the amber arrow). No message content is visible — the medium, not the content, is the brand.

**Alternate interpretation:** The three rings can also be read as three stakeholders — parent, student, teacher — and the arrow as the relationship between them, all passing through Conduit's structured channel. This dual reading reinforces the brand meaning without needing explanation.

**Size behavior:**
- At 48px and above: Full icon with all rings and arrow visible.
- At 32px: Simplify to two rings plus arrow.
- At 16px (favicon): Single bold ring with amber dot at exit.

#### Wordmark

"Conduit" set in Inter ExtraBold (800), all lowercase, with a subtle letter-spacing of -0.02em. The "o" in "conduit" optionally receives the icon mark treatment — with a thin inner ring rendered as a diacritic-style element — but only if the designer can execute this without it reading as a generic "swoosh." If in doubt, use a clean wordmark without embedded iconography.

Color: `primary-900` (Midnight) in light contexts, `#FFFFFF` in dark/inverted contexts.

**Lockup variants:**
1. Horizontal: [Icon] + [Wordmark] — default for navbar, email headers
2. Stacked: [Icon] centered above [Wordmark] — for loading screens, splash pages
3. Icon only: Used at favicon scale or where space is constrained (sidebar collapsed state)

**Tagline treatment:**

Below the wordmark in `text-sm`, `gray-500`, regular weight:

Option A: "The secure channel between teachers and parents"
Option B: "Where knowledge flows"

Option A is recommended for the landing page above-the-fold use. It explicitly states the value proposition. Option B is more evocative and better suited for brand presentations or printed materials.

---

### 1.5 Spacing and Layout Tokens

#### Base Grid

8px base unit. All spacing values are multiples of 8px.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Micro-gaps (icon-to-label, badge internal padding) |
| `--space-2` | 8px | Compact element spacing, list item padding |
| `--space-3` | 12px | Default inline element gap |
| `--space-4` | 16px | Standard content gap, form field vertical spacing |
| `--space-5` | 20px | |
| `--space-6` | 24px | Card internal padding, section sub-element gaps |
| `--space-8` | 32px | Card-to-card gap, form section spacing |
| `--space-10` | 40px | Major component spacing |
| `--space-12` | 48px | Section internal top/bottom padding |
| `--space-16` | 64px | Section-to-section spacing (landing page) |
| `--space-20` | 80px | Large section padding |
| `--space-24` | 96px | Hero section padding |
| `--space-32` | 128px | |

#### Layout Dimensions

| Token | Value | Usage |
|-------|-------|-------|
| `--layout-sidebar-width` | 256px | Expanded sidebar |
| `--layout-sidebar-collapsed` | 64px | Collapsed sidebar (icons only) |
| `--layout-topbar-height` | 56px | Fixed topbar height |
| `--layout-content-max-width` | 1280px | Max width for landing page sections |
| `--layout-dashboard-content-max` | 1440px | Max width for dashboard content area |
| `--layout-card-max-narrow` | 480px | Single-column forms, modals |
| `--layout-card-max-wide` | 720px | Dialog content max width |

#### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Input fields, small badges |
| `--radius-md` | 8px | Cards, buttons, dropdowns |
| `--radius-lg` | 12px | Modal dialogs, large cards |
| `--radius-xl` | 16px | Hero visual containers, feature cards (landing) |
| `--radius-2xl` | 24px | Large decorative containers |
| `--radius-full` | 9999px | Pills, avatar circles, toggle switches |

#### Shadow / Elevation Scale

| Token | CSS Value | Usage |
|-------|-----------|-------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle input border enhancement |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Default card |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` | Hover card, dropdown |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Modal, popover |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Command palette, full-screen dialogs |
| `--shadow-primary` | `0 4px 14px rgba(44,91,160,0.3)` | Primary button focus/hover glow |
| `--shadow-accent` | `0 4px 14px rgba(224,122,0,0.35)` | Accent CTA button glow (landing page) |

---

## Part 2: Landing Page Design

### 2.1 Page Structure

The landing page URL is the root domain (e.g., `conduit.sg` or `app.conduit.sg`). It is a single-page layout with smooth-scroll anchor navigation. The dashboard app lives at `/dashboard/*`. The landing page and dashboard are served from the same Nginx instance — `/dashboard` proxies to the React SPA's catch-all route, while `/` serves the landing page index.

#### Navigation Bar (Sticky)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  [Conduit Logo + Wordmark]    Features  How It Works  Pricing  FAQ    [Book Demo]│
└─────────────────────────────────────────────────────────────────────────────────┘
```

- Background: `#FFFFFF`, `shadow-sm`, 56px height
- Logo on far left
- Nav links center-right: Features, How It Works, Pricing, FAQ — all anchor links
- CTA button far right: "Book a Demo" — `accent-600` fill, white text, `radius-md`, hover `accent-700`
- On scroll past 80px: nav gains `shadow-md` and subtle `backdrop-blur` to maintain legibility
- Mobile: Hamburger icon replaces nav links; drawer slides in from right

---

#### Section 1: Hero

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   [eyebrow tag: "Built for Singapore Tuition Centers"]                          │
│                                                                                 │
│   Protect your teachers.                                                        │
│   Streamline every conversation.                                                │
│                                                                                 │
│   Conduit proxies all teacher-parent communication through your                 │
│   Telegram bot — so parents never get your teachers' personal contact,          │
│   and your operations run from a single dashboard.                              │
│                                                                                 │
│   [ Book a Demo  →  ]          [ See How It Works  ↓  ]                        │
│                                                                                 │
│   ─────────────────────────────────────────────────────                        │
│                                                                                 │
│   [HERO VISUAL: Split mockup]                                                  │
│   Left: Telegram chat interface showing parent ↔ bot conversation              │
│   Right: Dashboard screenshot showing student/teacher mapping table             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Headline copy:** "Protect your teachers. Streamline every conversation."

**Headline rationale:** "Protect your teachers" speaks directly to the poaching pain — it is the #1 business fear. It also resonates emotionally; operators who value their staff respond to protective framing. "Streamline every conversation" covers operations without being vague.

**Subheadline:** "Conduit proxies all teacher-parent communication through your Telegram bot — so parents never get your teachers' personal contact, and your operations run from a single dashboard."

**CTA 1:** "Book a Demo" — `accent-600` filled button, 18px text, 12px 28px padding, `radius-md`, `shadow-accent` on hover
**CTA 2:** "See How It Works" — text link, `primary-600`, underline on hover, arrow icon animates downward on hover

**Eyebrow tag:** Small uppercase label above headline. `primary-100` background, `primary-700` text, `radius-full`, 12px text, 4px 12px padding. Contains: "Built for Singapore Tuition Centers"

**Hero visual specifications:**
- Container: `radius-xl`, `shadow-xl`, subtle `primary-100` background tint
- Left panel (60% width): Stylized Telegram chat mockup — dark Telegram chrome, showing a conversation between "Sarah Tan" and "@MathMavenesBot" including a message about homework, a photo of a worksheet, and a reply context header "[Wei Ming — P5]"
- Right panel (40% width): Mini dashboard mockup — showing the Students table with 3 rows, status badges, and the top stats bar
- Panel divider: 2px `gray-200` vertical line
- Overall aspect ratio: 16:9, max-width 1000px, centered

**Background:** Gradient from `primary-50` at top to `#FFFFFF` at the fold line. Subtle grid pattern overlay at 5% opacity (CSS `background-image: repeating-linear-gradient` pattern) to add texture without distraction.

---

#### Section 2: Social Proof Bar

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   Trusted by tuition centers across Singapore                                   │
│                                                                                 │
│   [Logo 1]    [Logo 2]    [Logo 3]    [Logo 4]    [Logo 5]                      │
│    Math Mavens   [Partner]   [Partner]   [Partner]   [Partner]                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- Background: `gray-50`
- Border top and bottom: `gray-200` 1px
- Centered text: `text-sm`, `gray-500`, uppercase, wide tracking
- Logo row: grayscale logos, 40px height, `gap-10` between, centered
- Math Mavens listed as first adopter
- Placeholder slots for future partners (greyed out silhouettes until live)
- Copy: "Trusted by tuition centers across Singapore" — low-key, not a bold claim

---

#### Section 3: Problem Section — "The Challenge"

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   [eyebrow: "Sound familiar?"]                                                  │
│   The hidden costs of unstructured communication                                │
│                                                                                 │
│   Every year, tuition centers in Singapore lose teachers — and the families     │
│   that follow them. The platform you need already exists. You just need         │
│   to connect it.                                                                │
│                                                                                 │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────┐│
│   │  [icon: people]  │  │  [icon: chaos]   │  │  [icon: receipt] │  │  [icon: clock]     ││
│   │                  │  │                  │  │                  │  │                    ││
│   │  Teacher         │  │  WhatsApp        │  │  Manual billing  │  │  No after-hours    ││
│   │  Poaching        │  │  Chaos           │  │  Reconciliation  │  │  support           ││
│   │                  │  │                  │  │                  │  │                    ││
│   │  One teacher     │  │  Messages across │  │  Screenshot-and- │  │  Parents expect    ││
│   │  leaving with    │  │  4 apps, no      │  │  verify wastes   │  │  homework help     ││
│   │  their students  │  │  audit trail,    │  │  hours. Disputes │  │  at 10pm. Teachers ││
│   │  costs S$30k–    │  │  no searchable   │  │  have no         │  │  cannot deliver    ││
│   │  S$80k per year. │  │  history.        │  │  paper trail.    │  │  this sustainably. ││
│   └──────────────────┘  └──────────────────┘  └──────────────────┘  └────────────────────┘│
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Section heading:** "The hidden costs of unstructured communication"

**Eyebrow:** "Sound familiar?" — conversational, invites the reader to self-identify

**Pain cards (4):**

1. **Teacher Poaching** — Icon: two human figures, one with an arrow exiting. Copy: "One teacher leaving with their students costs S$30,000–S$80,000 per year in lost tuition fees. There is no technical barrier preventing it today."

2. **WhatsApp Chaos** — Icon: stacked speech bubbles with X marks. Copy: "Messages across personal WhatsApp, SMS, and email. No audit trail. No searchability. No way to know if a parent's concern was addressed."

3. **Manual Billing Reconciliation** — Icon: receipt with warning triangle. Copy: "Parents PayNow to personal UENs and send screenshots. Staff verify manually. Every month. This is not scalable and it is error-prone."

4. **No After-Hours Academic Support** — Icon: moon with question mark. Copy: "Singapore parents expect homework help outside business hours. Teachers cannot realistically deliver this. The gap erodes satisfaction and invites competitor comparison."

**Card design:**
- White background, `shadow-sm`, `radius-lg`
- Icon: 40px, `primary-600` color, top-left of card
- Title: `text-lg`, `gray-900`, 600 weight
- Body: `text-sm`, `gray-600`, regular weight
- Subtle red-left border (`error-700`, 3px) to signal "problem" state
- Grid: 4-col desktop, 2-col tablet, 1-col mobile

---

#### Section 4: Solution Section — "How Conduit Works"

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   [eyebrow: "The Solution"]                                                     │
│   How Conduit works                                                             │
│                                                                                 │
│   Three steps. No app installs. No complicated setup.                           │
│                                                                                 │
│   ┌───────────────────────────────────────────────────────────────────────────┐ │
│   │                                                                           │ │
│   │  [1]  ────────────────►  [2]  ────────────────►  [3]                     │ │
│   │                                                                           │ │
│   │  Parent messages         Conduit routes          Teacher replies.          │ │
│   │  @YourBot on             message to the          Parent receives it        │ │
│   │  Telegram.               right teacher —         through the bot.          │ │
│   │                          anonymously.            No direct contact         │ │
│   │  No app install          No personal             ever established.         │ │
│   │  needed. They            numbers revealed.                                 │ │
│   │  already have            Context injected:                                 │ │
│   │  Telegram.               "Replying about                                   │ │
│   │                          Wei Ming (P5)."                                   │ │
│   └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│   [Flow diagram showing: Parent → Bot → Conduit Engine → Teacher → Bot → Parent]│
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Section heading:** "How Conduit works"

**Eyebrow:** "The Solution"

**Step cards (3), connected by horizontal arrow line on desktop:**

Step 1 — "Parents message @YourBot on Telegram"
- Icon: Telegram logo (stylized) with speech bubble
- Body: "Parents already have Telegram. They tap your bot's deep link and start messaging. Zero app downloads. Zero account creation. It just works."

Step 2 — "Conduit routes messages to the right teacher — privately"
- Icon: Network node diagram (conduit rings icon variant)
- Body: "Every message is routed through Conduit's engine using a three-way mapping (parent → student → teacher). Teachers receive messages with student context injected. No Telegram handles are ever exchanged."

Step 3 — "Teacher replies. Parents receive it through the bot."
- Icon: check-circle with arrow looping back
- Body: "Teachers reply naturally in Telegram. Conduit delivers it to the parent's bot chat. The conversation feels direct — because it functionally is — but no personal contact is ever established."

**Connector:** Horizontal line with right-pointing arrows between steps. On mobile, line becomes vertical. Line color: `primary-300`.

**Flow diagram (below the 3 steps):**

ASCII representation of the visual:

```
Parent                 @YourBot              Conduit Engine         Teacher
  │                       │                       │                    │
  │──── "Hi, homework" ──►│                       │                    │
  │                       │──── relay + map ─────►│                    │
  │                       │                       │─── copyMessage ───►│
  │                       │                       │                    │
  │                       │◄── "Try method 2" ────│◄───────────────────│
  │◄── "Try method 2" ────│                       │                    │
```

Visual version uses colored pill nodes (Parent: `primary-100` bg, Teacher: `primary-100` bg, Bot: `primary-700` bg white text, Engine: `gray-800` bg white text) connected by solid line segments with animated dashes flowing in the relay direction.

**Background:** `primary-50` — subtle blue tint to contrast with white sections before and after.

---

#### Section 5: Features Grid

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   Everything your tuition center needs.                                         │
│   Nothing it doesn't.                                                           │
│                                                                                 │
│   ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐  │
│   │ [icon]              │   │ [icon]              │   │ [icon]              │  │
│   │ Anonymous Message   │   │ AI Homework         │   │ Operations          │  │
│   │ Relay               │   │ Support (24/7)      │   │ Dashboard           │  │
│   │                     │   │                     │   │                     │  │
│   │ All teacher-parent  │   │ OpenClaw AI         │   │ Students, teachers, │  │
│   │ messages route      │   │ handles out-of-     │   │ mappings, tokens,   │  │
│   │ through your bot.   │   │ hours queries.      │   │ and broadcasts      │  │
│   │ No handles exposed. │   │ Escalates when      │   │ in one place.       │  │
│   │                     │   │ needed.             │   │                     │  │
│   └─────────────────────┘   └─────────────────────┘   └─────────────────────┘  │
│                                                                                 │
│   ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐  │
│   │ [icon]              │   │ [icon]              │   │ [icon]              │  │
│   │ Automated Billing   │   │ Attendance          │   │ PDPA Compliant      │  │
│   │ (PayNow / Stripe)   │   │ Tracking            │   │ by Design           │  │
│   │                     │   │                     │   │                     │  │
│   │ Monthly invoices,   │   │ Teachers mark       │   │ Consent-gated.      │  │
│   │ QR codes, webhook-  │   │ attendance via bot. │   │ No message content  │  │
│   │ confirmed. No more  │   │ Parents get         │   │ stored. Right to    │  │
│   │ screenshot chasing. │   │ confirmation.       │   │ Erasure supported.  │  │
│   └─────────────────────┘   └─────────────────────┘   └─────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Section heading:** "Everything your tuition center needs. Nothing it doesn't."

**Feature cards (6), 3-col grid desktop, 2-col tablet, 1-col mobile:**

1. **Anonymous Message Relay** — Icon: shield with speech bubble. Phase label: "Core"
2. **AI Homework Support (24/7)** — Icon: robot/sparkle. Phase label: "Phase 2"
3. **Operations Dashboard** — Icon: grid/layout. Phase label: "Core"
4. **Automated Billing** — Icon: card/lightning bolt. Phase label: "Phase 2/3"
5. **Attendance Tracking** — Icon: checklist. Phase label: "Phase 2"
6. **PDPA Compliant by Design** — Icon: lock/shield. Phase label: "Core"

**Phase labels:** Small `radius-full` badges in top-right corner of card. "Core" = `success-100` bg, `success-700` text. "Phase 2" = `primary-100` bg, `primary-700` text.

**Card design:**
- White background, `shadow-sm`, `radius-lg`, hover: `shadow-md` with `primary-100` top-border highlight (3px)
- Icon: 32px, `primary-600`, top-left
- Title: `text-lg`, `gray-900`, 600 weight
- Body: `text-sm`, `gray-600`, regular weight
- Padding: `space-6` all sides

---

#### Section 6: Dashboard Preview Section

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   [eyebrow: "The Command Center"]                                               │
│   Your entire operation, visible at a glance.                                   │
│                                                                                 │
│   Admin staff and directors get a full web dashboard to manage students,        │
│   teachers, and parents — with no Telegram commands required.                   │
│                                                                                 │
│   ┌───────────────────────────────────────────────────────────────────────────┐ │
│   │  [Dashboard screenshot / high-fidelity mockup]                            │ │
│   │                                                                           │ │
│   │  Sidebar: Conduit logo, nav items highlighted                             │ │
│   │  Main: Stats bar + Students table visible                                 │ │
│   │                                                                           │ │
│   │         ↑              ↑                  ↑                               │ │
│   │  [callout 1]    [callout 2]        [callout 3]                            │ │
│   │  Stats at a     One-click token    Full search                            │ │
│   │  glance         generation         and filtering                          │ │
│   └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Callout annotations (3, positioned with connecting lines to the mockup):**

1. "Stats at a glance — Active students, teachers, parents, and today's message volume. Always visible."
2. "One-click token generation — Generate deep-link onboarding tokens for new parents or teachers in seconds."
3. "Full search and filtering — Find any student, teacher, or parent instantly. Filter by class, status, or teacher."

**Mockup treatment:** Browser chrome (minimal, just address bar showing `app.conduit.sg`) wrapping the dashboard screenshot. `radius-xl` on the browser container, `shadow-xl`. The image is a static PNG mockup — not a live embedded dashboard.

**Background:** `gray-900` (dark section) — creates high visual contrast. Headline and subtext in white and `gray-300`. This dark section breaks the monotony of the white/blue alternating pattern and adds visual drama.

---

#### Section 7: For Teachers Section

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   [left column, 50%]                    [right column, 50%]                    │
│                                                                                 │
│   Teachers get their                    ✓  No personal number or Telegram      │
│   privacy back.                             handle ever exposed to parents.    │
│                                                                                 │
│                                         ✓  Every message arrives with          │
│   Your teachers are your most               student context injected.          │
│   valuable asset. They deserve             You always know who you're          │
│   a professional communication             replying about.                     │
│   layer — not a personal WhatsApp                                              │
│   number handed to every parent.        ✓  AI handles after-hours queries.    │
│                                             Teachers are not expected          │
│                                             to be on-call 24/7.               │
│                                                                                 │
│                                         ✓  Structured inbox inside            │
│                                             Telegram — the app they           │
│                                             already use every day.             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Layout:** 2-column, 50/50 split. Left: headline + paragraph in `primary-700`, using `text-3xl` heading. Right: checklist of 4 benefits with checkmark icons in `success-700`.

**Background:** White

---

#### Section 8: For Parents Section

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   [right column, 50%]                   [left column, 50%]                     │
│                                                                                 │
│   ✓  No app to install.                 Parents get the                        │
│      They already have Telegram.        experience they                        │
│                                         expect.                                │
│   ✓  24/7 AI homework support                                                  │
│      for after-hours questions.         No new apps. No account creation.      │
│                                         Just a Telegram chat that feels        │
│   ✓  Digital fee payment via            exactly like messaging the teacher     │
│      PayNow — no bank transfers,        directly — because functionally,       │
│      no screenshots, no chasing.        it is.                                 │
│                                                                                 │
│   ✓  Their children's data is           [Telegram mockup: parent chat view]   │
│      handled under PDPA. Consent        showing bot conversation              │
│      collected. Deletion on request.                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Layout:** Mirror of Teachers section — list on left, headline/visual on right. Alternating layout prevents monotony.

**Background:** `primary-50` — subtle blue tint to differentiate from Teachers section above.

---

#### Section 9: Pricing Section

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   Simple pricing. No surprises.                                                 │
│   Pay for what you use.                                                         │
│                                                                                 │
│   ┌──────────────────────┐           ┌──────────────────────────────────────┐  │
│   │  Starter             │           │  Growth                      [POPULAR]│  │
│   │                      │           │                                        │  │
│   │  S$3                 │           │  S$2.50                                │  │
│   │  per student/month   │           │  per student/month                     │  │
│   │                      │           │                                        │  │
│   │  Up to 50 students   │           │  51–200 students                       │  │
│   │                      │           │                                        │  │
│   │  ✓ Anonymous relay   │           │  ✓ Everything in Starter               │  │
│   │  ✓ Web dashboard     │           │  ✓ AI Homework Support                 │  │
│   │  ✓ Token onboarding  │           │  ✓ Automated Billing                   │  │
│   │  ✓ Broadcasts        │           │  ✓ Attendance Tracking                 │  │
│   │  ✓ PDPA compliant    │           │  ✓ Priority support                    │  │
│   │                      │           │                                        │  │
│   │  [Get Started]       │           │  [Book a Demo]                         │  │
│   └──────────────────────┘           └──────────────────────────────────────┘  │
│                                                                                 │
│         For 200+ students or multi-center groups: [Contact us for pricing]      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Pricing rationale:** Per-student-per-month is the natural unit for a tuition center. It scales linearly with their enrollment, aligns costs with revenue, and is simple to explain. Volume discount at 51+ students encourages growth.

**Card design:**
- White background, `shadow-sm`, `radius-xl`
- Growth card: `primary-700` left border (4px), "POPULAR" badge in `primary-100/primary-700`
- Price: `text-5xl`, `gray-900`, 800 weight. Unit "per student/month": `text-sm`, `gray-500`
- Feature list: checkmark icon in `success-700`, `text-sm`, `gray-700`
- CTA: Starter → "Get Started" (outline button, `primary-700` border/text), Growth → "Book a Demo" (filled, `accent-600`)

**Enterprise row:** `text-sm`, `gray-500`, centered below both cards with a text link "Contact us for pricing" in `primary-600`.

---

#### Section 10: FAQ Section

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   Frequently Asked Questions                                                    │
│                                                                                 │
│   ┌──────────────────────────────────────────────────────────────────────────┐ │
│   │  ▶  Does the parent need to create a new Telegram account?              │ │
│   └──────────────────────────────────────────────────────────────────────────┘ │
│   ┌──────────────────────────────────────────────────────────────────────────┐ │
│   │  ▶  Can a parent reach a teacher directly if they try?                  │ │
│   └──────────────────────────────────────────────────────────────────────────┘ │
│   ┌──────────────────────────────────────────────────────────────────────────┐ │
│   │  ▼  Is Conduit PDPA compliant?                            [open state]  │ │
│   │                                                                          │ │
│   │     Yes. Conduit was built with PDPA compliance as a first principle,   │ │
│   │     not a checkbox. Consent is collected from every user before any     │ │
│   │     data is processed. Message content is never stored — only routing   │ │
│   │     metadata (direction, timestamp, student association). All PII is    │ │
│   │     encrypted at rest. Data deletion requests are supported and         │ │
│   │     fulfillable within required timelines.                              │ │
│   └──────────────────────────────────────────────────────────────────────────┘ │
│   ...                                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**FAQ items (8):**

1. **Does the parent need to create a new Telegram account?** — No. Parents use their existing Telegram account. They click your bot's deep link, tap Start, and they are onboarded. No new apps, no new accounts.

2. **Can a parent reach a teacher directly if they try?** — No. Conduit never displays or transmits teacher Telegram handles or user IDs to parents. All messages are proxied through the bot using `copyMessage` — which does not expose the original sender's identity. There is no technical pathway for a parent to extract a teacher's contact from their bot interaction.

3. **Is Conduit PDPA compliant?** — Yes. (Full answer above.) Consent-gated. No message content stored. PII encrypted at rest. Deletion supported.

4. **What message types are supported?** — Text, photos, voice notes, videos, documents, and stickers. If a parent sends a photo of a homework problem, the teacher receives it through the bot immediately.

5. **What happens if the bot is offline?** — Conduit targets 99.5% uptime during 7am–10pm SGT. In the unlikely event of downtime, Telegram holds messages and delivers them once the bot recovers. You receive uptime alerts via Telegram to your admin account.

6. **How are teachers onboarded?** — Admin generates a single-use deep-link token from the dashboard. The token is shared with the teacher (via WhatsApp, email, or any channel). The teacher clicks the link, taps Start in Telegram, consents, and they are registered. No manual ID entry.

7. **Can we use our own bot name and handle?** — Yes. Conduit is deployed under your own bot identity (e.g., @MathMavensBot). Parents interact with your brand, not a generic "Conduit" bot.

8. **How does billing work for the platform fee?** — Platform fees are invoiced monthly via Stripe. You receive an invoice based on active student count at end of month. Stripe/PayNow available as payment method.

**Accordion design:** Single-open accordion. Question row: white bg, `border-b` `gray-200`, hover `gray-50`. Expanded answer: `gray-50` bg, `padding-4 padding-6` inset, `text-sm gray-600`. Arrow icon rotates 90 degrees on open (CSS transition 200ms).

---

#### Section 11: CTA Section (Bottom)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   [Background: primary-700 dark blue]                                           │
│                                                                                 │
│   Ready to protect your teachers                                                │
│   and streamline operations?                                                    │
│                                                                                 │
│   Get Conduit running in your center in under a week.                           │
│                                                                                 │
│               [ Book a Demo  →  ]    [ View Pricing ]                           │
│                                                                                 │
│   ✓ No long contracts   ✓ Singapore support   ✓ PDPA compliant                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Background:** `primary-800` — dark, high contrast, creates finality and urgency
**Headline:** White, `text-4xl`, 700 weight
**Subheadline:** `primary-300`, `text-lg`
**CTA 1:** "Book a Demo" — `accent-600` filled, white text — stands out dramatically against dark background
**CTA 2:** "View Pricing" — white outline button, white text
**Trust reassurances:** Three inline items in `primary-200` with checkmark icons in `success-700` (adapted for dark bg: use `success-100`)

---

#### Section 12: Footer

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  [Conduit Logo + Wordmark]                                                      │
│  The secure channel between teachers and parents.                               │
│                                                                                 │
│  Product          Company           Legal                                       │
│  Features         About             Privacy Policy                              │
│  Pricing          Contact           Terms of Service                            │
│  FAQ              Blog              PDPA Statement                              │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  © 2026 Conduit. Made in Singapore 🇸🇬    [PDPA Compliant Badge]               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Background:** `gray-950`
**Logo:** Light variant (white wordmark)
**Column headings:** `text-sm`, `gray-400`, 600 weight, uppercase, wide tracking
**Links:** `text-sm`, `gray-500`, hover `gray-200`, transition 150ms
**Divider:** `gray-800` 1px
**Bottom bar:** `text-xs`, `gray-600`, flex row with copyright left, "Made in Singapore" center, PDPA badge right
**PDPA badge:** Small pill badge, `gray-800` bg, `gray-400` text, lock icon — links to PDPA Statement page

---

### 2.2 Responsive Behavior

**Breakpoints (Tailwind standard):**

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| `sm` | 640px | Single column baseline |
| `md` | 768px | 2-column grid unlocks |
| `lg` | 1024px | 3-column grid, full sidebar layout |
| `xl` | 1280px | Content max-width applied |
| `2xl` | 1536px | Large hero typography |

**Desktop (lg+):**
- Full navigation bar with all links visible
- Hero: text left, visual right (50/50)
- Problem section: 4-col card grid
- Solution: 3-step horizontal flow
- Features: 3-col grid
- Teachers/Parents: 2-col alternating layout
- Pricing: 2-col card grid
- FAQ: Single wide column, max-width 800px centered

**Tablet (md–lg):**
- Navigation: Collapse to [Logo] + [hamburger] or retain all links if they fit
- Hero: Stack text above visual
- Problem: 2-col card grid
- Features: 2-col grid
- Teachers/Parents: Stack vertically (list below heading)
- Pricing: Stack cards vertically

**Mobile (sm–md):**
- Navigation: Hamburger menu. Drawer from right. Full-height overlay, links in large `text-lg` for touch targets. Close X button top-right.
- Hero: Text centered, CTA buttons stacked vertically, visual below
- All grids: Single column
- Pricing cards: Full width, Growth card first (most popular)
- FAQ: Full width accordion
- Footer: Stacked columns

**Touch targets:** All interactive elements minimum 44px height on mobile. Button padding increases on mobile: `py-4 px-6` (vs `py-3 px-5` desktop).

---

### 2.3 Key Interactions

**Smooth Scroll Navigation**
- All navbar anchor links use smooth scroll (`scroll-behavior: smooth` on `html` element)
- Active section highlights current nav link (Intersection Observer API with 40% threshold)
- On mobile nav link click: close drawer, then smooth scroll

**FAQ Accordion**
- Single-open behavior: opening one item closes the previously open item
- Arrow rotates 90 degrees via CSS transform, 200ms ease-in-out
- Content expands with `max-height` transition from 0 to auto (use JS to measure and set pixel value for smooth animation, then transition to `auto` after transition completes)
- Keyboard accessible: Enter/Space toggles, arrow keys navigate between items

**Demo Request Form**
- Triggered by any "Book a Demo" CTA
- Opens a centered modal dialog with `shadow-xl`, `radius-lg`, `backdrop-blur`
- Form fields: Name (text), Center Name (text), Email (email), Phone (tel, optional), Estimated Student Count (select: <50, 50–100, 100–200, 200+)
- Submit: POST to form handler or Formspree/Tally for MVP. Success state replaces form with confirmation message and calendar booking link (Calendly embed or link).
- Close: X button top-right, Escape key, click backdrop
- Trap focus within modal while open

**Scroll Animations**
- Elements animate in on scroll using IntersectionObserver
- Animation: `opacity: 0 → 1` + `translateY(16px → 0)`, 400ms ease-out
- Stagger delay for grid items: 0ms, 80ms, 160ms, 240ms per card
- `prefers-reduced-motion: reduce`: disable all animations, show elements at full opacity
- Do not animate elements already in viewport on initial page load (check if in viewport at mount)

**Hover States**
- All buttons: 150ms color transition
- Cards: `shadow-sm → shadow-md`, 200ms
- Navigation links: underline slides in from left (CSS `text-decoration` or `after:` pseudo with `scaleX` transform)

---

## Part 3: Dashboard Design

### 3.1 Global Layout

The dashboard is a standard single-page application shell with a fixed sidebar and a fixed top bar. The main content area scrolls independently.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  TOPBAR (56px fixed)                                                          │
│  [≡ toggle]  Conduit         Breadcrumb: Home / Students          [🔔] [User▼]│
└──────────────────────────────────────────────────────────────────────────────┘
┌────────────────┐  ┌─────────────────────────────────────────────────────────┐
│  SIDEBAR       │  │  MAIN CONTENT AREA                                       │
│  (256px)       │  │  (scrollable)                                            │
│                │  │                                                          │
│  [Logo]        │  │  [Page heading + actions row]                            │
│                │  │                                                          │
│  ── MAIN ──    │  │  [Content]                                               │
│  Dashboard     │  │                                                          │
│  Students      │  │                                                          │
│  Teachers      │  │                                                          │
│  Parents       │  │                                                          │
│  Mappings      │  │                                                          │
│  Tokens        │  │                                                          │
│  Broadcasts    │  │                                                          │
│                │  │                                                          │
│  ── ADMIN ──   │  │                                                          │
│  Users         │  │  (Superadmin only)                                       │
│  Audit Log     │  │  (Superadmin only)                                       │
│  System        │  │  (Superadmin only)                                       │
│                │  │                                                          │
│  ── ──────── ──│  │                                                          │
│  Settings      │  │                                                          │
│                │  │                                                          │
└────────────────┘  └─────────────────────────────────────────────────────────┘
```

**Topbar (56px, fixed):**
- Background: `#FFFFFF`, `border-b` `gray-200`
- Left: Hamburger/collapse toggle button (32px, `gray-500` icon), then Conduit logo
- Center: Breadcrumb trail — `text-sm`, `gray-500`. Current page in `gray-900`. Separator: `/` in `gray-300`.
- Right: Notification bell icon (badge count in `error-700`), then avatar + name dropdown (logout, profile)

**Sidebar (256px, `primary-50` bg):**
- Top: Conduit logo + wordmark (full variant)
- Nav sections with section labels in `text-xs uppercase tracking-wide gray-400`
- Nav items: `text-sm`, `gray-700`, hover `primary-100` bg, `primary-700` text. Active: `primary-100` bg, `primary-700` text, left border 3px `primary-600`.
- Icon left of every nav label (24px, Lucide icons)
- Collapse: On mobile, sidebar is hidden by default and slides in as overlay when hamburger is tapped. On desktop md–lg, sidebar collapses to 64px (icon only, tooltip on hover).
- Bottom: Settings link, User info (avatar, name, role badge)

**Role-based nav items:**
- Admin sees: Dashboard, Students, Teachers, Parents, Mappings, Tokens, Broadcasts, Settings
- Superadmin sees: All Admin items + Users, Audit Log, System Status

**Main Content Area:**
- Background: `gray-50`
- Padding: `space-6` all sides on desktop, `space-4` on mobile
- Max-width: 1440px, centered
- Page heading row: `text-2xl`, `gray-900`, 700 weight, left. Action button(s) right-aligned.

---

### 3.2 Dashboard Home

**URL:** `/dashboard`

**Page heading:** "Dashboard" — no actions in heading row (read-only overview page)

**Layout:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Stats Row — 4 cards]                                                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐               │
│  │  Active │  │ Active  │  │ Active  │  │ Messages Today  │               │
│  │Students │  │Teachers │  │ Parents │  │                 │               │
│  │   127   │  │   18    │  │   241   │  │     342         │               │
│  │ ↑ 3 this│  │ (stable)│  │ ↑ 5 new │  │ ↑ 12% vs avg   │               │
│  │   week  │  │         │  │         │  │                 │               │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘               │
│                                                                             │
│  [Quick Actions Row]                                                         │
│  [ + Add Student ]  [ Generate Token ]  [ New Broadcast ]                   │
│                                                                             │
│  ┌────────────────────────────────────────┐  ┌──────────────────────────┐  │
│  │  Recent Activity (last 10 relay events) │  │  System Health           │  │
│  │                                        │  │                          │  │
│  │  03 Mar 14:32  Parent→Teacher  [P5]   │  │  [●] Bot: Online         │  │
│  │  03 Mar 14:29  Teacher→Parent  [P5]   │  │  [●] Database: Healthy   │  │
│  │  03 Mar 14:21  Parent→Teacher  [P3]   │  │  [●] Redis: Healthy      │  │
│  │  ...                                  │  │  [●] Queue: 0 pending    │  │
│  │  [View full audit log →]              │  │                          │  │
│  └────────────────────────────────────────┘  │  Uptime (7d): 99.8%      │  │
│                                              │                          │  │
│                                              │  Last incident: None     │  │
│                                              └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Stats Cards:**
- White bg, `shadow-sm`, `radius-md`, padding `space-6`
- Metric number: `text-4xl`, `gray-900`, 700 weight
- Label: `text-sm`, `gray-500`, 500 weight
- Delta indicator: `text-xs`, success-700 for positive, error-700 for negative. Arrow icon + text.
- Icon in top-right of card: 20px, `primary-300`

**Quick Actions:**
- Three outlined buttons (`primary-700` border, `primary-700` text, white bg)
- Hover: `primary-50` bg
- Icon left of label (Lucide: UserPlus, Key, Megaphone)

**Recent Activity Feed:**
- Card: white bg, `shadow-sm`, `radius-md`
- Each row: timestamp `text-xs gray-400`, direction indicator ("Parent→Teacher"), grade label `primary-100/primary-700` badge, metadata only — never message content
- Row hover: `gray-50` bg
- Max 10 rows, "View full audit log →" link at bottom

**System Health Panel:**
- Card: white bg, `shadow-sm`, `radius-md`
- Status dots: 8px circle, `success-700` (green), `warning-700` (yellow), `error-700` (red)
- Each line: status dot, service name, status text
- Uptime: `text-2xl`, `gray-900`, 700 weight
- "Last incident: None" or link to last incident timestamp

---

### 3.3 Students Page

**URL:** `/dashboard/students`

**Page heading:** "Students" — right: "[ + Add Student ]" (filled `primary-700` button)

**Layout:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Students                                          [ + Add Student ] [ ↑ CSV ]│
│                                                                              │
│  [Search: "Search by name, grade, teacher..."]  [Grade ▼]  [Teacher ▼]  [Status ▼]│
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Name ↕         Grade  Teacher      Parent(s)      Status     Actions  │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Wei Ming Tan   P5     Ms Lim       Sarah Tan      ● Active   ···     │ │
│  │  Jia Hui Tan    P3     Mr Tan       Sarah Tan      ● Active   ···     │ │
│  │  Bryan Lim      P6     Ms Lim       Raymond Lim    ● Active   ···     │ │
│  │  ...                                                                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Showing 1–25 of 127     [ ◄ ]  [ 1 ] [ 2 ] [ 3 ] ... [ 6 ]  [ ► ]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Table columns:**

| Column | Type | Sortable | Notes |
|--------|------|----------|-------|
| Name | Text | Yes | First + Last, truncate at 24 chars |
| Grade | Badge | Yes | "P5", "P6", etc. `gray-100/gray-700` badge |
| Teacher | Text link | Yes | Links to teacher detail page |
| Parent(s) | Avatar stack + text | No | Up to 2 parent names, "+N more" if additional |
| Status | Status badge | Yes | Active: `success-100/success-700`, Inactive: `gray-100/gray-500` |
| Actions | Icon button row | No | Three-dot menu or inline Edit, Reassign, Deactivate |

**Filters:**
- Search: Debounced 300ms, searches name, grade, teacher name
- Grade filter: Dropdown with all grades present in dataset, plus "All Grades"
- Teacher filter: Dropdown with teacher names
- Status filter: All, Active, Inactive

**Row actions (three-dot menu):**
- Edit student details → opens slide-out panel
- Reassign teacher → opens reassign dialog (teacher picker dropdown, confirm button)
- View mappings → links to filtered Mappings view
- Deactivate → confirm dialog with "Are you sure?" warning

**Add Student slide-out panel:**
- Slides in from right, 480px wide, overlay backdrop dims main content
- Form fields: Full Name (required), Grade (required, select), Teacher (required, searchable select), Parent 1 Name + Telegram handle (required), Parent 2 Name + Telegram handle (optional)
- Submit: "Save Student" — creates record, generates parent/teacher onboarding tokens automatically
- Close: X button, pressing Escape, clicking backdrop

**Empty state:**
- Illustration: Simple line-art of a clipboard with a person silhouette
- Heading: "No students yet"
- Body: "Add your first student to start routing messages between teachers and parents."
- CTA: "Add Student" button

**Bulk import (CSV):**
- "↑ CSV" button opens a dialog with drag-and-drop zone
- Accepts `.csv` with required columns: `student_name,grade,teacher_name,parent1_name,parent1_telegram`
- Shows preview table of first 5 rows after upload
- Validation errors highlighted per row
- Confirm import button

---

### 3.4 Mappings Page

**URL:** `/dashboard/mappings`

**Page heading:** "Mappings" — right: "[ Create Mapping ]" button, "[ Table / Graph ]" toggle buttons

**Purpose:** Shows the three-way parent–student–teacher mapping relationships. Useful for auditing routing correctness and creating new mappings directly.

**Table View (default):**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Mappings                             [ Create Mapping ] [ Table ] [ Graph ] │
│                                                                              │
│  [Search mapping...]    [Teacher ▼]    [Status ▼]                           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Student         Teacher       Parent          Status     Created  Actions││
│  │  ─────────────────────────────────────────────────────────────────────  ││
│  │  Wei Ming Tan    Ms Lim        Sarah Tan       ● Active   01 Jan   ···  ││
│  │  Jia Hui Tan     Mr Tan        Sarah Tan       ● Active   01 Jan   ···  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Table columns:** Student, Teacher, Parent, Status, Created date, Actions (Edit, Deactivate)

**Visual / Graph View:**

A node-link diagram where:
- Student nodes: Blue circles, center of each cluster
- Teacher node: Larger navy square, left side
- Parent node(s): Smaller circles, right side
- Lines: Teacher ←→ Student ←→ Parent with flow arrows

Implemented with a lightweight library (React Flow or D3-force). Zoomable. Clickable nodes navigate to the detail page. Suitable for presenting the routing structure to stakeholders visually. On mobile, falls back to table view.

**Create Mapping wizard (3-step):**

Step 1 — Select Student: Searchable list of existing students (or create new)
Step 2 — Assign Teacher: Searchable teacher list, shows current student load per teacher
Step 3 — Add Parent(s): Search existing parents or add new. Shows existing parent associations.
Confirm → creates mapping record and triggers onboarding token generation for any new users.

---

### 3.5 Onboarding / Tokens Page

**URL:** `/dashboard/tokens`

**Page heading:** "Onboarding Tokens" — right: "[ Generate Token ]" button

**Purpose:** Manage single-use deep-link tokens used to onboard parents and teachers to the bot.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Onboarding Tokens                                        [ Generate Token ] │
│                                                                              │
│  [Search token or name...]   [Role ▼]   [Status ▼]   [Date range ▼]        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Token       Role     Student       Status    Created    Expires  Actions││
│  │  ────────────────────────────────────────────────────────────────────── ││
│  │  tk_a1b2c3   Parent   Wei Ming Tan  ● Pending  01 Mar   08 Mar  [Copy] ⋯││
│  │  tk_x9y8z7   Teacher  —             ● Used     28 Feb   07 Mar  ⋯      ││
│  │  tk_m5n6p7   Parent   Jia Hui Tan   ● Expired  20 Feb   27 Feb  ⋯      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Showing 1–25 of 48                                          Prev  1 2  Next │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Table columns:**

| Column | Notes |
|--------|-------|
| Token | Short ID (first 8 chars of UUID), monospace font |
| Role | "Parent" or "Teacher" badge |
| Student | Associated student name, or "—" for teacher tokens |
| Status | Pending (yellow), Used (green), Expired (gray) |
| Created | DD MMM timestamp |
| Expires | DD MMM timestamp, red text if expired |
| Actions | "Copy Link" button (inline, one-click clipboard copy), three-dot for Revoke, Regenerate |

**Copy Link behavior:**
- Copies `t.me/YourBot?start=<token>` to clipboard
- Button text momentarily changes to "Copied!" with checkmark icon
- Reverts after 2 seconds

**Generate Token dialog:**
- Form: Role (Parent/Teacher select), Student (searchable, required for Parent role, optional for Teacher), Expiry (default 7 days, override: 1/3/7/14/30 days)
- After submit: Show generated deep link with large Copy button, QR code option

**Bulk Generate:**
- For teachers: Generate N teacher tokens at once (specify count)
- For parents: Upload CSV with student names, generates one parent token per row

**Empty state:** "No tokens yet — generate your first onboarding token to start adding parents and teachers."

---

### 3.6 Broadcast Page

**URL:** `/dashboard/broadcasts`

**Page heading:** "Broadcasts" — right: "[ New Broadcast ]" button

**Layout: Two-column split**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Broadcasts                                              [ New Broadcast ]   │
│                                                                              │
│  ┌────────────────────────────────────────────┐  ┌────────────────────────┐ │
│  │  Compose                                   │  │  History               │ │
│  │                                            │  │                        │ │
│  │  Recipients:                               │  │  03 Mar 10:00          │ │
│  │  [● All Parents ▼]                         │  │  All Parents           │ │
│  │  (or: By Grade, By Teacher, Individual)    │  │  ✓ 241 delivered       │ │
│  │                                            │  │  ✗ 0 failed            │ │
│  │  Message:                                  │  │                        │ │
│  │  ┌──────────────────────────────────────┐ │  │  28 Feb 14:30          │ │
│  │  │  Type your announcement here...      │ │  │  P5 Parents (Grade)    │ │
│  │  │                                      │ │  │  ✓ 45 delivered        │ │
│  │  │                                      │ │  │  ✗ 2 failed            │ │
│  │  └──────────────────────────────────────┘ │  │                        │ │
│  │  Characters: 0 / 4096                      │  │  [View all history →]  │ │
│  │                                            │  │                        │ │
│  │  Preview:                                  │  │                        │ │
│  │  ┌──────────────────────────────────────┐ │  │                        │ │
│  │  │  [Telegram message bubble preview]   │ │  │                        │ │
│  │  └──────────────────────────────────────┘ │  │                        │ │
│  │                                            │  │                        │ │
│  │  [ Send Broadcast ]  [ Save Draft ]        │  │                        │ │
│  └────────────────────────────────────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Recipient selector:**
- Segmented control or dropdown: All Parents, By Grade, By Teacher, By Student, Individual
- When "By Grade" selected: Multi-select grade checkboxes appear
- When "By Teacher" selected: Teacher picker
- When "Individual" selected: Parent search field
- Recipient count displayed: "Sending to 127 parents"

**Message editor:**
- Plaintext textarea (Telegram does not render HTML in bot messages by default; Markdown mode available via toggle)
- Character counter against 4096 Telegram message limit
- Bold/Italic/Code toggle buttons above textarea (inserts Markdown syntax)

**Preview:**
- Live preview of message as it will appear in a Telegram message bubble
- Shows sender as "@YourBot" with center name
- Updates as user types

**Delivery progress (for active broadcast):**
- Progress bar: N / Total delivered
- Rate indicator: "Sending at 25/sec per Telegram limits"
- Estimated completion time
- Cancel button (stops queue, does not unsend delivered messages)

**History table:** Date, Scope (text description), Delivered count, Failed count (red if >0), Status badge (Sent/Sending/Failed)

---

### 3.7 Teachers Page

**URL:** `/dashboard/teachers`

**Page heading:** "Teachers" — right: "[ Add Teacher ]" button

**Table:**

| Column | Notes |
|--------|-------|
| Name | Full name |
| Student Count | Number badge, links to filtered students view |
| Status | Active / Inactive badge |
| Onboarding | "Onboarded" (checkmark) or "Pending" (clock icon) — whether they have completed bot setup |
| Last Active | Relative timestamp ("2 hours ago") via bot relay activity |
| Actions | View, Edit, Generate Token, Deactivate |

**Teacher Detail Page (`/dashboard/teachers/:id`):**
- Breadcrumb: Teachers / Ms Lim Boon Hui
- Header: Name, status badge, joined date, last active
- Stats: Student count, messages relayed today, messages this month
- Student list table (inline): Name, Grade, Status — with "Reassign" action per row
- Token section: Current onboarding token status, "Generate new token" button
- Deactivate button (destructive, `error-700` outline, confirm dialog)

---

### 3.8 Parents Page

**URL:** `/dashboard/parents`

**Page heading:** "Parents" — no primary action (parents are added through student creation)

**Table:**

| Column | Notes |
|--------|-------|
| Name | From Telegram display name |
| Children | Comma-separated list of enrolled child names |
| Onboarding | "Active" / "Pending" / "Expired token" |
| Last Active | Relative timestamp from last relay event |
| Actions | View, Generate new token, Deactivate |

**Parent Detail Page (`/dashboard/parents/:id`):**
- Header: Name, status, Telegram username (masked: `@s***n`), joined date
- Children section: Cards for each enrolled child showing name, grade, assigned teacher, current session status
- Communication stats: Messages sent this week, messages received this week
- PDPA section: Consent record date, "Submit Deletion Request" link (Superadmin only)

---

### 3.9 User Management (Superadmin)

**URL:** `/dashboard/users`

**Page heading:** "Dashboard Users" — right: "[ + Create Admin ]" button

**Purpose:** Manage who has access to the Conduit web dashboard (not Telegram users — those are managed via student/teacher/parent pages).

**Table:**

| Column | Notes |
|--------|-------|
| Email | Admin's email address |
| Role | "Admin" or "Superadmin" badge |
| Status | Active / Inactive |
| Last Login | Relative timestamp |
| Actions | Edit role, Deactivate, Reset password |

**Role actions:**
- "Promote to Superadmin" — confirm dialog: "This grants full system access including audit logs, user management, and system configuration. Confirm?"
- "Demote to Admin" — confirm dialog
- "Deactivate" — confirm dialog, user immediately loses dashboard access

**Create Admin form (dialog):**
- Fields: Email (required), Role (Admin default, Superadmin available), Send invite email checkbox (checked by default)
- On submit: Creates account, sends magic link or temporary password via email

---

### 3.10 Audit Log (Superadmin)

**URL:** `/dashboard/audit`

**Page heading:** "Audit Log" — right: "[ Export CSV ]" button

**Purpose:** Comprehensive searchable log of all system events: relay events (metadata only), admin actions, user management changes, system events.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Audit Log                                                    [ Export CSV ] │
│                                                                              │
│  [Search...]  [Actor ▼]  [Action type ▼]  [Date range: 01 Mar – 03 Mar]    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Timestamp          Actor        Action              Target      Details ││
│  │  ─────────────────────────────────────────────────────────────────────  ││
│  │  03 Mar 14:32 SGT  System       Message relayed     P5-Student  →Teacher││
│  │  03 Mar 14:28 SGT  priya@mm.sg  Student created     Wei Ming    —       ││
│  │  03 Mar 13:15 SGT  System       Token generated     Parent      tk_a1b2 ││
│  │  03 Mar 09:00 SGT  jonathan@mm  Role promoted       priya@mm.sg Admin→SA││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Showing 1–50 of 4,821                     Prev  1 2 3 ... 97  Next         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Columns:**
- Timestamp: DD MMM HH:MM SGT, `text-xs`, monospace
- Actor: Email address for dashboard users, "System" for automated events
- Action: Past-tense verb phrase ("Message relayed", "Student created", "Token expired", "User deactivated")
- Target: Entity name or ID
- Details: Brief additional context

**Filters:**
- Free-text search (searches Actor, Action, Target, Details)
- Actor filter: Dropdown of all dashboard users + "System"
- Action type: Dropdown categories (Relay, User Management, Token, Config)
- Date range picker: Preset options (Today, Last 7 days, Last 30 days, Custom range)

**Export CSV:** Downloads filtered result set as CSV. Server-side stream for large exports.

**PDPA note:** Message content is never present in any audit log row. The Details column contains only direction, student association, and routing metadata.

---

### 3.11 System Status (Superadmin)

**URL:** `/dashboard/system`

**Page heading:** "System Status" — right: "[ Refresh ]" button (icon, rotates while loading)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  System Status                                                    [ Refresh ] │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Bot          │  │  Database    │  │  Redis       │  │  Queue       │   │
│  │  [● Online]   │  │  [● Healthy] │  │  [● Healthy] │  │  0 pending   │   │
│  │  Webhook set  │  │  v16.2       │  │  v7.0        │  │  0 failed    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────┐  ┌──────────────────────────────┐ │
│  │  Message Volume (Last 7 Days)        │  │  Error Rate                  │ │
│  │                                      │  │                              │ │
│  │  [Bar chart: Mon–Sun, messages/day]  │  │  [Line chart: errors/hour]   │ │
│  │  Mon: 312  Tue: 287  Wed: 401...     │  │  Current: 0.02%              │ │
│  └──────────────────────────────────────┘  └──────────────────────────────┘ │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │  Active Sessions                                                         ││
│  │  Dashboard sessions: 2   Telegram relay sessions: 48                    ││
│  │                                                                          ││
│  │  Uptime (30 days): 99.81%   Last restart: 28 Feb 2026 03:15 SGT         ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Service status cards (4):** Each shows service name, status dot + label, version, last check time.
- Status: Online/Healthy (`success-700`), Degraded (`warning-700`), Down (`error-700`)

**Message Volume Chart:** Bar chart using Recharts. X-axis: day labels (Mon, Tue...). Y-axis: message count. Color: `primary-500` bars, hover tooltip with exact count.

**Error Rate Chart:** Line chart using Recharts. Time-based X-axis (24h). Y-axis: error % from 0. Red line (`error-600`). Green target line at 0.5%.

**Active Sessions:** Count of current Redis sessions for dashboard users and Telegram relay sessions. Auto-refreshes every 30 seconds.

---

### 3.12 Settings (Superadmin)

**URL:** `/dashboard/settings`

**Page heading:** "Settings"

**Layout:** Single column, sectioned with clear headings and save buttons per section.

**Section 1: Business Hours**

```
Business Hours
─────────────
[Monday – Friday]  Start: [09:00 ▼]  End: [21:00 ▼]
[Saturday]         Start: [09:00 ▼]  End: [18:00 ▼]
[Sunday]           [Toggle: Off]

Outside business hours: [Route to AI (OpenClaw) ▼]
   Options: Route to AI, Delay + notify teacher, Reject with message

[ Save Business Hours ]
```

**Section 2: Session Configuration**

```
Session Configuration
─────────────────────
Dashboard session timeout:  [24 hours ▼]
Parent session timeout:     [No expiry ▼]
Token expiry default:       [7 days]  (input, number)

[ Save Session Config ]
```

**Section 3: Rate Limits**

```
Rate Limits
───────────
Max messages per parent per hour:   [60]  (input)
Broadcast send rate (msgs/sec):     [25]  (input, max 30 per Telegram limit, tooltip explains)
AI escalation threshold:            [3 messages unanswered] (input)

[ Save Rate Limits ]
```

**Section 4: PDPA Deletion Queue**

```
PDPA Data Deletion Requests
────────────────────────────
[Table: Request ID, Requester, Submitted, Status, Action]
Row: REQ-001  Sarah Tan  28 Feb  ● Pending  [Review] [Execute Deletion]
```

- "Execute Deletion" triggers soft-delete of all PII for that user, returns confirmation record
- Confirmation dialog: "This will permanently delete all personal data for Sarah Tan. This cannot be undone. Type DELETE to confirm."
- Confirmation record stored in audit log

---

## Part 4: Component Library

### 4.1 shadcn/ui Components to Install

Install the following shadcn/ui components via `npx shadcn@latest add <component>`:

**Layout & Navigation:**
- `sidebar` — Dashboard sidebar shell
- `separator` — Dividers within nav sections
- `breadcrumb` — Topbar breadcrumb trail
- `scroll-area` — Sidebar and table scroll containers

**Data Display:**
- `table` — Base for all data tables
- `badge` — Status badges, role pills, grade labels
- `avatar` — User avatars in topbar and table
- `card` — Stat cards, feature cards, detail panels
- `progress` — Broadcast delivery progress bar

**Forms & Inputs:**
- `input` — Text, email, number inputs
- `textarea` — Broadcast message composer
- `select` — Grade, teacher, role dropdowns
- `combobox` — Searchable dropdowns (teacher picker, student picker)
- `checkbox` — Multi-select filters, form options
- `radio-group` — Recipient type selector
- `switch` — Enable/disable toggles (business hours days, settings flags)
- `label` — All form labels
- `form` — React Hook Form + Zod integration wrapper

**Overlays:**
- `dialog` — Confirm dialogs, generate token, create admin
- `sheet` — Slide-out panels (Add Student, Edit Student)
- `popover` — Date range picker overlay, filter dropdowns
- `tooltip` — Icon button labels, truncated text explanations
- `dropdown-menu` — Three-dot action menus, user menu in topbar

**Feedback:**
- `toast` — Sonner-based toast notifications (success, error, info)
- `alert` — Inline warning/error banners (e.g., degraded system status)
- `skeleton` — Loading states for table rows and stat cards

**Navigation:**
- `tabs` — View toggles (table/graph in Mappings, compose/history toggle)
- `accordion` — Landing page FAQ section
- `pagination` — Table pagination
- `command` — Command palette (`⌘K`) for power users to navigate dashboard quickly

**Date/Time:**
- `calendar` — Date range picker (Audit Log filter)
- `date-picker` — Single date inputs

### 4.2 Custom Components

Built on top of shadcn/ui foundations:

**`<DataTable>`**

The primary reusable table component used on every list page. Built with TanStack Table v8.

Props:
```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  filterConfig?: FilterConfig[]
  searchPlaceholder?: string
  onRowClick?: (row: TData) => void
  emptyState?: React.ReactNode
  pagination?: PaginationConfig
}
```

Features:
- Column sorting (click header)
- Client-side filtering for small datasets, server-side filtering for large (configurable)
- Pagination (25 rows default, 10/25/50/100 options)
- Row click handler (navigates to detail page)
- Loading state (Skeleton rows replacing content)
- Empty state slot
- Column visibility toggle (⚙ button in table header row)
- Responsive: on mobile, hide low-priority columns (configurable per table)

**`<StatusBadge>`**

Displays status with semantic color. Variants: active, inactive, pending, expired, used, online, degraded, down.

```typescript
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'expired' | 'used' | 'online' | 'degraded' | 'down'
  showDot?: boolean  // 8px colored dot left of text
}
```

**`<PageHeader>`**

Consistent heading row across all dashboard pages.

```typescript
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode  // Buttons rendered right-aligned
  breadcrumbs?: Breadcrumb[]
}
```

**`<StatCard>`**

Dashboard home metric cards.

```typescript
interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  delta?: { value: number; label: string; direction: 'up' | 'down' | 'neutral' }
}
```

**`<TokenDisplay>`**

Shows a token deep link with inline copy button.

```typescript
interface TokenDisplayProps {
  token: string
  botUsername: string  // e.g. "MathMavensBot"
  onCopy?: () => void
}
```

Renders: `t.me/MathMavensBot?start=tk_a1b2c3` in a monospace input-like box with a "Copy" button that shows a checkmark on click.

**`<ConfirmDialog>`**

Reusable destructive action confirmation dialog.

```typescript
interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string  // default: "Confirm"
  confirmVariant?: 'default' | 'destructive'
  requireTypedConfirmation?: string  // if set, user must type this string
  onConfirm: () => Promise<void>
  isLoading?: boolean
}
```

**`<SlideOutPanel>`**

Right-side slide-over form panel (used for Add/Edit Student, Add Teacher).

```typescript
interface SlideOutPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  width?: '480px' | '640px'
  children: React.ReactNode
  footer?: React.ReactNode  // Save/Cancel buttons
}
```

**`<EmptyState>`**

Standardized empty state display.

```typescript
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}
```

**`<SystemStatusDot>`**

Single status indicator dot with tooltip.

```typescript
interface SystemStatusDotProps {
  status: 'healthy' | 'degraded' | 'down'
  label: string
  size?: 'sm' | 'md'
}
```

### 4.3 Data Table Column Specification Pattern

Every column definition follows this pattern:

```typescript
const columns: ColumnDef<Student>[] = [
  {
    id: 'select',
    header: ({ table }) => <Checkbox ... />,  // bulk select
    cell: ({ row }) => <Checkbox ... />,
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column} label="Name" />,
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">{row.original.name}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} showDot />,
    filterFn: 'equals',
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActionsMenu row={row} />,
    enableSorting: false,
  },
]
```

### 4.4 Form Patterns

**Standard create/edit entity form:**

1. All forms use React Hook Form + Zod for validation
2. Schema defined in `src/lib/schemas/<entity>.ts`
3. Error messages displayed inline below each field (`text-sm text-error-700`)
4. Required fields marked with red asterisk
5. Submit button disabled during loading (shows spinner icon left of label)
6. On success: toast notification + close panel/dialog
7. On error: toast notification with error message, form remains open

```typescript
// Example schema pattern
const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  grade: z.enum(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4']),
  teacherId: z.string().uuid('Please select a teacher'),
  parent1Name: z.string().min(2),
  parent1Telegram: z.string().regex(/^@?[a-zA-Z0-9_]{5,32}$/, 'Invalid Telegram handle'),
  parent2Name: z.string().optional(),
  parent2Telegram: z.string().optional(),
})
```

### 4.5 Modal / Dialog Patterns

- All destructive actions require a confirmation dialog
- Dialogs that involve significant data entry (token generation, create admin) use `<Dialog>` with a max-width of 480px
- Slide-out panels (`<SlideOutPanel>`) are used for forms that benefit from more horizontal space (add student, edit student)
- Focus is trapped inside dialog/panel while open
- All dialogs/panels close on Escape key press
- Backdrop click closes non-destructive dialogs; does not close confirm dialogs (prevent accidental dismissal)

### 4.6 Toast Notification Patterns

Using Sonner (shadcn's recommended toast library).

```typescript
// Success
toast.success('Student added', {
  description: 'Wei Ming Tan has been added. Onboarding tokens have been generated.',
})

// Error
toast.error('Failed to save changes', {
  description: error.message,
  action: { label: 'Retry', onClick: handleRetry },
})

// Async action with loading state
toast.promise(saveStudent(data), {
  loading: 'Saving student...',
  success: 'Student saved successfully',
  error: 'Failed to save student',
})
```

Position: bottom-right on desktop, bottom-center on mobile. Duration: 4000ms default, 6000ms for errors. Max 3 toasts visible simultaneously.

---

## Part 5: File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── landing/
│   │   │   └── LandingPage.tsx          # Public landing page
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx            # Email/password login
│   │   │   └── MagicLinkPage.tsx        # Magic link landing
│   │   └── dashboard/
│   │       ├── DashboardHome.tsx        # /dashboard
│   │       ├── StudentsPage.tsx         # /dashboard/students
│   │       ├── StudentDetailPage.tsx    # /dashboard/students/:id
│   │       ├── TeachersPage.tsx         # /dashboard/teachers
│   │       ├── TeacherDetailPage.tsx    # /dashboard/teachers/:id
│   │       ├── ParentsPage.tsx          # /dashboard/parents
│   │       ├── ParentDetailPage.tsx     # /dashboard/parents/:id
│   │       ├── MappingsPage.tsx         # /dashboard/mappings
│   │       ├── TokensPage.tsx           # /dashboard/tokens
│   │       ├── BroadcastsPage.tsx       # /dashboard/broadcasts
│   │       ├── superadmin/
│   │       │   ├── UsersPage.tsx        # /dashboard/users (superadmin)
│   │       │   ├── AuditLogPage.tsx     # /dashboard/audit (superadmin)
│   │       │   ├── SystemStatusPage.tsx # /dashboard/system (superadmin)
│   │       │   └── SettingsPage.tsx     # /dashboard/settings (superadmin)
│   │       └── NotFoundPage.tsx
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui primitives (auto-generated, do not edit)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── command.tsx
│   │   │   ├── combobox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx      # Sidebar + topbar shell for /dashboard/*
│   │   │   ├── LandingLayout.tsx        # Navbar + footer shell for /
│   │   │   ├── Sidebar.tsx              # Dashboard sidebar with nav items, role filtering
│   │   │   ├── Topbar.tsx               # Dashboard topbar: breadcrumb, user menu, notifications
│   │   │   ├── LandingNav.tsx           # Landing page sticky navbar
│   │   │   └── Footer.tsx               # Landing page footer
│   │   │
│   │   ├── features/
│   │   │   ├── students/
│   │   │   │   ├── StudentTable.tsx         # DataTable instance for students
│   │   │   │   ├── StudentColumns.tsx       # Column definitions for student table
│   │   │   │   ├── AddStudentPanel.tsx      # SlideOutPanel for creating a student
│   │   │   │   ├── EditStudentPanel.tsx     # SlideOutPanel for editing a student
│   │   │   │   ├── ReassignDialog.tsx       # Teacher reassignment dialog
│   │   │   │   └── BulkImportDialog.tsx     # CSV bulk import dialog
│   │   │   │
│   │   │   ├── teachers/
│   │   │   │   ├── TeacherTable.tsx
│   │   │   │   ├── TeacherColumns.tsx
│   │   │   │   └── AddTeacherPanel.tsx
│   │   │   │
│   │   │   ├── parents/
│   │   │   │   ├── ParentTable.tsx
│   │   │   │   ├── ParentColumns.tsx
│   │   │   │   └── ParentDetailCard.tsx
│   │   │   │
│   │   │   ├── mappings/
│   │   │   │   ├── MappingTable.tsx
│   │   │   │   ├── MappingColumns.tsx
│   │   │   │   ├── MappingGraph.tsx         # React Flow visual graph view
│   │   │   │   └── CreateMappingWizard.tsx  # 3-step mapping creation
│   │   │   │
│   │   │   ├── tokens/
│   │   │   │   ├── TokenTable.tsx
│   │   │   │   ├── TokenColumns.tsx
│   │   │   │   ├── GenerateTokenDialog.tsx
│   │   │   │   └── TokenDisplay.tsx         # Deep link display with copy button
│   │   │   │
│   │   │   ├── broadcasts/
│   │   │   │   ├── BroadcastComposer.tsx    # Message compose panel
│   │   │   │   ├── RecipientSelector.tsx    # All/Grade/Teacher/Individual selector
│   │   │   │   ├── MessagePreview.tsx       # Telegram bubble preview
│   │   │   │   ├── BroadcastHistory.tsx     # History table
│   │   │   │   └── DeliveryProgress.tsx     # Live progress indicator
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.tsx
│   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   └── SystemHealthWidget.tsx
│   │   │   │
│   │   │   ├── audit/
│   │   │   │   ├── AuditTable.tsx
│   │   │   │   ├── AuditColumns.tsx
│   │   │   │   └── AuditFilters.tsx
│   │   │   │
│   │   │   ├── system/
│   │   │   │   ├── ServiceStatusCard.tsx
│   │   │   │   ├── MessageVolumeChart.tsx   # Recharts bar chart
│   │   │   │   └── ErrorRateChart.tsx       # Recharts line chart
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── BusinessHoursForm.tsx
│   │   │   │   ├── SessionConfigForm.tsx
│   │   │   │   ├── RateLimitsForm.tsx
│   │   │   │   └── PdpaDeletionQueue.tsx
│   │   │   │
│   │   │   └── landing/
│   │   │       ├── HeroSection.tsx
│   │   │       ├── SocialProofBar.tsx
│   │   │       ├── ProblemSection.tsx
│   │   │       ├── HowItWorksSection.tsx
│   │   │       ├── FeaturesGrid.tsx
│   │   │       ├── DashboardPreviewSection.tsx
│   │   │       ├── ForTeachersSection.tsx
│   │   │       ├── ForParentsSection.tsx
│   │   │       ├── PricingSection.tsx
│   │   │       ├── FaqSection.tsx
│   │   │       ├── CtaSection.tsx
│   │   │       └── DemoRequestModal.tsx     # Demo booking modal
│   │   │
│   │   └── shared/
│   │       ├── DataTable.tsx               # Generic reusable DataTable component
│   │       ├── StatusBadge.tsx
│   │       ├── PageHeader.tsx
│   │       ├── SlideOutPanel.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       ├── SortableHeader.tsx          # Sortable column header wrapper
│   │       ├── SystemStatusDot.tsx
│   │       └── DateRangePicker.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                   # Axios/fetch wrapper with auth headers, error handling
│   │   │   ├── students.ts                 # Student API functions
│   │   │   ├── teachers.ts
│   │   │   ├── parents.ts
│   │   │   ├── mappings.ts
│   │   │   ├── tokens.ts
│   │   │   ├── broadcasts.ts
│   │   │   ├── users.ts
│   │   │   ├── audit.ts
│   │   │   └── system.ts
│   │   │
│   │   ├── auth.ts                         # Auth state, login/logout functions
│   │   ├── queryClient.ts                  # TanStack Query client config
│   │   ├── utils.ts                        # cn() helper, date formatting, truncation
│   │   ├── constants.ts                    # Routes, pagination defaults, grade options
│   │   └── schemas/
│   │       ├── student.ts                  # Zod schemas for form validation
│   │       ├── teacher.ts
│   │       ├── parent.ts
│   │       ├── token.ts
│   │       ├── broadcast.ts
│   │       └── user.ts
│   │
│   ├── hooks/
│   │   ├── useStudents.ts                  # TanStack Query hooks for data fetching
│   │   ├── useTeachers.ts
│   │   ├── useParents.ts
│   │   ├── useMappings.ts
│   │   ├── useTokens.ts
│   │   ├── useBroadcasts.ts
│   │   ├── useUsers.ts
│   │   ├── useAuditLog.ts
│   │   ├── useSystemStatus.ts
│   │   ├── useAuth.ts                      # Current user, role, session state
│   │   ├── useDebounce.ts                  # Debounced search input
│   │   ├── useClipboard.ts                 # Copy-to-clipboard with feedback state
│   │   └── useIntersectionObserver.ts      # Scroll animation trigger
│   │
│   ├── styles/
│   │   ├── globals.css                     # Tailwind directives, CSS custom properties (tokens)
│   │   └── landing.css                     # Landing-page-specific animations and overrides
│   │
│   ├── router.tsx                          # React Router v6 route definitions, auth guard
│   ├── main.tsx                            # React entry point, QueryClientProvider, Toaster
│   └── App.tsx                             # Root component
│
├── public/
│   ├── favicon.ico                         # 16px icon variant of Conduit mark
│   ├── favicon-32.png
│   ├── apple-touch-icon.png
│   ├── og-image.png                        # 1200x630 Open Graph image for landing page
│   └── logo/
│       ├── conduit-mark.svg                # Icon only
│       ├── conduit-wordmark-dark.svg       # Dark wordmark (for light backgrounds)
│       └── conduit-wordmark-light.svg      # Light wordmark (for dark backgrounds)
│
├── index.html                              # Vite HTML entry, meta tags, OG tags
├── vite.config.ts                          # Vite config: alias @/ = src/, proxy /api → backend
├── tailwind.config.ts                      # Custom tokens mapped to Tailwind theme
├── tsconfig.json
├── tsconfig.app.json
├── postcss.config.js
├── components.json                         # shadcn/ui config
└── package.json
```

**Key architectural notes on file structure:**

1. **`pages/` contains only route-level components.** No business logic. Pages assemble feature components and pass data from query hooks down as props.

2. **`components/features/` is organized by domain, not by component type.** All components related to students (table, columns, panels, dialogs) live together in `features/students/`. This makes feature-level changes localized.

3. **`components/ui/` is owned by shadcn/ui CLI.** Never manually edit files here — re-run the shadcn CLI to update. Custom overrides go in `shared/` or feature directories.

4. **`lib/api/` functions are thin wrappers.** They call `client.ts` and return typed responses. TanStack Query hooks in `hooks/` wrap these functions and handle caching, loading, and error state.

5. **`lib/schemas/` is the single source of truth for data shapes.** Used in both forms (React Hook Form `resolver`) and API response validation.

6. **`router.tsx` handles auth guarding.** Routes under `/dashboard` are wrapped in an `<AuthGuard>` component that checks session state and redirects to `/login` if unauthenticated. Superadmin-only routes check `user.role === 'superadmin'` and render a 403 page if unauthorized.

---

*End of document. Version 1.0 — 2026-03-03.*
