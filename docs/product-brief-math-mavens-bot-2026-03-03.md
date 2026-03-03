# Product Brief: Conduit — Math Mavens Telegram Bot

**Date:** 2026-03-03
**Author:** Business Analyst (BMAD)
**Project:** math-mavens-bot
**Type:** Telegram Bot Platform
**Level:** 3 (Complex Integration, 12-40 stories)

---

## 0. Platform Identity

**Platform Name:** Conduit
**First Customer:** Math Mavens (Singapore math tuition center)
**Customer-Branded Bot:** @MathMavens_bot

Conduit is the product and platform. Math Mavens is the first customer — their deployment of Conduit runs under @MathMavens_bot, a customer-branded Telegram bot instance. The web dashboard is Conduit-branded; the Telegram bot is branded per customer.

The name Conduit captures two meanings that fit naturally in the education and tuition context:
1. **Conduit for communication** — the teacher ↔ parent relay; all messages flow through Conduit, never directly between parties.
2. **Conduit for knowledge** — the teacher → student learning channel; AI-assisted homework support flows through the same infrastructure.

Future deployments (Phase 5) will run Conduit for other tuition centers under their own customer-branded bot handles and dashboard tenants.

---

## 1. Executive Summary

**Conduit**, deployed for Math Mavens (MM) as @MathMavens_bot, is a Telegram-based communication and operations platform designed to replace ad-hoc, unstructured teacher-parent messaging while simultaneously eliminating teacher poaching — a systemic revenue threat in the S$1.8B Singapore tuition industry. Conduit proxies all teacher-parent communication through a central bot using Virtual Chat IDs to prevent direct contact from ever being established, while layering AI-assisted homework support, automated attendance tracking, and integrated PayNow billing on top of the routing core. This document covers the Math Mavens deployment — the first customer instance of the Conduit platform. This is a strategic pivot away from a failed native mobile app, leveraging Telegram's existing 38–49% Singapore penetration to achieve near-zero onboarding friction.

---

## 2. Problem Statement

### The Problem

Math Mavens operates in a high-churn, relationship-driven market where its most valuable asset — its teachers — are perpetually at risk of being poached. When parents communicate directly with teachers via WhatsApp or phone, they develop personal relationships that make private "cut-out-the-middleman" arrangements inevitable. There is no technical barrier preventing this. Current operations also suffer from:

- **Communication fragmentation**: Messages scattered across WhatsApp, SMS, and email with no audit trail or searchability.
- **Manual payment reconciliation**: Parents PayNow to personal UENs, send screenshots, and require staff to manually verify and record — error-prone and labor-intensive.
- **Manual attendance tracking**: Paper or verbal confirmation with no reliable records for disputes or reporting.
- **No 24/7 academic support**: Teachers cannot realistically respond to homework questions outside business hours, a key parent expectation in Singapore's high-pressure academic culture.

### Why Now

- The native mobile app attempt has already consumed development budget and time with no delivery. The team needs a working system, not another multi-month development cycle.
- Singapore's Telegram penetration (38–49%) means parents already have the app installed. A Telegram bot requires zero installation and starts with the familiar `/start` command.
- Telegram Bot API is mature, free, and capable — providing copyMessage-based anonymous relay, file_id media reuse, deep-link onboarding, and webhook delivery. WhatsApp Business API costs are prohibitive and rate-limited.
- Stripe now natively supports PayNow in Singapore with webhook-confirmed, chargeback-free transactions — removing the last major integration blocker for automated billing.
- OpenClaw (formerly Clawd Bot) provides a production-ready, local-first AI agent framework with native Telegram integration and multi-agent session management, eliminating the need to build AI middleware from scratch.

### Impact if Unsolved

- Teacher poaching continues unchecked, eroding teacher retention and student continuity.
- Revenue leakage accelerates as parents shift to private arrangements with tutor rates below what the center charges.
- Operational costs of manual payment reconciliation and attendance tracking remain, constraining the center's ability to scale.
- Competitor tuition centers that adopt platform-level poaching prevention gain a structural advantage in teacher retention.
- Parents increasingly expect digital-first communication; centers without it suffer perception damage and enrollment decline.

---

## 3. Target Audience

### Primary Users

**Parents / Guardians**
- Singapore residents, predominantly working adults aged 30–50.
- Already using Telegram for personal and community communication.
- Primary concern: academic progress of their child, convenient access to teachers, timely fee payment.
- Low tolerance for app installs or complicated onboarding; high trust in WhatsApp/Telegram as communication channels.
- PDPA concern: want to know their personal data is not shared without consent.

**Teachers / Tutors**
- Full-time and part-time math educators employed or contracted by Math Mavens.
- Currently using personal Telegram handles or phone numbers for parent communication — a practice the platform will replace.
- Need fast, reliable message routing without additional workflow overhead.
- Want to avoid out-of-hours contact while remaining reachable for urgent academic matters via bot triage.

### Secondary Users

**Admin (Math Mavens Office Staff — "Priya" persona)**
- Day-to-day operational user. Non-technical.
- Manages class assignments, student enrollment, teacher-parent mapping.
- Handles billing disputes, attendance exceptions, and onboarding new families.
- Primary interface is the web dashboard; bot commands available as mobile supplement for quick actions.

**Superadmin (Management / Owners)**
- System owner, MM Director, or Developer. Full system control.
- Visibility into revenue collection, class utilization, and teacher performance metrics.
- Responsible for PDPA compliance, audit trail, and user role management.
- Decision-makers for future feature investment.

### User Needs

| User | Core Needs |
|------|-----------|
| Parent | Message teacher without knowing their contact; pay fees digitally; receive class updates; get homework help 24/7 |
| Teacher | Receive parent messages without exposing personal contact; reply through same bot interface; review class roster and attendance |
| Admin | Manage student-teacher-parent mappings; generate onboarding deep-link tokens; broadcast announcements; view lists; basic reporting |
| Superadmin | Audit trail for communication; user role management (promote/demote Admin); deactivate/reactivate users; PDPA data deletion requests; system configuration and diagnostics; bulk data import/export |

---

## 4. Solution Overview

### Proposed Solution

A Telegram-native routing engine operating under @MathMavens_bot that proxies all teacher-parent communication through Virtual Chat IDs, completely obfuscating personal Telegram handles. The system stores a three-way mapping (Parent ↔ Student ↔ Teacher) in a backend database. When a parent sends a message, the backend identifies their linked teacher, copies the message (not forwards — preserving anonymity via `copyMessage`) to the teacher's bot chat, and vice versa. Neither party ever sees the other's Telegram username, user ID, or phone number.

An AI layer (via OpenClaw) provides 24/7 automated homework support for out-of-hours queries, reducing teacher burden while maintaining parent satisfaction. Administrative functions (class assignment management, attendance, billing) are integrated incrementally.

### Key Features

**Core MVP**

1. **Onboarding via Deep Link**: Parents and teachers register through `t.me/MathMavens_bot?start=<token>` links — no manual ID lookup required. Each token is pre-generated per enrollment and single-use.

2. **Virtual Chat ID Routing (Proxy Relay)**: Backend maps Parent Telegram User ID ↔ Student ↔ Teacher Telegram User ID. All messages relayed using `copyMessage` — no "Forwarded from" attribution. Media (photos of worksheets, voice notes) relayed via `file_id` reuse without re-upload.

3. **Multi-Child Parent Handling**: Parents with multiple enrolled children receive a session selector when messaging; routing context switches per selection.

4. **Teacher Reply Context**: Teachers see a header stub with the student name on each relayed message (injected by bot, not visible to parent) so they know who they are replying to without needing to track context manually.

5. **Admin and Superadmin Mapping Management**: The primary interface for Admin (office staff) and Superadmin is the web dashboard (see feature #6 below). Bot commands serve as the mobile supplement for quick on-the-go actions. Capabilities: add/remove student-teacher-parent mappings, reassign students when teachers change, and deactivate/reactivate users. Superadmin additionally manages user role promotion/demotion and accesses audit logs.

6. **Web Dashboard for Admin/Superadmin**: Web-based dashboard for operational management. Primary interface for Admin (office staff) and Superadmin. Features: student-teacher-parent mapping management (CRUD, search, filter), onboarding token generation with copyable deep links, broadcast composer, user management (Superadmin), audit log viewer (Superadmin), system status (Superadmin). Responsive design for tablet/desktop use by office staff. Protected by authentication separate from Telegram (email/password or magic link). Served over HTTPS, co-hosted on the same VPS/Nginx as the bot webhook.

7. **Broadcast / Announcements**: Admin (and Superadmin) can push announcements to all parents, a class cohort, or individual parent chats. Composable from either the web dashboard broadcast composer or bot commands.

**AI Layer (Phase 2)**

8. **24/7 Homework Support (OpenClaw)**: Out-of-hours parent messages containing photos or typed math questions are triaged by OpenClaw before routing. If the AI can resolve the query with high confidence, it responds and logs the interaction. If not, it queues for teacher attention at next availability window.

9. **Session Memory**: OpenClaw maintains per-student session context so AI interactions are coherent across multiple messages.

**Operations (Phase 2/3)**

10. **Attendance Tracking**: Teachers mark attendance via bot command post-class. Parents receive automated confirmation. Admin pulls reports.

11. **Automated Billing (Stripe/PayNow)**: Monthly invoices generated per student enrollment. Dynamic PayNow QR codes issued via Stripe. Webhook confirms payment. Admin dashboard reconciles automatically.

### Value Proposition

| Stakeholder | Value Delivered |
|-------------|----------------|
| Math Mavens (Business) | Structural poaching prevention; cleaner operations; audit trail; automated billing |
| Parents | No app install; familiar Telegram interface; 24/7 AI homework help; digital fee payment |
| Teachers | No personal contact exposure; structured inbox; reduced after-hours pressure via AI triage |
| Admin | Web dashboard as primary tool for mapping management, token generation, and broadcasts; bot commands as mobile supplement for quick actions |
| Superadmin | Web dashboard as primary tool: audit log viewer, user role management, system status; full PDPA compliance tools; bot commands for on-the-go access |
| Conduit Platform | Proven, reusable architecture for teacher-parent communication that can be licensed or deployed for other tuition centers (Phase 5); building a product, not a one-off bot |

---

## 5. Business Objectives

### Business Goals (SMART)

**BG-01 — Eliminate Direct Contact Leakage**
By Q3 2026, zero teacher-parent direct contact established through Math Mavens-enrolled students, measured by zero reported poaching incidents attributable to platform use.

**BG-02 — Reduce Admin/Superadmin Overhead**
By Q4 2026, reduce time spent on payment reconciliation and attendance recording by 80% compared to pre-platform baseline, measured by Admin staff time tracking.

**BG-03 — Improve Parent Communication Satisfaction**
By Q3 2026, achieve NPS of 40+ from enrolled parents surveyed on communication experience (baseline assumed sub-20 due to fragmented channels).

**BG-04 — Full Fee Collection Automation**
By Q4 2026, 90% of monthly fee collection processed through automated Stripe/PayNow with zero manual reconciliation required.

**BG-05 — Platform Deployment**
Bot live and onboarding first cohort of parents and teachers within 8 weeks of project kickoff.

### Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Parents onboarded via deep link | 100% of enrolled families | Onboarding flow completion logs |
| Messages proxied without direct contact established | 100% | Bot relay logs; zero direct handle exposures |
| Teacher response time (during hours) | < 4 hours median | Message timestamp delta in relay logs |
| AI resolution rate (out-of-hours) | > 60% of after-hours queries resolved without teacher | OpenClaw resolution logs |
| Payment collection via platform | > 90% of invoices | Stripe webhook confirmation rate |
| Attendance records digital | 100% of classes | Attendance command submission rate |
| Monthly active users (parents) | > 80% of enrolled families | Telegram interaction logs |

### Business Value

- **Revenue protection**: Even one teacher poached per year who takes 5–10 families represents S$30,000–S$80,000 in annual revenue lost per defection. Platform-level prevention has compounding ROI.
- **Operational scaling**: Manual admin tasks (billing, attendance) are the primary constraint on center expansion. Automating these enables the center to grow enrollment without proportional headcount increase.
- **Differentiation**: No identified competitor in Singapore uses a Telegram proxy routing architecture for poaching prevention. This is a meaningful market differentiator for teacher recruitment and retention.
- **Audit trail**: Logged communications provide evidentiary support in PDPA disputes or employment contract enforcement, reducing legal risk.

---

## 6. Scope

### In Scope (MVP)

- Telegram bot setup and webhook configuration for @MathMavens_bot
- Parent and teacher onboarding via deep-link tokens
- Backend routing engine: three-way mapping store (Parent ↔ Student ↔ Teacher)
- Anonymous message relay using `copyMessage` for text, photo, video, voice, document, and sticker message types
- Media relay via `file_id` reuse
- Multi-child session selection for parents with multiple enrolled students
- Teacher-side student name injection header
- Web dashboard for Admin/Superadmin: login authentication (email/password or magic link), mapping CRUD with search and filter, onboarding token generation with copyable deep links, broadcast composer, user listing, responsive design for tablet/desktop
- Protected REST API endpoints serving the web dashboard (auth-gated, HTTPS)
- Admin bot commands: add/remove mappings, reassign students, generate onboarding tokens, view lists, broadcast announcements (mobile supplement to dashboard)
- Superadmin bot commands: all Admin capabilities plus deactivate/reactivate users, promote/demote Admin role, view audit logs, process PDPA data deletion requests (mobile supplement to dashboard)
- Admin/Superadmin broadcast capability (all parents, cohort, individual) via dashboard or bot
- Basic rate-limit handling and retry logic per Telegram API constraints
- PDPA-compliant data handling: consent collection at onboarding, encrypted data at rest and in transit, data retention policy enforcement
- Logging and audit trail for all relayed messages (content not stored, metadata and direction stored)
- Deployment on HTTPS infrastructure with valid TLS 1.2+ certificate

### Out of Scope (MVP)

- AI homework support (OpenClaw integration) — Phase 2
- Attendance tracking via bot commands — Phase 2
- Stripe/PayNow automated billing — Phase 3
- Multi-subject or multi-center support
- Student-facing bot interface (students are represented by parents for communication)
- Video calling or scheduling integration
- Integration with existing tuition management software (Edulabs, SchoolTracs)
- Native iOS/Android mobile application

### Future Considerations

- **Phase 2**: OpenClaw AI layer for 24/7 homework triage; attendance tracking; teacher availability windows configuration.
- **Phase 3**: Stripe/PayNow automated billing with dynamic QR and webhook reconciliation; monthly invoice generation; payment reminder sequences; billing management UI added to web dashboard.
- **Phase 4**: Dashboard analytics extension: revenue reporting, teacher performance metrics, class utilization heatmaps.
- **Phase 5**: Conduit multi-tenant mode — deploy the platform for additional tuition centers, each with their own customer-branded bot handle and isolated Conduit dashboard tenant; white-label licensing model.
- **Longer term**: Student-facing academic progress summaries; AI-generated weekly reports to parents; integration with external exam calendars (PSLE, O-Level timetables).

---

## 7. Stakeholders

| Stakeholder | Role | Involvement Level | Key Concerns |
|-------------|------|------------------|--------------|
| MM Owner/Director | Superadmin / Sponsor / Decision Maker | Final approval on scope and budget; accepts deliverables; operates as Superadmin | ROI, poaching prevention, compliance, system control |
| MM Admin Staff | Admin (Internal Operator) | Daily users of Admin bot commands; mapping management and onboarding | Ease of use, reliability, training, no technical background |
| MM Teachers | Primary End User | Daily message relay users | Anonymity, low overhead, reliability |
| MM Parents/Guardians | Primary End User | Daily communication users | Ease of use, trust, privacy |
| Development Team | Builder | Designs and implements the system | Clear requirements, stable spec |
| BMAD / BA | This document | Requirements and discovery | Completeness, accuracy, feasibility |
| Legal / PDPA Advisor | Compliance | Review data handling architecture | PDPA compliance, consent flows, breach readiness |

---

## 8. Constraints and Assumptions

### Constraints

**Technical**
- Telegram Bot API: bots cannot initiate conversation — every parent and teacher must `/start` the bot first. Onboarding flow must account for this.
- Rate limits: 30 messages/second globally, 1 message/second per individual chat, 20 messages/minute to groups. High-volume broadcast scenarios must implement throttling and queue management.
- Webhook delivery requires HTTPS with valid TLS 1.2+ certificate on ports 443, 80, 88, or 8443.
- `copyMessage` does not preserve "Forwarded from" metadata — this is the desired behavior for anonymization but must be verified per Telegram API version updates.
- `file_id` values are bot-specific and cannot be reused across different bots. If the bot token changes, all cached file_ids are invalidated.
- No Telegram-native payment flow (Stars, etc.) is required; PayNow via Stripe is the designated payment path.

**Regulatory**
- PDPA (Singapore Personal Data Protection Act) compliance is mandatory from day one.
- Parental consent must be explicitly collected before processing any data about students under 18. For students under 13, written parental consent is required.
- Breach notification obligations apply within mandated timelines if a data incident occurs.
- Data must not be retained beyond the period necessary for the stated purpose.

**Business**
- The bot token (@MathMavens_bot) is already created and in MM's possession. All development must use this token; a new bot cannot be created without rebranding.
- Budget and timeline are constrained by the failed native app attempt — this project must demonstrate delivery velocity.
- Teachers currently using personal contact for parent communication must be transitioned to bot-only interaction. This is a behavior change requiring internal policy enforcement, not just technical enforcement.

**Operational**
- Admin (office staff) have no assumed technical background. The web dashboard is the primary interface; Admin bot commands serve as mobile supplement.
- Superadmin operates primarily through the web dashboard; bot commands provide on-the-go access.
- Dashboard authentication is separate from Telegram — implemented via email/password or magic link. It is an independent attack surface and must follow web application security best practices (HTTPS-only, secure session cookies, rate-limited login).
- The web dashboard must be served over HTTPS and can share the same VPS/Nginx reverse proxy as the bot webhook.
- The system must be operational during Singapore school-day hours at minimum (7am–10pm SGT) with high availability; downtime during these windows is unacceptable.

### Assumptions

- All enrolled parents have an active Telegram account. If a parent does not have Telegram, their onboarding path is out of scope for MVP (admin handles separately).
- MM will provide the student-teacher mapping data in a structured format (CSV or spreadsheet) for initial data load.
- MM will enforce a policy that teachers are not permitted to share personal contact with parents; the platform is the technical complement to this policy, not a replacement for it.
- MM will handle the communication to existing parents and teachers about transitioning to the bot — the project does not include change management consulting.
- OpenClaw is confirmed to be compatible with the Telegram Bot API version in use and can be integrated without significant fork/customization in Phase 2.
- Stripe Singapore PayNow is confirmed available in MM's Stripe account tier.
- A suitable VPS or cloud host is available for backend deployment with the required HTTPS certificate.
- Message metadata logging (direction, timestamp, student association) is sufficient for audit purposes; full message content archival is not required and is intentionally avoided for PDPA minimization.

---

## 9. Success Criteria

The project will be considered successfully delivered when the following conditions are met:

**MVP Delivery (Go-Live)**
- [ ] @MathMavens_bot is live and reachable via Telegram.
- [ ] At least one full parent-teacher communication flow is relayed end-to-end without either party's Telegram handle or user ID being exposed to the other.
- [ ] Deep-link onboarding flow completed successfully for at least one parent and one teacher in a test enrollment.
- [ ] Admin is able to add a student mapping, generate an onboarding token, and broadcast a message using the web dashboard.
- [ ] Superadmin is able to deactivate a user and view audit log entries using the web dashboard.
- [ ] Web dashboard login (email/password or magic link) is functional and protected by HTTPS.
- [ ] All relayed message types pass through correctly: text, photo, voice note, document.
- [ ] PDPA consent collection is confirmed at parent onboarding with logged consent timestamp.
- [ ] Infrastructure meets HTTPS/TLS 1.2+ requirement and passes basic penetration/exposure check.

**Operational Acceptance (4 Weeks Post Go-Live)**
- [ ] 80%+ of enrolled families have completed onboarding.
- [ ] Zero reported instances of teacher personal contact being shared through the platform.
- [ ] Admin staff (non-technical) reports ability to manage day-to-day mapping operations without developer assistance.
- [ ] System uptime > 99.5% during Singapore school-day hours (7am–10pm SGT).
- [ ] No PDPA-reportable incidents.

---

## 10. Timeline

All durations are estimates pending team sizing and sprint cadence confirmation.

| Phase | Deliverable | Estimated Duration | Dependencies |
|-------|-------------|-------------------|-------------|
| 0 — Discovery & Architecture | Architecture doc, tech stack decision, infrastructure provisioning | 1 week | This brief approved |
| 1 — Core Routing Engine | Bot webhook, database schema, routing logic, copyMessage relay | 2 weeks | Phase 0 complete |
| 2 — Onboarding Flows | Deep-link token generation, /start handler, PDPA consent collection | 1 week | Phase 1 core relay working |
| 3 — Admin/Superadmin Bot Commands | Admin: mapping management, token generation, broadcast; Superadmin: deactivation, role management, audit log access | 1 week | Phase 1 complete |
| 4 — Web Dashboard | Dashboard auth (email/password or magic link), mapping CRUD UI, token generation UI, broadcast composer, user listing, audit log viewer, responsive layout; protected API endpoints | 2 weeks | Phase 3 complete |
| 5 — Multi-Child & Edge Cases | Multi-child session selection, rate limit handling, error states | 1 week | Phase 2 and 3 complete |
| 6 — QA & Hardening | End-to-end testing, security review (bot + dashboard), load/rate limit testing, PDPA audit | 1 week | Phase 4 and 5 complete |
| 7 — Pilot Onboarding | Onboard first real cohort (limited rollout), monitor, fix | 1 week | Phase 6 sign-off |
| **Total MVP** | | **~10 weeks** | |
| Phase 2 — AI Layer | OpenClaw integration, homework triage, session memory | +4 weeks | MVP stable |
| Phase 3 — Billing | Stripe/PayNow integration, invoice generation, webhooks, billing UI in dashboard | +3 weeks | Phase 2 stable |

Note: The 10-week MVP target assumes a focused two-person development team (one backend, one DevOps/infra) with clear, stable requirements. The 2-week dashboard phase is contingent on selecting a lightweight frontend framework (e.g. server-rendered with HTMX, or a thin React SPA) at Phase 0 architecture review. Any further scope additions to MVP will extend this timeline.

---

## 11. Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|-----------|
| R-01 | **Teacher resistance to platform transition** — Teachers used to personal contact may resist or circumvent the system | High | High | MM management must enforce policy; bot is complementary, not optional. Communicate benefits: no after-hours pestering, no personal number exposure. |
| R-02 | **Parent Telegram adoption gaps** — A subset of parents may not have Telegram or be unwilling to use it | Medium | Medium | Identify non-Telegram parents early (at enrollment); create alternative handling procedure. Do not block center operations on edge cases. |
| R-03 | **Telegram API changes breaking relay** — `copyMessage` behavior or `file_id` semantics may change with API updates | Low | High | Pin Telegram Bot API library version; monitor changelog; write integration tests that catch relay failures. |
| R-04 | **PDPA breach or consent gap** — Inadequate consent collection or data leak triggering PDPA investigation | Low | Very High | Legal review of consent flow before go-live; encrypted storage enforced from day one; no content archival policy; breach notification runbook documented. |
| R-05 | **Rate limit saturation during broadcasts** — Large cohort broadcasts hitting 30 msg/sec global limit | Medium | Medium | Implement queue with throttling (max 25 msg/sec with back-off); stagger broadcasts; warn admin of expected delivery time for large batches. |
| R-06 | **Scope creep from prior failed app** — Stakeholders may push to re-add app features to the bot scope | Medium | High | Strict MVP scope gate; all additions go through formal change control. This brief serves as the scope baseline. |
| R-07 | **Bot token compromise** — If the bot token is exposed, all communication is at risk | Low | Very High | Token stored in secrets manager (not in codebase or env files in repos); rotate token immediately if exposure suspected; document rotation procedure. |
| R-08 | **OpenClaw integration complexity (Phase 2)** — AI middleware may have unforeseen integration friction with the routing engine | Medium | Medium | Prototype integration in a sandbox before committing to Phase 2 timeline; ensure routing engine is designed with middleware hooks from day one. |
| R-09 | **Admin/Superadmin overload without dashboard** — ~~Mitigated: web dashboard is now in MVP scope.~~ Dashboard provides full CRUD, search, filter, and bulk operations; bot commands retained as mobile supplement. | Low | Low | Dashboard delivers primary interface at MVP; monitor Admin feedback post-launch for UX gaps. |
| R-10 | **Infrastructure downtime during school hours** — Server failure during peak usage window (3pm–9pm SGT) | Low | High | Deploy with uptime monitoring and alerting; define on-call response procedure; evaluate redundant webhook endpoint if budget allows. |
| R-11 | **Dashboard authentication as separate attack surface** — Web app login (email/password or magic link) introduces credential-based attack vectors distinct from the Telegram bot | Medium | High | Enforce HTTPS-only; use secure, HttpOnly session cookies; rate-limit login attempts; consider magic-link-only to eliminate password brute-force; conduct security review during Phase 6 QA & Hardening; do not expose dashboard on a non-authenticated route. |

---

## 12. Competitive Landscape

### Direct Alternatives Evaluated

**Edulabs / SchoolTracs (Singapore tuition management SaaS)**
- Cover fee management, scheduling, and basic parent communication.
- Do not address teacher poaching at a technical level — communication still routed through personal channels.
- Web-first with mobile apps; require explicit app install and account creation by parents.
- No AI layer; no Telegram integration.
- Assessment: Suitable for administrative record-keeping but do not solve the core problem. MM may continue using these for scheduling while the bot handles communication.

**WhatsApp Business API**
- 84% Singapore penetration — highest reach.
- Business API: requires Meta approval, costs per conversation (template messages charged), rate-limited, requires a dedicated phone number and WABA registration.
- No anonymous relay capability — messages show business profile, not anonymous proxy.
- Cannot copy messages without attribution; no equivalent to Telegram's `copyMessage`.
- Assessment: Ruled out. Cost, rate limits, and lack of anonymous relay make it unsuitable for proxy architecture.

**Custom native mobile app (prior attempt)**
- Already attempted and failed. Carries reputational and financial cost.
- Requires app store approval, install friction, OS update maintenance.
- Assessment: Explicitly ruled out. The pivot to Telegram is a direct response to this failure.

**Line / Signal / Other messengers**
- Line: Popular in East/Southeast Asia but limited bot API capability compared to Telegram.
- Signal: No public bot API; not suitable for business automation.
- Assessment: No viable candidate matches Telegram's combination of penetration, bot API maturity, and anonymous relay capability.

### Telegram Bot Competitive Positioning

The proposed solution has no direct known competitor in the Singapore tuition market using Telegram as an anonymous proxy routing layer for teacher-parent communication. The closest analogues are:

- Generic Telegram CRM bots (e.g., for e-commerce support routing) — not tuition-specific.
- @sgTuitions and similar channels — tutor recruitment, not operational communication.

This creates a short-term first-mover advantage in the specific niche of tuition center poaching prevention via platform architecture. The architecture is not patentable but has been built as a brandable, white-label-able platform under the Conduit name. Math Mavens is the first customer deployment; Phase 5 expansion enables other tuition centers to run their own Conduit-powered bot (customer-branded) and dashboard tenant. See Phase 5 future consideration.

### Key Differentiators of Proposed Solution

1. **Poaching prevention is structural, not policy** — enforced by the architecture, not reliant on teacher/parent goodwill.
2. **Zero install friction** — Telegram already installed for most Singapore parents.
3. **AI triage layer** — 24/7 academic support is a genuine differentiator vs. human-only tuition centers.
4. **PDPA-by-design** — anonymous routing means less personal data flowing between parties, reducing compliance surface area.
5. **Cost-effective stack** — Telegram Bot API is free; OpenClaw is open-source; Stripe/PayNow fees are transaction-based with no monthly platform fee.

---

*Document prepared by BMAD Business Analyst. Reviewed against provided technical specification, market research, and regulatory context as of 2026-03-03. This brief covers the Conduit platform as deployed for Math Mavens (first customer, @MathMavens_bot). It supersedes any prior undocumented scope assumptions and serves as the baseline for story mapping and architecture design.*
