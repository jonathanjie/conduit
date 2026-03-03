# System Architecture: Conduit — Math Mavens Telegram Bot

**Date:** 2026-03-03
**Author:** BMAD Systems Architect
**Platform:** Conduit
**Customer Deployment:** Math Mavens (@MathMavens_bot)
**Project:** math-mavens-bot
**Status:** Draft — Phase 0 Architecture
**Companion:** product-brief-math-mavens-bot-2026-03-03.md

---

## Table of Contents

1. Architectural Drivers
2. High-Level Architecture
3. Technology Stack
4. System Components
5. Data Architecture
6. API Design (Internal + REST API)
7. Security Architecture
8. Message Relay Architecture
9. Scalability and Performance
10. Reliability and Monitoring
11. Development and Deployment
12. Phase 2/3 Integration Points
13. Traceability Matrix

---

## 1. Architectural Drivers

Five NFRs dominate every significant design decision in this system. Each one is documented with its direct architectural consequence.

---

### NFR-03 — PDPA Compliance (Encryption, Consent, Minimization, Deletion)

**Why it is the most influential driver:**

PDPA is not a feature — it is a hard constraint with criminal liability. Singapore's PDPA requires data minimization (collect only what is necessary), explicit consent before processing personal data, breach notification within mandated timelines, and the ability to fulfill deletion requests. In the context of this bot, the data being handled is parent and teacher Telegram identities linked to named minors — a category requiring particular care.

**Architectural consequences:**
- The database schema stores metadata, not message content. Message relay logs record direction, timestamp, and student association — never the text or media payload.
- Consent is a blocking gate in the onboarding flow. No user is registered and no messages are relayed until a timestamped consent record exists.
- All PII fields (display_name, telegram_user_id) are stored in a PostgreSQL instance with encryption at rest (AES-256 via pgcrypto or filesystem-level encryption). No PII appears in application logs.
- A soft-delete and hard-delete path must exist for every user and mapping record, enabling Right to Erasure compliance.
- The audit logger is a separate, append-only concern — it never stores message content, only routing metadata.

---

### NFR-02 — Message Relay Latency Less Than 2 Seconds End-to-End

**Why it is the second most influential driver:**

The entire value proposition is that the bot is indistinguishable from direct messaging. If a parent sends a voice note to a teacher and it takes 15 seconds to relay, parents will immediately bypass the bot and go back to WhatsApp. The 2-second latency target is a user-trust requirement, not just a performance metric.

**Architectural consequences:**
- The webhook handler must be synchronous on the critical path — no queuing between webhook receipt and `copyMessage` execution for normal messages.
- The application is event-driven and non-blocking. Node.js with async/await or Python with asyncio both satisfy this; synchronous frameworks do not.
- Database queries on the relay path are single-indexed lookups (parent_user_id → active student session → teacher_chat_id). No joins, no aggregation on the hot path.
- Redis is used for session state (active child selection) because a sub-millisecond in-memory read is faster than a database row read for this frequently accessed state.
- Rate limiting and queuing apply only when Telegram API limits are about to be breached — not as a default routing path. Normal messages go direct.

---

### NFR-01 — 99.5% Uptime During 7am–10pm SGT

**Why it is the third most influential driver:**

99.5% uptime over a 15-hour operational window translates to a maximum of 4.5 minutes of downtime per day. For a communication proxy, downtime is not invisible — messages are lost or delayed with no fallback. Parents in Singapore expect communications infrastructure to be as reliable as WhatsApp or iMessage.

**Architectural consequences:**
- Single VPS is acceptable for MVP, but it must be a reliable provider (Hetzner or DigitalOcean) in a Singapore or nearby Asia-Pacific region to minimize Telegram API round-trip latency.
- Docker Compose with restart policies (`restart: unless-stopped`) ensures service recovery from crashes without manual intervention.
- Health check endpoint monitored by UptimeRobot (free tier, 5-minute polling) with alerting to an admin Telegram chat.
- Database is PostgreSQL with automated daily backups to object storage (Backblaze B2 or similar). WAL archiving considered but deferred to post-MVP.
- Nginx reverse proxy handles TLS termination and acts as a stable entry point. If the application crashes and restarts, Nginx buffers or rejects requests cleanly rather than leaving connections hanging.

---

### NFR-04 — Handle 500 Active Parent-Teacher Pairs Concurrently Without Degradation

**Why it is the fourth most influential driver:**

500 concurrent pairs does not mean 500 simultaneous messages. But it does mean 500 independently active conversations that could burst at peak hours (after school, 3pm–7pm SGT). The system must handle bursts without queuing so deep that the 2-second latency guarantee collapses.

**Architectural consequences:**
- Node.js event loop handles high concurrency naturally without thread-per-request overhead. For Python, asyncio with aiohttp or httpx is the equivalent choice.
- PostgreSQL connection pool (via pgBouncer or the framework's built-in pool) sized at 20-30 connections — sufficient for 500 concurrent logical users since database operations on the relay path are short.
- Redis handles session state to avoid database round-trips for per-user context.
- Broadcast queuing (BullMQ or equivalent) ensures broadcasts to all 500 parents are throttled to respect Telegram's 30 msg/sec global limit, delivered in approximately 17 seconds for 500 messages at 25/sec with safety margin.

---

### NFR-09 — Secrets Never Exposed in Code or Logs

**Why it is the fifth most influential driver:**

The bot token (`8783590477:AAHdtbunGaoGCK9rOFG-tyPVXWdFt-bLAU4`) — if exposed — allows any actor to impersonate the entire bot, intercept all messages, and send arbitrary messages to all registered users. This is a catastrophic failure mode. The product brief explicitly identifies token compromise as a Very High impact risk.

**Architectural consequences:**
- Bot token and all secrets stored in `.env` file, never committed to version control. `.gitignore` enforces this.
- Environment variables injected at runtime via Docker Compose `env_file` directive or a secrets manager (Doppler or Infisical for teams; bare `.env` is acceptable for a 1-2 person team on a private VPS).
- Structured logging (pino for Node.js, structlog for Python) configured with field-level redaction: any field matching `token`, `secret`, `telegram_id`, `chat_id` is scrubbed before log output.
- Webhook secret token (`X-Telegram-Bot-Api-Secret-Token` header) validated on every incoming request. Requests without valid secret are rejected at the Nginx layer before reaching the application.

---

## 2. High-Level Architecture

### Pattern Selection: Monolithic Modular

**Chosen pattern: Modular Monolith** (single deployable unit, internally organized into bounded modules).

**Rationale:**

This is a 1-2 person team building a Level 3 project. Microservices would require separate deployment pipelines, service discovery, network-level inter-service calls, distributed tracing, and an operations overhead that is disproportionate to the problem. A modular monolith gives clean internal boundaries between components (relay, onboarding, admin, audit) while deploying as a single process. This is the correct call for this team size and this stage.

The Phase 2 AI gateway and Phase 3 payment gateway will be plugged in as modules within this same process or as sidecar containers — not as separate microservices. If Math Mavens reaches the scale where microservices are justified (thousands of parent-teacher pairs, multi-center operation), that refactor is a Phase 5 decision, not a Phase 0 decision.

**Tradeoff accepted:** A single process means a bug in the admin broadcast module can theoretically affect the relay module. This is mitigated by module isolation (no shared mutable state between modules), comprehensive error boundaries, and the fact that the broadcast module runs asynchronously via a queue.

---

### System Context Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                  EXTERNAL ACTORS                                     │
│                                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────────┐  ┌───────────────────┐ │
│  │   Parent    │  │   Teacher   │  │        Admin          │  │    Superadmin     │ │
│  │  (Telegram) │  │  (Telegram) │  │  PRIMARY: Web Dashboard│  │ PRIMARY: Web Dash │ │
│  └──────┬──────┘  └──────┬──────┘  │  SUPPLEMENT: Telegram │  │ SUPPLEMENT: Tele  │ │
│         │                │         └───────────┬─────┬──────┘  └────────┬────┬─────┘ │
└─────────┼────────────────┼─────────────────────┼─────┼──────────────────┼────┼───────┘
          │                │           Telegram   │     │ HTTPS            │    │ HTTPS
          │                │           Bot cmds   │     │ Web Dashboard    │    │ Web Dashboard
          │                │                      ▼     ▼                  ▼    ▼
          │     TELEGRAM API SERVERS        ┌───────────────────────────────────────┐
          │  ┌────────────────────────┐     │      Web Dashboard (React SPA)        │
          └─▶│   api.telegram.org     │◀────┤      served by Nginx (/*  → static)   │
             │   @MathMavens_bot      │     │      communicates via REST API         │
             └──────────┬─────────────┘     └───────────────────────────────────────┘
                        │ HTTPS Webhook POST
                        │ (JSON Update payload)
                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│              CONDUIT BACKEND — MATH MAVENS VPS (Singapore Region)                   │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                         Nginx (Reverse Proxy + TLS)                           │  │
│  │   /webhook        → app:3000  (bot handler, secret_token validation)          │  │
│  │   /api/*          → app:3000  (REST API, session auth middleware)              │  │
│  │   /*              → static files (React SPA build, served from /var/www/conduit)│  │
│  │   /healthz        → app:3000  (passthrough, no auth)                          │  │
│  └────────────┬──────────────────────────────┬────────────────────────────────────┘  │
│               │ Webhook / REST API            │ Static file serving                  │
│  ┌────────────▼──────────────────────────────┤                                      │
│  │         Bot + API Application (Node.js / TypeScript / Hono)                   │  │
│  │                                                                                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │
│  │  │   Webhook    │  │   Router /   │  │  Onboarding  │  │  REST API Layer  │  │  │
│  │  │   Handler    │─▶│  Dispatcher  │  │   Service    │  │  (/api/v1/*)     │  │  │
│  │  └──────────────┘  └──────┬───────┘  └──────────────┘  └────────┬─────────┘  │  │
│  │                           │                                       │            │  │
│  │  ┌────────────┐  ┌────────▼───────┐  ┌──────────────┐  ┌────────▼─────────┐  │  │
│  │  │  Session   │  │  Message Relay │  │    Admin     │  │  Web Auth Service│  │  │
│  │  │  Manager   │  │   (copyMsg)    │  │   Service    │  │  (sessions/Redis)│  │  │
│  │  └────────────┘  └───────────────┘  └──────────────┘  └──────────────────┘  │  │
│  │                                                                                │  │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐                         │  │
│  │  │  Rate        │  │   Audit     │  │    Token /   │                         │  │
│  │  │  Limiter     │  │   Logger    │  │  Invite Mgr  │                         │  │
│  │  └──────────────┘  └─────────────┘  └──────────────┘                         │  │
│  │                                                                                │  │
│  │  ┌──────────────┐  ┌─────────────┐  (Phase 2+)                               │  │
│  │  │  Broadcast   │  │ AI Gateway  │  ┌──────────────┐                         │  │
│  │  │   Queue      │  │  (stub)     │  │  Payment GW  │                         │  │
│  │  └──────────────┘  └─────────────┘  │   (stub)     │                         │  │
│  │                                      └──────────────┘                         │  │
│  └────────────────────────────────────────┬───────────────────────────────────────┘  │
│                                           │                                          │
│  ┌────────────────────────────────────────▼───────────────────────────────────────┐  │
│  │                               Data Layer                                       │  │
│  │                                                                                │  │
│  │   ┌──────────────────┐              ┌──────────────────────────────────────┐  │  │
│  │   │   PostgreSQL 16  │              │   Redis 7                            │  │  │
│  │   │   (primary DB)   │              │  (session state, rate limit ctrs,    │  │  │
│  │   │   + pgcrypto     │              │   broadcast queue,                   │  │  │
│  │   │   encrypted cols │              │   dashboard sessions [24h TTL])      │  │  │
│  │   └──────────────────┘              └──────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘

External integrations (Phase 2/3):
  OpenClaw AI API ──────────────────────────▶ AI Gateway module
  Stripe API (Singapore PayNow) ────────────▶ Payment Gateway module
  Backblaze B2 (DB backups) ────────────────▶ Backup cron job
  UptimeRobot ──────────────────────────────▶ /healthz endpoint
```

---

### Component Interaction Overview

```
PATH A: Telegram Update arrives at Nginx (/webhook)
    │
    ├── Secret token valid? No → 403, drop
    │
    ▼
Webhook Handler
    │
    ├── Parse Update type: message / callback_query / edited_message
    │
    ▼
Router / Dispatcher
    │
    ├── Is sender admin or superadmin? → Admin Service (with role-based command filtering)
    │
    ├── Is this a /start with deep-link payload? → Onboarding Service
    │
    ├── Is sender a Parent?
    │     ├── Single child → resolve teacher → Message Relay
    │     └── Multiple children
    │           ├── Session active → resolve teacher → Message Relay
    │           └── No session → send child selector → Session Manager
    │
    ├── Is sender a Teacher?
    │     ├── Is reply to a relayed message? → resolve parent via reply context → Message Relay
    │     └── New message → prompt teacher to use reply
    │
    └── Unknown sender → send onboarding prompt

Message Relay
    │
    ├── Rate Limiter check
    │     ├── Under limit → proceed
    │     └── Over limit → enqueue with delay, return immediately (do not block parent)
    │
    ├── Inject student name header (teacher-bound messages only)
    │
    ├── copyMessage API call
    │
    └── Audit Logger (async, non-blocking, metadata only)

PATH B: HTTP Request arrives at Nginx (/api/*)
    │
    ▼
REST API Layer (Hono route group /api/v1/*)
    │
    ├── POST /api/v1/auth/login?
    │     └── Web Auth Service → validate credentials → create Redis session → set httpOnly cookie
    │
    ├── Any other /api/v1/* route?
    │     ├── Session auth middleware: read session cookie → Redis lookup → attach dashboard_user
    │     ├── Not authenticated? → 401
    │     └── Authenticated?
    │           ├── Role = 'admin' OR 'superadmin'?
    │           │     └── Route to appropriate handler (students, mappings, tokens, broadcasts, etc.)
    │           │         Shared business logic modules: Mapping Store, Token Manager, Broadcast Queue
    │           └── Route requires 'superadmin'?
    │                 ├── Role = 'admin'? → 403
    │                 └── Role = 'superadmin'? → dashboard-users, audit, system endpoints
    │
    └── Audit Logger (async, non-blocking, logs admin action with dashboard_user_id)

PATH C: HTTP Request arrives at Nginx (/* — frontend)
    │
    ▼
Nginx serves static files from /var/www/conduit (built React SPA)
    └── All non-/api, non-/webhook routes return index.html (SPA client-side routing)
```

---

### Data Flow: Message Relay Path (Parent to Teacher)

```
1. Parent types message in @MathMavens_bot Telegram chat
   │
2. Telegram delivers Update to: POST https://vps.example.com/webhook
   [Update contains: from.id, chat.id, message_id, message type + content/file_id]
   │
3. Nginx validates X-Telegram-Bot-Api-Secret-Token header
   │
4. Webhook Handler parses Update, extracts sender_telegram_user_id
   │
5. Router queries: SELECT role FROM users WHERE telegram_user_id = $1
   → role = 'parent'
   │
6. Session Manager queries Redis: GET session:{user_id}
   → Returns: { active_student_id: 42 } OR null
   │
   ├── If null AND parent has 1 child:
   │     Query: SELECT student_id FROM parent_student_mappings WHERE parent_user_id = $1
   │     Set session in Redis: SET session:{user_id} {student_id} EX 28800
   │
   └── If null AND parent has >1 child:
         Send inline keyboard with child names
         Await callback_query → set session → continue relay
   │
7. Mapping Store queries:
   SELECT u.chat_id FROM users u
   JOIN teacher_student_mappings tsm ON tsm.teacher_user_id = u.id
   WHERE tsm.student_id = $1 AND tsm.is_active = true
   → teacher_chat_id
   │
8. Rate Limiter: check Redis counter for teacher_chat_id
   → INCR rate:{teacher_chat_id}:{window} — if over 1/sec threshold, brief delay
   │
9. Message Relay sends header:
   sendMessage(chat_id=teacher_chat_id, text="[Student Name] — Parent:")
   (plain text header, not copyMessage — this is injected metadata)
   │
10. Message Relay executes:
    copyMessage(
      chat_id=teacher_chat_id,
      from_chat_id=parent_chat_id,  ← bot's received message
      message_id=parent_message_id
    )
    → Telegram copies message without "Forwarded from" attribution
    → Returns: { message_id: relayed_message_id }
    │
11. Audit Logger (async):
    INSERT INTO message_audit_log
      (source_user_id, target_user_id, student_id, direction, message_type,
       relayed_message_id, created_at)
    VALUES ($1, $2, $3, 'parent_to_teacher', $4, $5, NOW())
    │
12. (Optional) Confirmation to parent:
    sendMessage(chat_id=parent_chat_id, text="✓ Sent")
    [MVP: omit unless PM confirms this is desired UX]
```

---

## 3. Technology Stack

### Runtime and Language: TypeScript on Node.js 20 LTS

**What:** Node.js 20 (LTS) with TypeScript 5.x (strict mode).

**Why:**
- Event-driven, non-blocking I/O is a natural fit for a webhook receiver that makes outbound API calls. No thread management required for handling 500 concurrent sessions.
- grammY (the chosen Telegram framework) is TypeScript-native with excellent type safety for Telegram's complex Update type hierarchy.
- The Telegram Bot API has rich TypeScript type definitions. Type-checking the Update object structure at compile time catches entire categories of relay bugs.
- Large ecosystem for all required libraries (PostgreSQL client, Redis client, queue, HTTP server, validation).
- Familiarity: Node.js is among the most widely understood runtimes, reducing bus-factor risk for a 1-2 person team.

**Tradeoffs accepted:**
- Node.js is single-threaded; CPU-intensive work (e.g., image processing) would block the event loop. This system has no CPU-intensive workloads on the hot path. AI inference (Phase 2) will be offloaded to OpenClaw's API.
- Python (asyncio + aiogram) would also be an acceptable choice; grammY's type safety and developer experience tips the balance to TypeScript.

---

### Telegram Bot Framework: grammY

**What:** grammY (grammy.dev) — TypeScript-first Telegram Bot framework.

**Why:**
- Fully TypeScript-native. Type definitions are generated directly from the Telegram Bot API spec — no type stubs that drift behind the API.
- Composable middleware architecture: webhooks, sessions, conversations, inline keyboards are all first-class concerns with dedicated, well-maintained plugins.
- grammY's built-in `session` plugin supports multiple storage backends including Redis, which maps directly to the session management requirement.
- `conversations` plugin provides stateful, multi-step interaction handling (e.g., child selection flow, onboarding consent collection) without manual state machine management.
- Active maintenance, responsive community, and comprehensive documentation.
- Significantly better developer experience than telegraf (the prior Node.js leader), which has a history of slow API updates.

**Tradeoffs accepted:**
- grammY is newer than telegraf; some community resources are sparser for advanced edge cases. The documentation is, however, excellent.
- aiogram (Python) has a comparable feature set; the choice of grammY is justified by the TypeScript ecosystem decision above.

---

### Database: PostgreSQL 16

**What:** PostgreSQL 16, running in Docker, with pgcrypto extension for column-level encryption.

**Why:**
- Relational data model is the correct choice: the core data is highly relational (users, students, mappings) with foreign key integrity requirements. A document store like MongoDB would require application-level join emulation and does not enforce referential integrity.
- PDPA audit trail requires append-only, transactional writes. PostgreSQL ACID guarantees ensure no partial audit records.
- pgcrypto enables AES-256 encryption of sensitive columns (display_name, telegram_user_id) at the database level — encryption at rest without requiring full-disk encryption setup.
- SQLite is unsuitable: concurrent writes from the webhook handler and background jobs (broadcast, audit logging) would encounter write contention at scale. SQLite's WAL mode helps, but at 500 concurrent users it becomes a bottleneck.
- PostgreSQL has mature tooling for backups (pg_dump, pgBackRest), migrations (Flyway/node-pg-migrate), and monitoring (pg_stat_* views).

**Tradeoffs accepted:**
- Heavier operational footprint than SQLite. Mitigated by running PostgreSQL in Docker with a standard configuration that requires minimal tuning at MVP scale.
- Column-level encryption (pgcrypto) adds query complexity for encrypted fields. The alternative — filesystem encryption (LUKS/dm-crypt) — is simpler for queries but harder to provision correctly on a VPS. pgcrypto is the safer default for a 1-2 person team.

---

### Cache and Queue: Redis 7 (via ioredis + BullMQ)

**What:** Redis 7 (Docker), accessed via ioredis client. BullMQ for broadcast job queue. grammY RedisAdapter for session storage.

**Why:**
- Session state (active child selection per parent) must be sub-millisecond to not add latency to the relay path. Redis GET/SET at <1ms is appropriate; a database read at 1-5ms is not.
- Rate limiting counters (per-chat message counts per second/minute) are naturally modeled as Redis increment-with-TTL operations — atomic, fast, and self-expiring.
- BullMQ is the mature successor to Bull, uses Redis as its backing store, and provides job prioritization, retry with exponential back-off, and delayed job scheduling — all needed for broadcast throttling.
- Using Redis for both session state and queue means one additional operational component rather than two. The footprint is justified.
- grammY's RedisAdapter integrates directly with ioredis, eliminating a custom implementation.

**Tradeoffs accepted:**
- Redis is in-memory by default; session loss on Redis restart is acceptable (parent simply re-selects their child). For critical state (user registrations), PostgreSQL is the source of truth.
- Redis persistence (RDB snapshots) should be enabled to reduce recovery time on restart; full AOF persistence is not required at this scale.

---

### HTTP Server: Hono (on Node.js)

**What:** Hono — lightweight, fast web framework for TypeScript on Node.js.

**Why:**
- grammY handles the Telegram webhook callback parsing; we need a minimal HTTP layer to receive the POST request and pass it to grammY. Hono is 40KB, has excellent TypeScript types, and starts in under 50ms.
- Alternatively, grammY provides a built-in webhook adapter for Node.js (`createServer`); Hono is chosen for its cleaner middleware integration (logging, health check endpoint, 404 handling).
- The same Hono instance now hosts the `/api/v1/*` REST route group, sharing the process and all business logic modules with the bot handler. No additional server process is required.
- Express is the familiar alternative; Hono's modern API and better TypeScript types make it the better choice for a new project in 2026.

**Tradeoffs accepted:** Hono is less universally known than Express. Documentation is good; community is growing. For a project of this size, this is a low-risk tradeoff.

---

### Frontend Framework: Vite + React (Web Dashboard)

**What:** Vite 5 with React 18 (TypeScript). Built to static assets and served by Nginx.

**Why:**
- The dashboard is an admin-only internal tool. Server-side rendering (Next.js) adds operational complexity (a running Node.js process for the frontend) with no meaningful benefit for this use case — there are no public pages, no SEO requirements, and no need for server-rendered HTML.
- Vite + React produces a static build (`dist/`) that Nginx serves directly. No additional container, no runtime process, no port to manage.
- For a 1-2 person team, the simpler deployment model outweighs any marginal DX advantage of Next.js App Router.
- **UI library: shadcn/ui** (Tailwind-based, zero runtime overhead, copy-paste component model). Ideal for admin dashboards — tables, forms, dialogs, badges out of the box. No bundle bloat from unused components.
- **Server state: TanStack Query (React Query v5)**. Handles API data fetching, caching, background refresh, and optimistic updates. Eliminates the need for a global state manager for server data.

**Tradeoffs accepted:**
- No SSR means the initial page load is a blank screen until JS executes. Acceptable for an admin tool where users are authenticated and on desktop.
- If the dashboard eventually becomes a customer-facing product (Phase 5), migrating to Next.js is a straightforward path.

---

### Web Authentication: Session-Based Auth (httpOnly Cookies)

**What:** Session-based authentication for the web dashboard. Sessions stored in Redis. Credentials in a `dashboard_users` PostgreSQL table.

**Why:**
- **httpOnly cookies, not JWT in localStorage.** JWT in localStorage is vulnerable to XSS — any injected script can read and exfiltrate the token. httpOnly cookies are inaccessible to JavaScript by design.
- **Session-based (not stateless JWT).** Sessions can be revoked instantly (delete the Redis key). Stateless JWTs cannot be revoked before expiry — a known weakness for admin systems where account disabling must take effect immediately.
- **bcrypt** for password hashing (cost factor 12). argon2id is the modern preference; bcrypt is well-understood, well-supported in the Node.js ecosystem, and sufficient for an admin tool without high-volume login traffic.
- **No public registration.** The Superadmin creates admin accounts via the dashboard or a CLI seed script. There is no self-service registration endpoint — it simply does not exist.
- **CSRF protection:** SameSite=Strict cookies on same-origin requests (MVP — dashboard and API on same domain). For cross-origin deployments: add a double-submit CSRF token. For MVP on the same domain, SameSite=Strict is sufficient.
- **Sessions in Redis** reuse the existing Redis instance. Session key: `dashboard_session:{session_id}` with a 24-hour TTL (sliding, reset on each authenticated request).

**Tradeoffs accepted:**
- Sessions require Redis to be available for dashboard authentication. Redis is already a required dependency for bot sessions and BullMQ. This adds no new operational dependency.
- 24-hour TTL with sliding expiry means active users stay logged in indefinitely. If stricter timeout is required (e.g., 8-hour absolute timeout), add `created_at` to the session payload and check it on validation.

---

### Frontend Build and Serve

**What:** Vite builds the React SPA to `frontend/dist/`. Nginx serves those static files for all `/*` routes (excluding `/api/*` and `/webhook`).

**Build pipeline:**
```bash
# In CI or on the VPS before deployment:
cd frontend && npm run build   # outputs to frontend/dist/
# Nginx serves frontend/dist/ as the document root for /*
```

**Nginx routing (updated from bot-only config):**
```nginx
# Telegram bot webhook
location /webhook {
    proxy_pass http://app:3000;
    # secret_token header validation ...
}

# REST API
location /api/ {
    proxy_pass http://app:3000;
    proxy_set_header X-Real-IP $remote_addr;
}

# Health check (no auth)
location /healthz {
    proxy_pass http://app:3000;
}

# Frontend SPA (catch-all)
location / {
    root /var/www/conduit;
    try_files $uri $uri/ /index.html;  # SPA client-side routing
}
```

If the team later opts for Next.js, the frontend runs as a separate container and Nginx proxies `/*` to `frontend:3001` instead of serving static files. The Nginx configuration change is minimal.

**Tradeoffs accepted:** Static file serving means no server-rendered pages. Already accepted above.

---

### Infrastructure: Hetzner VPS (CX21 or CX31) — Singapore or Nuremberg

**What:** Hetzner Cloud VPS, CX21 (2 vCPU, 4GB RAM) minimum, CX31 (2 vCPU, 8GB RAM) preferred. Docker Compose orchestration.

**Why:**
- Hetzner has data centers in Singapore (SIN1), which minimizes Telegram API round-trip latency for copyMessage calls. This directly supports NFR-02.
- CX21 at ~€5.77/month (or CX31 at ~€11.77) is cost-appropriate for a 1-2 person team operating a bot for 500 parents.
- Hetzner has excellent uptime SLAs (99.9%+), reliable block storage for PostgreSQL, and snapshot-based backups.
- DigitalOcean is an acceptable alternative (SGP1 region). Hetzner wins on price-to-spec ratio.
- Docker Compose is the right tool at this scale: single-machine orchestration, reproducible environments, easy backup, no Kubernetes overhead.

**Tradeoffs accepted:**
- Single VPS has no automatic failover. Mitigated by: aggressive restart policies in Docker Compose, UptimeRobot alerting, and a defined recovery runbook. Full HA is a Phase 4 concern.
- Nuremberg (EU) is an alternative if Singapore region is unavailable; adds ~150ms latency to Telegram API calls, still within the 2-second relay budget.

---

### Reverse Proxy: Nginx + Certbot (Let's Encrypt)

**What:** Nginx as reverse proxy and TLS terminator. Let's Encrypt certificates managed by Certbot with auto-renewal.

**Why:**
- Telegram webhook requires HTTPS on port 443. Nginx terminates TLS and proxies to the app on port 3000 (internal Docker network).
- Nginx handles the `X-Telegram-Bot-Api-Secret-Token` header validation as a fast-path rejection — malformed requests never reach Node.js.
- Let's Encrypt provides free, auto-renewing TLS 1.2+/1.3 certificates — no manual certificate management.
- Caddy is an alternative with simpler configuration and built-in Let's Encrypt. Nginx is chosen for its more explicit configuration (better for security-critical applications where defaults-hiding-behavior is a risk) and broader team familiarity.

**Tradeoffs accepted:** Nginx configuration is more verbose than Caddy. This is a one-time setup cost.

---

### Monitoring and Logging

**What:**
- **Structured logging:** pino (Node.js). JSON output, level-based, field redaction configured.
- **Uptime monitoring:** UptimeRobot (free tier) polling `/healthz` every 5 minutes. Alert channel: Telegram admin chat.
- **Error alerting:** Custom module sends structured error summaries to admin Telegram chat via bot on unhandled exceptions and relay failures.
- **Log aggregation:** For MVP, logs written to file via pino-transport with daily rotation. No external log service until scale justifies cost.

**Tradeoffs accepted:** No centralized log platform (Datadog, Loki) at MVP. JSON-structured logs on disk are sufficient for a 1-2 person team. Ship logs to an external service when the team or scale grows.

---

### CI/CD: GitHub Actions

**What:** GitHub Actions for automated testing and deployment. Private GitHub repository.

**Why:**
- Free for private repositories (2,000 minutes/month).
- Direct integration with Docker Hub or GitHub Container Registry for image builds.
- Deployment step SSHes to the VPS and runs `docker-compose pull && docker-compose up -d`. Simple, auditable, no additional CI infrastructure.

**Tradeoffs accepted:** No blue/green deployment at MVP. Deployment involves a brief restart window (typically <5 seconds with Docker Compose). Acceptable given the operational window requirement.

---

### Database Migrations: node-pg-migrate

**What:** `node-pg-migrate` — SQL-based migration tool for PostgreSQL.

**Why:**
- SQL-first migrations (not ORM-generated) give full control over schema changes, index creation, and data migrations.
- Migrations run on container startup (`npm run migrate`) before the application accepts traffic.
- Version-controlled migration files live in `db/migrations/` in the repository.

---

## 4. System Components

### Component 1: Webhook Handler

**Purpose:** Entry point for all Telegram Updates. Validates authenticity and hands off to the Router.

**Responsibilities:**
- Receive HTTP POST from Telegram at `/webhook`
- Validate `X-Telegram-Bot-Api-Secret-Token` header (reject 403 if missing or wrong)
- Parse JSON body into a typed `Update` object
- Hand off to Router/Dispatcher
- Return HTTP 200 immediately to Telegram (Telegram retries if no 200 within 30s)

**Interfaces:**
- Input: `POST /webhook` with Telegram Update JSON body
- Output: Calls `Router.dispatch(update: Update)`
- Returns: HTTP 200 (always, once validated)

**Dependencies:** Nginx (upstream), grammY (Update parsing), Router

**FRs addressed:** FR-01 (receives all message types), underlying infrastructure for FR-02 through FR-06

---

### Component 2: Router / Dispatcher

**Purpose:** Determines what type of actor sent the update and routes to the appropriate service.

**Responsibilities:**
- Identify sender role (parent, teacher, admin, superadmin, unknown)
- Detect message type (text, photo, voice, video, document, sticker, media_group, callback_query)
- Route to Onboarding Service if `/start` with payload received from unknown sender
- Route to Admin Service if sender is admin or superadmin (command-level authorization enforced within Admin Service)
- Route to Session Manager if parent has multiple children and no active session
- Route to Message Relay if parent or teacher with resolved routing context
- Handle `edited_message` updates (relay edit or ignore per policy)
- Handle `callback_query` for child selection

**Interfaces:**
- Input: grammY `Context` object (wrapping Telegram `Update`)
- Output: Calls appropriate service module with context
- Queries: `users` table by `telegram_user_id`

**Dependencies:** PostgreSQL (user role lookup), Session Manager, Onboarding Service, Admin Service, Message Relay, Rate Limiter

**FRs addressed:** FR-02 (message routing), FR-03 (multi-child selection), FR-04 (teacher reply)

---

### Component 3: Mapping Store

**Purpose:** Authoritative source of all Parent ↔ Student ↔ Teacher relationships. Read-heavy, write-rare.

**Responsibilities:**
- Resolve: given parent_user_id → list of (student_id, student_name) pairs
- Resolve: given student_id → teacher_chat_id
- Resolve: given teacher_user_id + message context → which student (from header stub + reply threading)
- Return mapping metadata for broadcast scope resolution

**Interfaces:**
- Input: Queries from Router and Admin Service
- Output: Resolved IDs and display names
- All queries are indexed single-table reads or simple joins

**Dependencies:** PostgreSQL

**FRs addressed:** FR-02 (routing), FR-03 (child selection), FR-05 (admin mapping management)

---

### Component 4: Message Relay

**Purpose:** Executes the actual anonymized message forwarding using Telegram's `copyMessage` API.

**Responsibilities:**
- Accept: source chat_id, destination chat_id, message_id, student_name (for header), direction
- For teacher-bound messages: send student name header first, then copyMessage
- For parent-bound messages: copyMessage only (no header — teacher's identity is already abstracted)
- Handle all supported message types: text, photo, video, voice, document, sticker, animation
- Handle media_group_id batching (see Section 8)
- Handle reply_to_message threading (see Section 8)
- Invoke Rate Limiter before each copyMessage call
- Invoke Audit Logger after successful relay

**Interfaces:**
- Input: `relay(params: RelayParams): Promise<RelayResult>`
- Output: Telegram API `copyMessage` call, Audit Logger invocation
- RelayParams: `{ from_chat_id, to_chat_id, message_id, student_name?, direction, student_id }`

**Dependencies:** Telegram Bot API (via grammY), Rate Limiter, Audit Logger

**FRs addressed:** FR-02 (anonymous relay), FR-04 (student name header)

---

### Component 5: Onboarding Service

**Purpose:** Handles the complete registration flow for parents and teachers arriving via deep-link token.

**Responsibilities:**
- Parse `start` payload from `/start?start=<token>` deep link
- Validate token: exists, not expired, not already used
- Determine role from token metadata
- Collect PDPA consent: send consent message, await user acknowledgment, record timestamp
- Register user: insert into `users` table with telegram_user_id, chat_id, display_name
- Mark token as used
- Create parent_student_mapping or teacher_student_mapping as indicated by token
- Send welcome message with instructions
- Handle re-registration (user already registered with this token)

**Interfaces:**
- Input: `/start` command with payload (from grammY conversation plugin)
- Output: Inserts to `users`, `parent_student_mappings`, consent timestamp update
- Calls Token/Invite Manager for validation

**Dependencies:** PostgreSQL, Token/Invite Manager, grammY Conversations plugin

**FRs addressed:** FR-01 (onboarding), FR-07 (PDPA consent)

---

### Component 6: Admin Service

**Purpose:** Handles all admin and superadmin-scoped commands for mapping management, broadcast, reports, and system operations.

**Responsibilities:**
- Authenticate: verify sender has role 'admin' or 'superadmin'
- Authorization middleware checks command-level permissions against role before execution
- **Admin-level commands (admin + superadmin):**
  - `/addmapping student_name parent_id teacher_id` — create new mapping
  - `/removemapping student_id` — soft-delete mapping
  - `/reassign student_id new_teacher_id` — update teacher assignment
  - `/broadcast [scope] [message]` — enqueue broadcast job
  - `/listmappings` — return paginated list of active mappings
  - `/report [type]` — generate and send CSV report (message volume, broadcast delivery)
  - `/gentoken role student_id [teacher_id]` — generate new onboarding token
- **Superadmin-only commands:**
  - `/deactivate user_id` — deactivate any user account (including admins)
  - `/reactivate user_id` — reactivate a deactivated user account
  - `/promote user_id` — promote a user to admin role
  - `/demote user_id` — demote an admin to a non-admin role
  - `/audit [filters]` — view audit logs
  - `/system_status` — system diagnostics and health summary

**Interfaces:**
- Input: Telegram messages starting with `/` from admin users
- Output: Confirmation messages, CSV files, database mutations, broadcast queue jobs
- Admin command registry: declarative handler registration with authorization middleware

**Dependencies:** PostgreSQL, Broadcast Queue, Token/Invite Manager

**FRs addressed:** FR-05 (admin mapping management), FR-06 (broadcast)

---

### Component 7: Rate Limiter

**Purpose:** Enforces Telegram API rate limits to prevent 429 errors and service disruption.

**Responsibilities:**
- Per-chat rate limiting: max 1 message/second per target chat_id
- Global rate limiting: max 25 messages/second across all chats (safety margin below 30)
- Per-group rate limiting: max 18 messages/minute to group chats (safety margin below 20)
- On limit breach: delay the relay call (not reject) by the calculated wait duration
- Expose rate limit state for broadcast queue to consume

**Interfaces:**
- Input: `checkAndWait(target_chat_id: string): Promise<void>`
- Output: Resolves when safe to send; internally increments Redis counters

**Dependencies:** Redis (INCR + EXPIRE for sliding window counters)

**FRs addressed:** NFR-06 (broadcast rate compliance), underlying guarantee for NFR-02 (relay latency)

---

### Component 8: Audit Logger

**Purpose:** PDPA-compliant metadata logging of all relay operations. Append-only, non-blocking.

**Responsibilities:**
- Record: source_user_id, target_user_id, student_id, direction, message_type, relayed_message_id, created_at
- Explicitly NOT record: message text content, file contents, image data, voice transcriptions
- Non-blocking: fire-and-forget from relay path (audit failure must not block message delivery)
- Record broadcast delivery events: admin_user_id, scope, target_count, delivered_count

**Interfaces:**
- Input: `logRelay(params: AuditParams): void` (no await on relay path)
- Output: INSERT to `message_audit_log` table
- Errors: logged to application log, do not propagate to caller

**Dependencies:** PostgreSQL (write-only from relay path)

**FRs addressed:** FR-07 (PDPA audit trail), NFR-03 (compliance)

---

### Component 9: Token / Invite Manager

**Purpose:** Generates and validates single-use onboarding tokens for deep-link registration.

**Responsibilities:**
- Generate token: `crypto.randomBytes(24)` → base64url encode → 32-character token
- Enforce 64-character payload limit for Telegram deep links
- Store token with: role, student_id, teacher_user_id (for parent tokens), expiry (72 hours default)
- Validate token: check existence, expiry, used_at is null
- Mark token used: set used_at, used_by upon successful onboarding
- Admin command: generate token and return deep link URL

**Interfaces:**
- Input (generate): `generateToken(params: TokenParams): Promise<string>`
- Input (validate): `validateToken(token: string): Promise<TokenRecord | null>`
- Output: Token string; deep link URL `t.me/MathMavens_bot?start=<token>`

**Dependencies:** PostgreSQL (`onboarding_tokens` table), Node.js crypto module

**FRs addressed:** FR-01 (deep-link onboarding security)

---

### Component 10: Session Manager

**Purpose:** Tracks per-user interaction state, primarily child selection for multi-child parents.

**Responsibilities:**
- Store active student context per parent: `session:{user_id}` → `{ student_id, student_name }`
- Session TTL: 8 hours (school day window); resets on each message from parent
- Clear session: on `/reset` command or explicit child re-selection
- Multi-step conversation state (for onboarding, admin flows): stored as grammY conversation state backed by Redis

**Interfaces:**
- Input: `getSession(user_id)`, `setSession(user_id, student_id)`, `clearSession(user_id)`
- Output: Session data from Redis
- grammY RedisSessionAdapter handles the underlying storage

**Dependencies:** Redis, grammY session plugin

**FRs addressed:** FR-03 (multi-child session management)

---

### Component 11: Broadcast Queue

**Purpose:** Throttled delivery of admin broadcast messages to parent cohorts.

**Responsibilities:**
- Accept broadcast job: admin_user_id, scope (all/cohort/individual), message content
- Resolve scope to list of target chat_ids (query PostgreSQL)
- Enqueue individual send jobs at rate of 25/second (Telegram safe limit)
- Track delivered_count and failed_count per broadcast
- Retry failed sends with exponential back-off (max 3 attempts)
- Report completion to admin via reply message

**Interfaces:**
- Input: `enqueueBroadcast(params: BroadcastParams): Promise<string>` (returns job_id)
- Output: sendMessage calls at throttled rate; delivery report to admin chat

**Dependencies:** BullMQ (Redis), PostgreSQL (scope resolution), Telegram Bot API

**FRs addressed:** FR-06 (broadcast), NFR-06 (500 parents within 30 seconds)

---

### Component 12: AI Gateway (Phase 2 — stub in MVP)

**Purpose:** Integration point for OpenClaw AI layer. Receives messages for triage before relay.

**Responsibilities (Phase 2):**
- Intercept out-of-hours parent messages (configurable hours window)
- Forward to OpenClaw API: message content, student_id, session history
- If OpenClaw resolves with high confidence: respond directly, log as AI_RESOLVED, do not relay to teacher
- If OpenClaw cannot resolve: proceed with normal relay, flag as AI_ESCALATED
- Maintain per-student conversation history in Redis or dedicated store

**Interfaces (MVP stub):**
- `async aiTriage(context): AiTriageResult` — always returns `{ action: 'RELAY' }` in MVP
- Phase 2: Returns `{ action: 'AI_RESOLVED', response: string } | { action: 'RELAY' }`

**Dependencies (Phase 2):** OpenClaw API, Redis (session memory)

**FRs addressed (Phase 2):** FR-08 (AI homework triage)

---

### Component 13: Payment Gateway (Phase 3 — stub in MVP)

**Purpose:** Integration point for Stripe/PayNow billing.

**Responsibilities (Phase 3):**
- Generate monthly invoices per student enrollment
- Create Stripe PaymentIntent with PayNow payment method type
- Generate dynamic PayNow QR code and send to parent
- Receive Stripe webhook: `payment_intent.succeeded` → mark invoice paid
- Send payment confirmation to parent
- Admin: pull payment status reports

**Interfaces (MVP stub):**
- Module exists with no-op implementations; Stripe SDK not installed until Phase 3
- Stripe webhook endpoint stubbed at `/stripe/webhook` returning 200

**FRs addressed (Phase 3):** FR-09 (automated billing), FR-10 (PayNow QR)

---

### Component 14: REST API Layer

**Purpose:** Serves the web dashboard with authenticated CRUD operations. Shares all business logic modules with the bot handler — no duplication.

**Responsibilities:**
- Expose a JSON REST API at `/api/v1/*` via Hono route group
- Enforce session authentication middleware on all routes except `/api/v1/auth/login`
- Map HTTP CRUD operations to the same service modules used by bot commands (Mapping Store, Token Manager, Broadcast Queue, Audit Logger)
- Generate proper HTTP status codes: 200, 201, 400, 401, 403, 404, 409, 422, 500
- Validate all request bodies with Zod schemas (same approach as admin command argument validation)
- Return paginated responses for list endpoints (`{ data: [], total, page, pageSize }`)

**Interfaces:**
- Input: HTTP requests from the React SPA frontend (authenticated via session cookie)
- Output: JSON responses; delegates to Mapping Store, Token Manager, Broadcast Queue, Audit Logger
- Route group: `/api/v1/*` (see Section 6 for full endpoint inventory)

**Dependencies:** Web Auth Service (session middleware), Mapping Store, Token Manager, Broadcast Queue, Audit Logger, PostgreSQL, Redis

**FRs addressed:** FR-05 (admin mapping management), FR-06 (broadcast dispatch), FR-05a/b/c (superadmin operations)

---

### Component 15: Web Auth Service

**Purpose:** Authentication and session lifecycle management for dashboard users. Separate from Telegram-based bot authentication.

**Responsibilities:**
- Validate email/password credentials against `dashboard_users` table (bcrypt comparison)
- Create session on successful login: `dashboard_session:{uuid}` → `{ user_id, role, email }` in Redis with 24-hour sliding TTL
- Provide session validation middleware: extract session cookie → Redis lookup → attach `dashboardUser` to request context
- Invalidate session on logout: delete Redis key
- Expose `GET /api/v1/auth/me` for the frontend to confirm current session and retrieve user info
- Account lockout on repeated failed logins: 5 failures → 15-minute lock (tracked in Redis)

**Interfaces:**
- `POST /api/v1/auth/login` — email + password body; sets `Set-Cookie: session=<id>; HttpOnly; Secure; SameSite=Strict`
- `POST /api/v1/auth/logout` — clears session from Redis and expires cookie
- `GET /api/v1/auth/me` — returns `{ id, email, role, displayName }` for current session

**Data:**
- `dashboard_users` PostgreSQL table (see Section 5 for schema)
- Session store: Redis key `dashboard_session:{uuid}` with 24h TTL

**Dependencies:** PostgreSQL (`dashboard_users`), Redis (session store), bcrypt

**FRs addressed:** Dashboard authentication gate (prerequisite for all FR-05 operations via web interface)

---

### Component 16: Frontend (Web Dashboard)

**Purpose:** React single-page application providing the primary interface for Admin and Superadmin operations. Bot commands serve as a mobile supplement.

**Responsibilities:**
- Render all admin operations as UI: student management, mapping management, token generation, broadcast composition, user management, audit log search, system stats
- Form validation (client-side with react-hook-form + Zod)
- Display real-time-ish data via TanStack Query (polling or on-demand refetch — no WebSocket needed for an admin tool)
- Handle authenticated sessions: redirect to login page on 401, persist session across page refreshes via cookie
- Superadmin-only sections conditionally rendered based on `role` from `/api/v1/auth/me`

**Interfaces:**
- Communicates exclusively with the REST API at `/api/v1/*`
- Served as static files from `/var/www/conduit` by Nginx
- No server-side logic — pure client-side SPA

**Key pages:**
- `/login` — login form
- `/dashboard` — summary stats (active mappings, today's message count, broadcast history)
- `/students` — student list with search; create/edit/deactivate
- `/mappings` — mapping table; create/reassign/deactivate
- `/tokens` — pending/used/expired tokens; generate new
- `/broadcasts` — broadcast history with delivery stats; compose new broadcast
- `/users` — Telegram user management (teachers, parents)
- `/audit` — audit log search (superadmin)
- `/settings/team` — dashboard user management (superadmin)
- `/settings/system` — system status and health (superadmin)

**Dependencies:** REST API Layer (via HTTP), Vite (build), shadcn/ui, TanStack Query, react-hook-form, Zod

**FRs addressed:** FR-05, FR-05a, FR-05b, FR-06 (all via web interface)

---

## 5. Data Architecture

### Database Schema

```sql
-- Extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Core: Users
-- ============================================================
CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    telegram_user_id    BYTEA NOT NULL UNIQUE,         -- AES-256 encrypted via pgcrypto
    chat_id             BYTEA NOT NULL UNIQUE,          -- AES-256 encrypted
    role                VARCHAR(20) NOT NULL            -- 'parent', 'teacher', 'admin' (office staff), 'superadmin' (system owner)
                        CHECK (role IN ('parent', 'teacher', 'admin', 'superadmin')),
    display_name        BYTEA NOT NULL,                 -- AES-256 encrypted
    registered_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pdpa_consent_at     TIMESTAMPTZ,                    -- NULL means consent not yet given
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at      TIMESTAMPTZ,
    deactivated_by      BIGINT REFERENCES users(id)
);

-- Index on unencrypted lookup: role filter for admin operations
CREATE INDEX idx_users_role ON users(role);

-- Note on encryption: telegram_user_id and chat_id are queried by exact value.
-- Lookup uses: WHERE telegram_user_id = pgp_sym_encrypt($1, current_setting('app.encryption_key'))
-- All application queries must use the symmetric encryption function.
-- Plaintext IDs never appear in logs or error messages.

-- ============================================================
-- Core: Students
-- ============================================================
CREATE TABLE students (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    grade           VARCHAR(50),                        -- e.g. 'Primary 3', 'Secondary 1'
    enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- Core: Teacher-Student Mappings
-- ============================================================
CREATE TABLE teacher_student_mappings (
    id                  BIGSERIAL PRIMARY KEY,
    teacher_user_id     BIGINT NOT NULL REFERENCES users(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    assigned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by         BIGINT REFERENCES users(id),    -- admin who created the mapping
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at      TIMESTAMPTZ,
    UNIQUE (teacher_user_id, student_id)               -- one teacher per student (active enforced in app)
);

CREATE INDEX idx_tsm_student_id ON teacher_student_mappings(student_id) WHERE is_active = TRUE;
CREATE INDEX idx_tsm_teacher_user_id ON teacher_student_mappings(teacher_user_id) WHERE is_active = TRUE;

-- ============================================================
-- Core: Parent-Student Mappings
-- ============================================================
CREATE TABLE parent_student_mappings (
    id                  BIGSERIAL PRIMARY KEY,
    parent_user_id      BIGINT NOT NULL REFERENCES users(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    relationship        VARCHAR(50) NOT NULL DEFAULT 'parent'  -- 'parent', 'guardian', 'sibling'
                        CHECK (relationship IN ('parent', 'guardian', 'sibling')),
    assigned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by         BIGINT REFERENCES users(id),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at      TIMESTAMPTZ,
    UNIQUE (parent_user_id, student_id)
);

CREATE INDEX idx_psm_parent_user_id ON parent_student_mappings(parent_user_id) WHERE is_active = TRUE;
CREATE INDEX idx_psm_student_id ON parent_student_mappings(student_id) WHERE is_active = TRUE;

-- ============================================================
-- Core: Onboarding Tokens
-- ============================================================
CREATE TABLE onboarding_tokens (
    id                  BIGSERIAL PRIMARY KEY,
    token               VARCHAR(64) NOT NULL UNIQUE,    -- base64url, 32 chars
    role                VARCHAR(20) NOT NULL CHECK (role IN ('parent', 'teacher')),
    student_id          BIGINT REFERENCES students(id), -- which student this token is for
    teacher_user_id     BIGINT REFERENCES users(id),    -- for parent tokens: which teacher to map to
    created_by          BIGINT REFERENCES users(id),    -- admin who generated the token
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '72 hours'),
    used_at             TIMESTAMPTZ,                    -- NULL = unused
    used_by             BIGINT REFERENCES users(id)     -- NULL = unused
);

CREATE INDEX idx_tokens_token ON onboarding_tokens(token) WHERE used_at IS NULL;
CREATE INDEX idx_tokens_expires ON onboarding_tokens(expires_at) WHERE used_at IS NULL;

-- ============================================================
-- Audit: Message Relay Log (content never stored, only metadata)
-- ============================================================
CREATE TABLE message_audit_log (
    id                  BIGSERIAL PRIMARY KEY,
    source_user_id      BIGINT NOT NULL REFERENCES users(id),
    target_user_id      BIGINT NOT NULL REFERENCES users(id),
    student_id          BIGINT REFERENCES students(id),
    direction           VARCHAR(30) NOT NULL
                        CHECK (direction IN ('parent_to_teacher', 'teacher_to_parent', 'ai_to_parent')),
    message_type        VARCHAR(30) NOT NULL
                        CHECK (message_type IN ('text', 'photo', 'video', 'voice', 'document',
                                                'sticker', 'animation', 'media_group', 'other')),
    relayed_message_id  BIGINT,                         -- Telegram message_id of the copyMessage result
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- NO: message_text, file_id, content of any kind
);

CREATE INDEX idx_audit_source ON message_audit_log(source_user_id, created_at DESC);
CREATE INDEX idx_audit_student ON message_audit_log(student_id, created_at DESC);
CREATE INDEX idx_audit_created ON message_audit_log(created_at DESC);

-- Partitioning consideration: if audit log grows beyond 1M rows,
-- partition by created_at (monthly). Out of scope for MVP.

-- ============================================================
-- Audit: Broadcast Log
-- ============================================================
CREATE TABLE broadcast_log (
    id                  BIGSERIAL PRIMARY KEY,
    admin_user_id       BIGINT NOT NULL REFERENCES users(id),
    scope               VARCHAR(50) NOT NULL,           -- 'all', 'cohort:{name}', 'individual:{user_id}'
    message_preview     VARCHAR(200),                   -- first 200 chars of broadcast text only
    target_count        INTEGER NOT NULL DEFAULT 0,
    delivered_count     INTEGER NOT NULL DEFAULT 0,
    failed_count        INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_broadcast_created ON broadcast_log(created_at DESC);

-- ============================================================
-- Web Dashboard: Dashboard Users
-- (Separate from Telegram users table — these are admin/superadmin
--  accounts for web dashboard login, not Telegram bot users)
-- ============================================================
CREATE TABLE dashboard_users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,              -- bcrypt, cost factor 12
    role            VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'superadmin')),
    display_name    VARCHAR(200) NOT NULL,
    telegram_user_id BIGINT REFERENCES users(id),       -- optional link to Telegram user record
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      BIGINT REFERENCES dashboard_users(id), -- NULL for the initial superadmin seed
    last_login_at   TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_dashboard_users_email ON dashboard_users(email) WHERE is_active = TRUE;

-- Note: Dashboard sessions are stored in Redis, not PostgreSQL.
-- Key: dashboard_session:{uuid}  Value: { user_id, role, email }  TTL: 86400s (24 hours, sliding)
-- This avoids adding a write to PostgreSQL on every authenticated API request.
-- If session auditability is required in future, a dashboard_sessions table can be added.

-- ============================================================
-- Phase 2: Attendance
-- ============================================================
CREATE TABLE attendance_records (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    class_date          DATE NOT NULL,
    teacher_user_id     BIGINT NOT NULL REFERENCES users(id),
    status              VARCHAR(20) NOT NULL
                        CHECK (status IN ('present', 'absent', 'late', 'makeup')),
    notes               VARCHAR(500),
    marked_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, class_date, teacher_user_id)
);

CREATE INDEX idx_attendance_student ON attendance_records(student_id, class_date DESC);
CREATE INDEX idx_attendance_teacher ON attendance_records(teacher_user_id, class_date DESC);

-- ============================================================
-- Phase 3: Invoices
-- ============================================================
CREATE TABLE invoices (
    id                          BIGSERIAL PRIMARY KEY,
    student_id                  BIGINT NOT NULL REFERENCES students(id),
    parent_user_id              BIGINT NOT NULL REFERENCES users(id),
    amount_cents                INTEGER NOT NULL CHECK (amount_cents > 0),
    currency                    VARCHAR(3) NOT NULL DEFAULT 'SGD',
    stripe_payment_intent_id    VARCHAR(200),
    stripe_qr_code_url          TEXT,                   -- temporary, expires
    status                      VARCHAR(20) NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
    due_date                    DATE NOT NULL,
    paid_at                     TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                  BIGINT REFERENCES users(id)
);

CREATE INDEX idx_invoices_student ON invoices(student_id, due_date DESC);
CREATE INDEX idx_invoices_status ON invoices(status) WHERE status IN ('pending', 'sent', 'overdue');
CREATE INDEX idx_invoices_stripe ON invoices(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
```

**Schema Notes:**

1. `telegram_user_id` and `chat_id` are stored as BYTEA (encrypted). Application code must decrypt on read. The encryption key is in environment variables, never in the database.

2. The `message_audit_log` has no content columns by design. This is the PDPA minimization principle enforced at schema level, not just policy level. A developer cannot accidentally add content logging without a schema migration.

3. All FKs reference `users(id)` not `users(telegram_user_id)` — internal IDs are used for joins to avoid decrypting in join conditions.

4. Soft deletes (`is_active`, `deactivated_at`) are used on all operational tables. Hard delete paths exist for Right to Erasure (these will anonymize the users row by zeroing encrypted fields and mark `is_active = false`, preserving referential integrity in audit logs).

5. `dashboard_users` is intentionally separate from the `users` table. The `users` table holds Telegram-authenticated users (parents, teachers, admins via bot). `dashboard_users` holds web dashboard credentials (email + bcrypt password). An optional FK `telegram_user_id` links the two where a single person has both a Telegram role and a dashboard login. Dashboard sessions live in Redis only — no `dashboard_sessions` table is needed for MVP.

---

### Data Flow Diagrams

#### Message Relay Data Flow

```
Parent Message Arrives
         │
         ▼
[Webhook Handler]
  Parse Update → extract telegram_user_id (from.id), chat_id, message
         │
         ▼
[Router] — DB Query: SELECT id, role FROM users WHERE telegram_user_id = encrypt($1)
  → user found, role = 'parent', internal user_id = 17
         │
         ▼
[Session Manager] — Redis: GET session:17
  → { student_id: 42, student_name: 'Wei Ming' }
         │
         ▼
[Mapping Store] — DB Query:
  SELECT u.id, pgp_sym_decrypt(u.chat_id, $key) as chat_id
  FROM users u
  JOIN teacher_student_mappings tsm ON tsm.teacher_user_id = u.id
  WHERE tsm.student_id = 42 AND tsm.is_active = true
  → teacher internal_id = 8, teacher_chat_id = '12345678' (decrypted)
         │
         ▼
[Rate Limiter] — Redis: INCR rate:12345678:2026030315 / EXPIRE 1
  → counter = 1, under limit, proceed
         │
         ▼
[Message Relay]
  Step 1: sendMessage(chat_id=teacher_chat_id, text="[Wei Ming] — Parent:")
  Step 2: copyMessage(chat_id=teacher_chat_id,
                      from_chat_id=parent_chat_id,
                      message_id=parent_message_id)
  → returns: { message_id: 99001 }
         │
         ▼
[Audit Logger] — fire-and-forget:
  INSERT INTO message_audit_log
    (source_user_id=17, target_user_id=8, student_id=42,
     direction='parent_to_teacher', message_type='text',
     relayed_message_id=99001, created_at=now())
```

#### Onboarding Data Flow

```
Admin generates token:
  /gentoken parent 42  (student_id=42, teacher_user_id=8)
         │
         ▼
[Token/Invite Manager]
  token = base64url(crypto.randomBytes(24))  → 'abc123xyz...'
  INSERT INTO onboarding_tokens
    (token='abc123xyz', role='parent', student_id=42,
     teacher_user_id=8, created_by=1, expires_at=now()+72h)
  → return 't.me/MathMavens_bot?start=abc123xyz'
         │
  Admin copies link, sends to parent via any channel
         │
Parent clicks link → opens @MathMavens_bot in Telegram → /start abc123xyz
         │
         ▼
[Webhook Handler] → [Router] → unknown sender → [Onboarding Service]
         │
         ▼
[Onboarding Service]
  Step 1: Validate token
    SELECT * FROM onboarding_tokens
    WHERE token='abc123xyz' AND used_at IS NULL AND expires_at > NOW()
    → Found, role='parent', student_id=42
         │
  Step 2: Check if user already registered
    SELECT id FROM users WHERE telegram_user_id = encrypt(from.id)
    → Not found, proceed
         │
  Step 3: Send PDPA consent message
    "Before we begin, please confirm you agree to Math Mavens collecting
    and processing your Telegram information for communication with your
    child's teacher. Type YES to confirm."
    [grammY conversation: await message from user]
    → User types 'YES'
         │
  Step 4: Register user
    INSERT INTO users (telegram_user_id=encrypt(from.id), chat_id=encrypt(chat.id),
                       role='parent', display_name=encrypt(from.first_name),
                       pdpa_consent_at=NOW())
    → id = 17
         │
  Step 5: Create mapping
    INSERT INTO parent_student_mappings
      (parent_user_id=17, student_id=42, relationship='parent', assigned_by=1)
         │
  Step 6: Mark token used
    UPDATE onboarding_tokens SET used_at=NOW(), used_by=17
    WHERE token='abc123xyz'
         │
  Step 7: Send welcome message
    "Welcome! You are now connected to Wei Ming's teacher.
    Simply send a message here and your teacher will receive it."
```

#### Admin Operations Data Flow

```
Admin sends: /addmapping Wei_Ling parent_telegram_id=111222 teacher_telegram_id=333444
         │
         ▼
[Webhook Handler] → [Router] → role='admin' or 'superadmin' → [Admin Service]
         │
         ▼
[Admin Service]
  Step 1: Verify admin role (middleware — requireAdminRole checks role is 'admin' or 'superadmin')
          For superadmin-only commands: additionally checks role is 'superadmin'
  Step 2: Parse command: student_name='Wei Ling', parent_id=111222, teacher_id=333444
  Step 3: Resolve/create student record
    SELECT id FROM students WHERE name ILIKE 'Wei Ling' AND is_active=true
    → If not found: INSERT INTO students (name='Wei Ling')
  Step 4: Resolve existing user records
    SELECT id FROM users WHERE telegram_user_id = encrypt(111222)
    SELECT id FROM users WHERE telegram_user_id = encrypt(333444)
    → If users not found: generate tokens and return links to admin
    → If users found: proceed to create mappings
  Step 5: Create mappings
    INSERT INTO parent_student_mappings (parent_user_id, student_id)
    INSERT INTO teacher_student_mappings (teacher_user_id, student_id)
  Step 6: Confirm to admin
    "Mapping created: Wei Ling ↔ Parent [111222] ↔ Teacher [333444]"
```

---

## 6. API Design (Internal)

### REST API Endpoint Inventory

All endpoints are prefixed `/api/v1`. All non-auth endpoints require a valid `dashboard_session` cookie (set at login). Superadmin-only endpoints return 403 for `role = 'admin'`.

```
Authentication:
POST   /api/v1/auth/login          — email/password login; sets httpOnly session cookie
POST   /api/v1/auth/logout         — destroy session; expires cookie
GET    /api/v1/auth/me             — current user info ({ id, email, role, displayName })

Students:
GET    /api/v1/students            — list (paginated, searchable by name/grade)
POST   /api/v1/students            — create student record
PATCH  /api/v1/students/:id        — update name, grade, or other fields
DELETE /api/v1/students/:id        — soft delete (sets is_active = false)
POST   /api/v1/students/import     — CSV bulk import (admin+)

Mappings:
GET    /api/v1/mappings            — list all active mappings (paginated)
POST   /api/v1/mappings            — create parent-student-teacher mapping
PATCH  /api/v1/mappings/:id        — update (reassign teacher or parent)
DELETE /api/v1/mappings/:id        — soft delete (deactivate mapping)

Tokens:
GET    /api/v1/tokens              — list tokens (filterable: pending/used/expired)
POST   /api/v1/tokens              — generate new onboarding token; returns deep link URL

Broadcast:
POST   /api/v1/broadcasts          — create and enqueue broadcast (scope + message)
GET    /api/v1/broadcasts          — list past broadcasts with delivery stats (paginated)
GET    /api/v1/broadcasts/:id      — get broadcast detail (target_count, delivered_count, failed_count)

Users (Telegram users — parents and teachers):
GET    /api/v1/users               — list (filterable by role: teacher/parent)
PATCH  /api/v1/users/:id/activate  — reactivate a deactivated Telegram user (superadmin only)
PATCH  /api/v1/users/:id/deactivate — deactivate a Telegram user (superadmin only)

Dashboard Users (superadmin only):
GET    /api/v1/dashboard-users     — list dashboard admin accounts
POST   /api/v1/dashboard-users     — create new admin account (email + temp password + role)
PATCH  /api/v1/dashboard-users/:id — update role or display name
DELETE /api/v1/dashboard-users/:id — deactivate admin account (sets is_active = false)

Audit (superadmin only):
GET    /api/v1/audit               — search audit log (filters: student_id, direction, date range)

System (superadmin only):
GET    /api/v1/system/status       — system health (DB, Redis, bot webhook status)
GET    /api/v1/system/stats        — usage statistics (active users, messages today, mappings count)
```

**Response envelope convention:**
```typescript
// Success (list)
{ data: T[], total: number, page: number, pageSize: number }

// Success (single)
{ data: T }

// Error
{ error: { code: string, message: string, details?: unknown } }
```

**Authentication flow (web dashboard):**
```
1. Frontend POST /api/v1/auth/login { email, password }
2. Web Auth Service: SELECT from dashboard_users WHERE email = $1
   → bcrypt.compare(password, password_hash)
   → If match: generate session UUID, store in Redis (24h TTL), return Set-Cookie header
   → If mismatch: increment failed_attempts counter in Redis; return 401
3. Subsequent requests: browser sends cookie automatically
4. Session middleware: GET dashboard_session:{id} from Redis → attach to request context
5. POST /api/v1/auth/logout: DELETE dashboard_session:{id} from Redis; expire cookie
```

---

### Webhook Handler Interface

```typescript
// grammY bot setup
const bot = new Bot<MyContext>(process.env.BOT_TOKEN!);

// Webhook secret validation (Nginx pre-validates, app validates again for defense-in-depth)
app.use('/webhook', async (c) => {
  const secretToken = c.req.header('X-Telegram-Bot-Api-Secret-Token');
  if (secretToken !== process.env.WEBHOOK_SECRET) {
    return c.text('Forbidden', 403);
  }
  await bot.handleUpdate(await c.req.json());
  return c.text('OK', 200);
});

// MyContext extends grammY Context with session and DB access
interface MyContext extends Context {
  session: SessionData;
  db: DatabaseClient;
  redis: RedisClient;
}

interface SessionData {
  activeStudentId: number | null;
  activeStudentName: string | null;
  conversationState?: unknown;  // managed by grammY Conversations plugin
}
```

### Router Decision Tree (Pseudocode)

```typescript
async function dispatch(ctx: MyContext): Promise<void> {
  // 1. Identify sender
  const user = await db.getUserByTelegramId(ctx.from!.id);

  // 2. Handle /start command first (works for unknown users)
  if (ctx.message?.text?.startsWith('/start')) {
    const payload = ctx.message.text.split(' ')[1]; // deep-link payload
    if (payload) {
      return onboardingService.handle(ctx, payload);
    }
    return ctx.reply(WELCOME_UNKNOWN_MESSAGE);
  }

  // 3. Unknown user (no /start payload)
  if (!user) {
    return ctx.reply(PLEASE_REGISTER_MESSAGE);
  }

  // 4. Inactive user
  if (!user.is_active) {
    return ctx.reply(ACCOUNT_INACTIVE_MESSAGE);
  }

  // 5. Admin/superadmin commands
  if ((user.role === 'admin' || user.role === 'superadmin') && ctx.message?.text?.startsWith('/')) {
    return adminService.handle(ctx, user); // adminService enforces command-level role permissions
  }

  // 6. Callback queries (inline keyboard responses)
  if (ctx.callbackQuery) {
    return sessionManager.handleCallbackQuery(ctx, user);
  }

  // 7. Parent message flow
  if (user.role === 'parent') {
    const session = ctx.session;

    if (!session.activeStudentId) {
      const children = await mappingStore.getChildrenForParent(user.id);
      if (children.length === 0) {
        return ctx.reply(NO_CHILDREN_MAPPED_MESSAGE);
      }
      if (children.length === 1) {
        await sessionManager.setActiveStudent(ctx, children[0]);
      } else {
        return sessionManager.sendChildSelector(ctx, children);
      }
    }

    const teacher = await mappingStore.getTeacherForStudent(session.activeStudentId!);
    if (!teacher) {
      return ctx.reply(TEACHER_NOT_FOUND_MESSAGE);
    }

    // Phase 2 hook: AI triage
    const aiResult = await aiGateway.triage(ctx, session.activeStudentId!);
    if (aiResult.action === 'AI_RESOLVED') {
      return; // AI handled it
    }

    return messageRelay.relayParentToTeacher(ctx, {
      teacherChatId: teacher.chatId,
      studentName: session.activeStudentName!,
      studentId: session.activeStudentId!,
      parentUserId: user.id,
      teacherUserId: teacher.id,
    });
  }

  // 8. Teacher message flow
  if (user.role === 'teacher') {
    // Teacher must reply to a relayed message to respond
    if (!ctx.message?.reply_to_message) {
      return ctx.reply(TEACHER_MUST_REPLY_MESSAGE);
    }

    const parentContext = await messageRelay.resolveParentFromReply(
      ctx.message.reply_to_message.message_id,
      user.id
    );

    if (!parentContext) {
      return ctx.reply(REPLY_CONTEXT_NOT_FOUND_MESSAGE);
    }

    return messageRelay.relayTeacherToParent(ctx, parentContext);
  }
}
```

### Message Relay Interface

```typescript
interface RelayParams {
  fromChatId: string;    // source chat_id (decrypted)
  toChatId: string;      // destination chat_id (decrypted)
  messageId: number;     // original message_id
  studentName?: string;  // injected for teacher-bound messages
  studentId: number;
  sourceUserId: number;  // internal DB user id
  targetUserId: number;  // internal DB user id
  direction: 'parent_to_teacher' | 'teacher_to_parent';
}

interface RelayResult {
  success: boolean;
  relayedMessageId?: number;
  error?: string;
}

// Relay execution (simplified)
async function relay(params: RelayParams): Promise<RelayResult> {
  await rateLimiter.checkAndWait(params.toChatId);

  if (params.direction === 'parent_to_teacher' && params.studentName) {
    await bot.api.sendMessage(params.toChatId, `[${params.studentName}] — Parent:`);
  }

  const result = await bot.api.copyMessage(
    params.toChatId,
    params.fromChatId,
    params.messageId
  );

  // Non-blocking audit
  auditLogger.logRelay({
    sourceUserId: params.sourceUserId,
    targetUserId: params.targetUserId,
    studentId: params.studentId,
    direction: params.direction,
    messageType: detectMessageType(ctx.message!),
    relayedMessageId: result.message_id,
  });

  return { success: true, relayedMessageId: result.message_id };
}
```

### Admin Command Handler Interface

```typescript
// Declarative admin command registration
// requiredRole: 'admin' = accessible by both admin and superadmin
//               'superadmin' = accessible by superadmin only
const adminCommands: AdminCommandDef[] = [
  // Admin-level commands (admin + superadmin)
  {
    command: 'addmapping',
    args: ['student_name', 'parent_telegram_id', 'teacher_telegram_id'],
    description: 'Create a new parent-student-teacher mapping',
    requiredRole: 'admin',
    handler: addMappingHandler,
  },
  {
    command: 'removemapping',
    args: ['student_id'],
    requiredRole: 'admin',
    handler: removeMappingHandler,
  },
  {
    command: 'reassign',
    args: ['student_id', 'new_teacher_telegram_id'],
    requiredRole: 'admin',
    handler: reassignTeacherHandler,
  },
  {
    command: 'broadcast',
    args: ['scope', '...message'],
    description: 'scope: all | cohort:<name> | user:<telegram_id>',
    requiredRole: 'admin',
    handler: broadcastHandler,
  },
  {
    command: 'gentoken',
    args: ['role', 'student_id', '?teacher_telegram_id'],
    requiredRole: 'admin',
    handler: generateTokenHandler,
  },
  {
    command: 'listmappings',
    args: [],
    requiredRole: 'admin',
    handler: listMappingsHandler,
  },
  {
    command: 'report',
    args: ['type'],  // 'messages' | 'attendance' | 'broadcast'
    requiredRole: 'admin',
    handler: reportHandler,
  },
  // Superadmin-only commands
  {
    command: 'deactivate',
    args: ['user_id'],
    requiredRole: 'superadmin',
    handler: deactivateUserHandler,
  },
  {
    command: 'reactivate',
    args: ['user_id'],
    requiredRole: 'superadmin',
    handler: reactivateUserHandler,
  },
  {
    command: 'promote',
    args: ['user_id'],
    description: 'Promote user to admin role',
    requiredRole: 'superadmin',
    handler: promoteUserHandler,
  },
  {
    command: 'demote',
    args: ['user_id'],
    description: 'Demote admin to non-admin role',
    requiredRole: 'superadmin',
    handler: demoteUserHandler,
  },
  {
    command: 'audit',
    args: ['?filters'],
    requiredRole: 'superadmin',
    handler: auditLogHandler,
  },
  {
    command: 'system_status',
    args: [],
    requiredRole: 'superadmin',
    handler: systemStatusHandler,
  },
];
```

---

## 7. Security Architecture

### Bot Token Storage

The bot token is the master credential for the entire system. Its compromise is equivalent to a full system breach.

**Storage:** `.env` file on the VPS, owned by root, chmod 600. Injected into Docker Compose via `env_file`. **Never committed to the repository.**

**Repository protection:** `.gitignore` includes `.env*` (all dot-env variants). GitHub branch protection rules prevent merges if `.env` appears in any commit.

**Rotation procedure (documented in ops runbook):**
1. Issue new token via @BotFather `/revoke`
2. Update `.env` on VPS
3. Run `docker-compose up -d` to restart with new token
4. Verify webhook re-registration with new token
5. Verify relay test message succeeds

**Note on the token in this document:** The token `8783590477:AAHdtbunGaoGCK9rOFG-tyPVXWdFt-bLAU4` appears in the project brief for architectural context. **This token must be considered compromised if this document is ever shared outside the development team.** Rotate immediately upon any external exposure.

---

### Webhook Validation

Telegram supports a `secret_token` parameter during webhook registration. Every incoming webhook request includes `X-Telegram-Bot-Api-Secret-Token: <value>`. Requests without this header or with incorrect values are rejected.

**Two-layer validation:**
1. **Nginx layer:** `proxy_set_header` check via `map` directive — requests with wrong secret return 403 before hitting Node.js (reduces attack surface, prevents resource exhaustion).
2. **Application layer:** Second validation in the webhook handler as defense-in-depth. Even if Nginx misconfiguration bypasses layer 1, layer 2 catches it.

**Secret token:** 32-character cryptographically random string, stored in `.env` as `WEBHOOK_SECRET`. Generated at deployment time.

---

### User Authentication and Authorization

**Authentication:** Telegram's own authentication. When a user sends a message to the bot, Telegram includes their verified `from.id` (Telegram User ID). This ID is cryptographically tied to the user's phone number by Telegram's infrastructure — it cannot be spoofed by another Telegram user.

**What we verify:** On every incoming message, we:
1. Look up the sender's `telegram_user_id` in our `users` table (encrypted lookup)
2. Check `is_active = true`
3. Read `role` to determine authorization level

**Authorization:** Role-based. Four roles: `parent`, `teacher`, `admin`, `superadmin`. Implemented as middleware:

```typescript
// Helper: returns true for both admin roles
const isAdminRole = (role: string) => role === 'admin' || role === 'superadmin';

// Grants access to admin + superadmin
const requireAdminRole = async (ctx: MyContext, next: NextFunction) => {
  if (!isAdminRole(ctx.dbUser?.role ?? '')) {
    await ctx.reply('Unauthorized.');
    return;
  }
  await next();
};

// Grants access to superadmin only
const requireSuperadmin = async (ctx: MyContext, next: NextFunction) => {
  if (ctx.dbUser?.role !== 'superadmin') {
    await ctx.reply('Unauthorized. This command requires superadmin privileges.');
    return;
  }
  await next();
};
```

All admin commands pass through `requireAdminRole`. Superadmin-only commands additionally pass through `requireSuperadmin`. No admin or superadmin command is accessible to parent or teacher role users.

**Escalation restriction:** Admin cannot promote themselves or other users to superadmin via bot command. The superadmin role is assigned directly at the database level by a human operator. No bot command exists that can set `role = 'superadmin'`.

**No self-registration:** Users cannot create their own accounts. Every account is created via the admin-generated onboarding token flow. This prevents unauthorized parties from joining the system.

---

### Data Encryption

**In transit:** All HTTP traffic is TLS 1.2+. Nginx terminates TLS using Let's Encrypt certificates. Bot API calls from the application to `api.telegram.org` are HTTPS (enforced by grammY). No plaintext HTTP anywhere.

**At rest:** AES-256 via pgcrypto's `pgp_sym_encrypt`/`pgp_sym_decrypt` functions. The encryption key is read from `current_setting('app.encryption_key')`, which is a PostgreSQL session-level setting injected by the connection pool after each connection is established:

```typescript
// In the database connection initialization:
await pool.query(`SELECT set_config('app.encryption_key', $1, false)`, [process.env.DB_ENCRYPTION_KEY]);
```

Fields encrypted: `telegram_user_id`, `chat_id`, `display_name` in the `users` table.

Fields not encrypted (plaintext): internal `id`, `role`, `registered_at`, `is_active`, `pdpa_consent_at` — these are non-PII operational fields.

---

### PDPA Compliance Architecture

**Consent collection:** Blocking gate in onboarding. No user record created, no mapping created, until:
1. Consent message displayed (plain language, not legalese)
2. User explicitly types confirmation
3. `pdpa_consent_at` timestamp recorded

**Data minimization:**
- Message content never stored (enforced at schema level)
- Only metadata logged: direction, type, timestamp, student association
- `display_name` stored only because it is necessary for teacher context headers. If this UX requirement is removed, display_name can be dropped from the schema.

**Right to Erasure (deletion request):**
```sql
-- Anonymize user (preserve audit log referential integrity)
UPDATE users SET
  telegram_user_id = pgp_sym_encrypt(CONCAT('DELETED_', id::text), $key),
  chat_id = pgp_sym_encrypt(CONCAT('DELETED_', id::text), $key),
  display_name = pgp_sym_encrypt('DELETED', $key),
  is_active = false,
  deactivated_at = NOW()
WHERE id = $user_id;

-- Deactivate all mappings
UPDATE parent_student_mappings SET is_active = false WHERE parent_user_id = $user_id;
UPDATE teacher_student_mappings SET is_active = false WHERE teacher_user_id = $user_id;
```

Audit log records for deleted users retain `source_user_id`/`target_user_id` foreign keys to preserve the audit trail. The actual PII (telegram_user_id) is zeroed in the users table. Audit logs retain no message content, only the fact that a relay occurred.

**Data retention policy:** Session data in Redis: 8-hour TTL. Onboarding tokens: 72-hour TTL (auto-expired by `expires_at` index). Audit logs: retained for 1 year (PDPA's reasonable business need period), then purged by a scheduled cron job.

**Breach notification runbook:** Documented in ops runbook (separate document). Timeline: PDPC notification within 3 days of discovery for significant data breaches (per PDPA amendment 2021).

---

### Rate Limiting and Abuse Prevention

**Telegram API rate limits enforced:**
- Per-chat: 1 message/second → Redis INCR with 1-second TTL window
- Global: 25 messages/second → Redis INCR with 1-second TTL (safety margin of 5 below Telegram's 30 limit)
- Groups: 18 messages/minute → Redis INCR with 60-second TTL

**Abuse prevention (users spamming the bot):**
- Inbound message rate limit per sender: 10 messages per 10 seconds → excessive messaging triggers a 60-second cooldown with a warning message
- Implemented via Redis: INCR inbound:{user_id}:{window} with short TTL

**Admin command rate limit:** Admin and superadmin commands execute database writes. No rate limit on admin or superadmin (trusted roles), but all admin and superadmin actions are logged with the acting user ID.

---

### Web Dashboard Authentication Security

**Cookie attributes (all required):**
```
Set-Cookie: session=<uuid>; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=86400
```
- `HttpOnly`: JavaScript cannot read the cookie. XSS cannot steal it.
- `Secure`: Cookie only sent over HTTPS. Enforced by TLS termination at Nginx.
- `SameSite=Strict`: Cookie not sent on cross-site requests. Provides CSRF protection for same-origin deployments without a separate CSRF token.
- `Path=/api`: Cookie scoped to the API path, not sent with requests to static assets.

**CSRF protection strategy:**
- For MVP (dashboard SPA served from same domain as API): `SameSite=Strict` is sufficient. Cross-origin requests from attacker pages cannot trigger state-changing API calls because the browser will not send the session cookie.
- If the dashboard is later hosted on a different subdomain: add a double-submit CSRF token — store a random token in both the session (Redis) and a non-HttpOnly cookie. The frontend reads the non-HttpOnly cookie and includes the value as a request header. The API validates that header value matches the session-stored value.

**CORS configuration:**
- MVP: same-origin deployment (same domain and port for API and dashboard). No CORS headers needed.
- If cross-origin is required: explicit allowlist `Access-Control-Allow-Origin: https://admin.mathm.example.com` with `Access-Control-Allow-Credentials: true`. Never use `Access-Control-Allow-Origin: *` with credentials.

**Rate limiting on login endpoint:**
- 5 failed login attempts per email per 15 minutes → temporary lockout (Redis counter with TTL)
- 20 requests per IP per minute to `/api/v1/auth/login` → 429 response (Nginx `limit_req` or application-level)
- Prevents brute-force credential stuffing without requiring CAPTCHA for an internal admin tool

**Password storage:**
- bcrypt with cost factor 12. At cost 12, a single bcrypt hash takes ~300ms. Acceptable for login (rare operation); effectively blocks GPU-based offline cracking if the database is exfiltrated.
- No plaintext passwords ever stored or logged.
- Password reset: Superadmin resets passwords via a CLI script or the dashboard (generates a temporary password and emails/sends it via secure channel). No self-service password reset in MVP — admin tool does not expose a public reset flow.

**Session revocation:**
- Deactivating a `dashboard_users` account (`is_active = false`) does not automatically invalidate existing sessions.
- The session middleware must check `is_active` on each request by querying PostgreSQL (or caching the flag in the Redis session payload and invalidating on deactivation).
- Recommended for MVP: store `is_active` in the Redis session payload. On deactivation, delete the Redis session key directly (find active sessions for that user_id and delete them).

---

### Input Validation

Message content passing through the relay is copied by Telegram's infrastructure (`copyMessage`) — the content bytes are never parsed or processed by the application. This eliminates injection risk on the relay path entirely.

Admin commands parse structured arguments. Validation rules:
- `student_name`: max 200 chars, no control characters
- `telegram_id`: must be a valid integer in Telegram's user ID range
- `scope` for broadcast: enum validation (only 'all', 'cohort:', 'user:' prefixes)
- All admin command arguments validated with Zod schemas before processing

REST API request bodies use the same Zod validation approach:
- All request bodies validated against typed Zod schemas before reaching business logic
- Validation errors return 422 with a structured error body (field-level messages)
- No raw SQL built from user input — all database queries use parameterized statements

---

## 8. Message Relay Architecture

### Parent to Teacher Flow (Complete)

```
Parent sends any message type to @MathMavens_bot

1. UPDATE ARRIVES
   Update.message.from.id = parent_telegram_id
   Update.message.chat.id = parent_chat_id
   Update.message.message_id = 10001
   Update.message.{text|photo|voice|video|document|sticker|animation} = payload

2. ROUTER RESOLUTION
   user = DB lookup by telegram_user_id → role='parent', id=17
   session = Redis GET session:17 → { studentId: 42, studentName: 'Wei Ming' }

3. TEACHER RESOLUTION
   teacher = DB query → { userId: 8, chatId: '98765432' }

4. RATE LIMITING
   Redis INCR rate:98765432:{second} → 1 (under limit)

5. HEADER INJECTION
   bot.api.sendMessage(
     chat_id: '98765432',
     text: '[Wei Ming] — Parent:',
     parse_mode: undefined  // plain text
   )
   → Returns header_message_id = 99000

6. COPY MESSAGE
   bot.api.copyMessage(
     chat_id: '98765432',     // teacher's chat with bot
     from_chat_id: parent_chat_id,
     message_id: 10001
   )
   → Returns { message_id: 99001 }

   [Result: Teacher sees plain message with NO "Forwarded from" attribution,
    only the header stub injected by the bot]

7. REPLY MAPPING (stored in Redis for reply threading)
   Redis SET replymap:99001 '{ "parentChatId": parent_chat_id,
                                "parentUserId": 17, "studentId": 42 }' EX 86400
   (24-hour TTL — replies after 24h lose context, teacher gets a warning)

8. AUDIT LOG
   INSERT INTO message_audit_log (source=17, target=8, student=42,
     direction='parent_to_teacher', type='text', relayed_msg=99001)
```

### Teacher to Parent Flow (Reply-Based)

```
Teacher replies to message 99001 (the relayed parent message) in their bot chat

1. UPDATE ARRIVES
   Update.message.reply_to_message.message_id = 99001  ← key field
   Update.message.from.id = teacher_telegram_id
   Update.message.message_id = 99050

2. ROUTER RESOLUTION
   user = DB lookup → role='teacher', id=8

3. REPLY CONTEXT LOOKUP
   Redis GET replymap:99001
   → { parentChatId, parentUserId: 17, studentId: 42 }

4. RATE LIMITING (for parent's chat)
   Redis INCR rate:parent_chat_id:{second}

5. COPY MESSAGE (no header injection — parent doesn't need student context)
   bot.api.copyMessage(
     chat_id: parent_chat_id,
     from_chat_id: teacher_chat_id,
     message_id: 99050
   )
   → Returns { message_id: 10050 }

6. AUDIT LOG
   INSERT INTO message_audit_log (source=8, target=17, student=42,
     direction='teacher_to_parent', type='text', relayed_msg=10050)
```

### Edge Cases

**media_group_id batching:**

When a user sends multiple photos at once, Telegram delivers them as multiple Update objects each with the same `media_group_id`. copyMessage handles each individually, which is correct — Telegram reconstructs the album on the recipient side. The rate limiter must allow 1 message per item per second per destination chat, so a 5-photo album takes ~5 seconds to relay. This is within the 2-second budget per message but the album appears with brief delays between items. No further optimization is needed at MVP scale.

```typescript
// No special media_group handling needed for relay — copyMessage each separately
// Track media_group_id in session to avoid duplicate header injection
if (!ctx.message.media_group_id || !isFirstInGroup(ctx.message.media_group_id)) {
  // Only send header for first message of a media group
  await sendStudentHeader(teacherChatId, studentName);
}
await bot.api.copyMessage(teacherChatId, parentChatId, ctx.message.message_id);
```

**Reply threading (teacher replies to a teacher's own previous reply):**

If a teacher replies to message 10050 (which is itself a relayed teacher message), the reply mapping lookup will fail (no Redis key for 10050). Fallback: check if 10050's message_id is in `message_audit_log` with `source_user_id = teacher_id`. If found, use the `target_user_id` (parent). If not found, prompt teacher: "Cannot find the original conversation. Please use /select to set active student."

**Stickers, voice notes, animations:**

`copyMessage` handles all Telegram message types that have a message_id — stickers, voice, video_note, animation, document, photo. The relay code does not special-case these; `copyMessage` does the right thing. `file_id` reuse is implicit — `copyMessage` sends the existing file_id, not a re-upload.

**Message editing (`edited_message` updates):**

MVP policy: edited messages are not relayed. Telegram sends `edited_message` updates. The router detects `ctx.update.edited_message` and responds to the sender: "Message editing is not supported. Please send a new message." This is a deliberate simplicity trade-off for MVP.

Rationale: relaying `editMessageText` would require storing the mapping of original message_id → relayed message_id (already stored in the reply map). Post-MVP, this can be implemented:
```typescript
// Phase 2: edit relay
await bot.api.editMessageText(
  teacherChatId,
  replyMap.relayedMessageId,
  newText
);
```

**Message deletion:**

Not relayed. Telegram does not expose deleted messages to bots — the bot has no way to know a message was deleted. No action taken.

**Stale session (parent active student changed):**

Parent can type `/reset` to clear session and re-select child. Sessions also expire after 8 hours (Redis TTL). On expiry, the next parent message triggers the child selector again.

**Teacher with no active session (not reply-based):**

If a teacher sends a non-reply message, they are prompted: "Please reply to a parent message to respond. Use /select [student_name] to send a standalone message to a parent."

The `/select` command allows teacher-initiated messaging to a specific parent context. This is a separate flow from reply-threading and requires the teacher to explicitly name which student they are messaging about, providing an audit-friendly explicit context.

---

## 9. Scalability and Performance

### Vertical Scaling Assessment

A single Hetzner CX31 (2 vCPU, 8GB RAM) can comfortably handle:
- 500 concurrent parent-teacher pairs at typical messaging intensity
- Node.js single process handles 500+ concurrent async operations trivially
- PostgreSQL at 500 active users requires perhaps 20 connections, well under a default max of 100
- Redis memory footprint for 500 sessions: ~500 × 200 bytes = 100KB, negligible

**Realistic ceiling for the bot's message relay workload on a CX31:**
- Approximately 5,000–10,000 messages per day throughput without degradation
- Peak concurrent webhook delivery: Telegram delivers webhooks serially per bot (one update at a time, waiting for 200 before sending next). This serialization at the Telegram layer means the Node.js event loop is never flooded — it processes one update at a time, completes quickly, and is ready for the next.

**Web dashboard load impact:**
- The dashboard is an admin-only tool. At most 2-5 concurrent dashboard users (admin + superadmin). This is negligible compared to the 500-pair bot workload.
- Dashboard REST API requests are heavier than bot relay operations (they return paginated lists, run reporting queries) but are infrequent and not on the latency-critical path. Dashboard traffic does not share the message relay path.
- The static frontend (React SPA) is served by Nginx directly from disk — zero application-layer overhead for page loads.
- Dashboard sessions add ~500 bytes per session to Redis (2-5 sessions = 2-3KB). Negligible.
- **The hot path (message relay) is entirely unaffected by dashboard traffic.** Both run in the same process on different Hono route groups, but message relay is non-blocking and completes in milliseconds. A slow dashboard query (e.g., loading 1,000 audit log rows) runs on the same event loop but does not block relay operations thanks to Node.js's async I/O model.

The system will not need vertical scaling until Math Mavens exceeds several thousand enrolled students — a future problem.

### When Horizontal Scaling Is Needed

Horizontal scaling becomes relevant when:
- Single VPS cannot absorb the database write load (audit logs, mappings)
- Broadcast volume exceeds what one BullMQ worker can process within rate limits
- The center expands to multiple locations or white-label licensing (Phase 5)

Horizontal scaling strategy when needed:
- Bot application: Telegram only supports one webhook endpoint per bot. To scale the application, use a shared Redis session store and PostgreSQL — multiple app instances can run behind Nginx (round-robin) as long as all state is externalized to Redis and PostgreSQL (not in-process). This is why in-memory session storage is explicitly avoided.
- Database: Read replicas for reporting queries; primary for writes. pgBouncer for connection pooling at scale.
- Redis: Redis Cluster when single-node memory becomes a constraint (not before 50,000 active sessions).

### Key Database Indexes

All critical query paths have covering indexes:

```sql
-- Hot path: user lookup by telegram_user_id (every message)
-- Note: encrypted columns require application-level pre-encryption for lookup
-- This is why role is NOT encrypted — it is used in index filters
CREATE INDEX idx_users_role ON users(role);

-- Hot path: parent's children list
CREATE INDEX idx_psm_parent_user_id ON parent_student_mappings(parent_user_id) WHERE is_active = TRUE;

-- Hot path: student's teacher
CREATE INDEX idx_tsm_student_id ON teacher_student_mappings(student_id) WHERE is_active = TRUE;

-- Audit log retrieval (reporting, not on relay path)
CREATE INDEX idx_audit_created ON message_audit_log(created_at DESC);
```

**Lookup strategy for encrypted telegram_user_id:**

Since `telegram_user_id` is stored encrypted, we cannot use a standard B-tree index for lookups. Two approaches:

Option A (chosen for MVP): Store a separate `telegram_user_id_hash` column using `sha256(telegram_user_id)` — a deterministic, non-reversible hash that can be indexed and compared without exposing the plaintext ID. The hash is derived at insert time and used for lookups. The encrypted value is used only for display/export purposes.

```sql
ALTER TABLE users ADD COLUMN telegram_user_id_hash BYTEA NOT NULL;
CREATE UNIQUE INDEX idx_users_telegram_hash ON users(telegram_user_id_hash);
-- Lookup: WHERE telegram_user_id_hash = digest($1::text, 'sha256')
```

This preserves fast O(1) indexed lookup while keeping the actual ID encrypted at rest.

### Connection Pooling

The application uses a PostgreSQL connection pool (pg-pool, built into the `pg` package):
- Pool size: 10 connections (sufficient for MVP; increase to 20 for Phase 2)
- Idle timeout: 30 seconds
- Connection timeout: 5 seconds

pgBouncer is not required at MVP scale. It becomes relevant when the pool size on a single app node exceeds 50 connections (at which point PostgreSQL process overhead matters).

### Message Queue for Broadcast Throttling

BullMQ broadcast job structure:
```typescript
interface BroadcastJob {
  broadcastLogId: number;
  targetChatId: string;  // individual recipient
  messageText: string;
  retryCount: number;
}

// Queue configuration
const broadcastQueue = new Queue('broadcast', {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
});

// Worker rate: process 25 jobs per second
const worker = new Worker('broadcast', processBroadcastJob, {
  limiter: { max: 25, duration: 1000 },
});
```

At 25 messages/second, 500 parents receive a broadcast in 20 seconds — within the NFR-06 target of 30 seconds.

---

## 10. Reliability and Monitoring

### Health Check Endpoint

```
GET /healthz
Response 200: { status: "ok", db: "ok", redis: "ok", uptime: 12345 }
Response 503: { status: "degraded", db: "error: connection timeout", redis: "ok" }
```

The health check verifies:
- PostgreSQL: `SELECT 1` query (< 100ms)
- Redis: PING command (< 10ms)
- Application uptime in seconds

Nginx exposes `/healthz` directly (bypassing webhook authentication) for external monitoring.

### Uptime Monitoring

**UptimeRobot** (free tier):
- Monitor type: HTTP(S)
- Interval: 5 minutes
- URL: `https://vps.example.com/healthz`
- Alert contacts: Telegram admin chat (UptimeRobot supports Telegram alerts natively)
- Alert threshold: 2 consecutive failures before alert (avoids false positives on transient Telegram API delays)

### Structured Logging Strategy

All logs are JSON via pino. Log levels:
- `error`: unhandled exceptions, relay failures, database write failures
- `warn`: rate limit hits, token validation failures, unexpected message types
- `info`: relay events (source role, destination role, student id, message type — NO content)
- `debug`: full request/response cycle (disabled in production)

Log fields always present: `timestamp`, `level`, `service`, `version`
Log fields on relay events: `studentId`, `direction`, `messageType`, `durationMs`
Log fields never present: `telegramUserId`, `chatId`, `displayName`, `messageText`, `fileId`

Logs written to stdout → captured by Docker logging driver → rotated daily by logrotate on the host.

### Error Alerting to Admin Telegram Chat

A dedicated module sends formatted error summaries to a private admin Telegram chat on:
- Unhandled Promise rejections
- Relay failures (copyMessage returns non-200)
- Database connection failures
- Redis connection failures
- Webhook secret validation failures (potential attack)

```typescript
// Error alert format
await adminBot.api.sendMessage(ADMIN_ALERT_CHAT_ID,
  `SYSTEM ALERT\n` +
  `Type: ${errorType}\n` +
  `Time: ${new Date().toISOString()}\n` +
  `Details: ${sanitizedErrorMessage}\n` +
  `Action required: Check logs at ${VPS_LOG_PATH}`
);
```

Note: the alert bot uses the same @MathMavens_bot token but sends to a private admin-only chat. `sanitizedErrorMessage` is stripped of any PII before sending.

### Backup Strategy

**PostgreSQL backups:**
- `pg_dump` cron job: daily at 2am SGT
- Compressed dump uploaded to Backblaze B2 object storage
- 30-day retention (older dumps purged by B2 lifecycle rules)
- Backup script tested monthly (restore to local Docker instance)

```bash
#!/bin/bash
# /usr/local/bin/backup-db.sh
set -euo pipefail
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="/tmp/mathm_backup_${TIMESTAMP}.sql.gz"
docker exec mathm-postgres pg_dump -U postgres mathm_production | gzip > "$DUMP_FILE"
b2 upload-file mathm-backups "$DUMP_FILE" "db/${TIMESTAMP}.sql.gz"
rm "$DUMP_FILE"
```

**Redis:** RDB snapshot every 15 minutes to Docker volume. Redis data is recoverable from PostgreSQL for critical state (sessions are ephemeral; queue state is rebuilt from PostgreSQL if needed). Redis backups are a secondary concern.

### Disaster Recovery Plan

**Scenario: VPS fails or is terminated**

1. Provision new Hetzner VPS in same region (< 5 minutes via Hetzner Cloud API or console)
2. Restore latest PostgreSQL backup from Backblaze B2 (< 10 minutes for typical dump size)
3. Clone deployment repository from GitHub
4. Copy `.env` from secure password manager (1Password or Bitwarden team vault)
5. Run `docker-compose up -d`
6. Re-register webhook: `POST https://api.telegram.org/bot<TOKEN>/setWebhook?url=<NEW_IP>/webhook&secret_token=<WEBHOOK_SECRET>`
7. Verify health check passes

Target RTO: < 30 minutes. RPO: < 24 hours (most recent daily backup). During recovery, Telegram delivers messages to the new webhook endpoint once re-registered.

---

## 11. Development and Deployment

### Project Structure

> **Note on codebase naming:** The repository and codebase are named `conduit/` (the platform name), not `math-mavens-bot/`. The directory structure below reflects the Conduit codebase; the Math Mavens deployment is a customer configuration of this platform.

```
conduit/
├── src/
│   ├── bot/
│   │   ├── index.ts                    # Bot and grammY instance setup
│   │   ├── context.ts                  # MyContext type definition
│   │   └── middleware/
│   │       ├── auth.middleware.ts       # User lookup, role verification
│   │       ├── rateLimit.middleware.ts  # Inbound abuse prevention
│   │       └── logging.middleware.ts    # Request/response logging
│   ├── modules/
│   │   ├── relay/
│   │   │   ├── relay.service.ts        # Core copyMessage logic
│   │   │   ├── relay.types.ts
│   │   │   └── relay.test.ts
│   │   ├── onboarding/
│   │   │   ├── onboarding.service.ts
│   │   │   ├── onboarding.conversation.ts  # grammY conversation flow
│   │   │   └── onboarding.test.ts
│   │   ├── session/
│   │   │   ├── session.service.ts
│   │   │   └── session.test.ts
│   │   ├── mapping/
│   │   │   ├── mapping.store.ts        # DB queries for mappings
│   │   │   └── mapping.test.ts
│   │   ├── admin/
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.commands.ts       # Command registry
│   │   │   └── admin.test.ts
│   │   ├── broadcast/
│   │   │   ├── broadcast.service.ts
│   │   │   ├── broadcast.worker.ts     # BullMQ worker
│   │   │   └── broadcast.test.ts
│   │   ├── token/
│   │   │   ├── token.service.ts
│   │   │   └── token.test.ts
│   │   ├── audit/
│   │   │   ├── audit.logger.ts
│   │   │   └── audit.test.ts
│   │   ├── web-auth/
│   │   │   ├── web-auth.service.ts     # Session creation, validation, logout
│   │   │   ├── web-auth.middleware.ts  # Session cookie → dashboardUser on ctx
│   │   │   └── web-auth.test.ts
│   │   ├── ai-gateway/
│   │   │   └── ai-gateway.stub.ts     # Phase 2 stub
│   │   └── payment/
│   │       └── payment.stub.ts        # Phase 3 stub
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts          # POST /login, POST /logout, GET /me
│   │   │   ├── students.routes.ts
│   │   │   ├── mappings.routes.ts
│   │   │   ├── tokens.routes.ts
│   │   │   ├── broadcasts.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── dashboard-users.routes.ts
│   │   │   ├── audit.routes.ts
│   │   │   └── system.routes.ts
│   │   └── middleware/
│   │       ├── session.middleware.ts   # Validates dashboard session cookie
│   │       └── role.middleware.ts      # requireRole('admin'|'superadmin')
│   ├── db/
│   │   ├── pool.ts                    # pg Pool setup with encryption key injection
│   │   └── queries/                   # Raw SQL query functions (no ORM)
│   ├── redis/
│   │   └── client.ts                  # ioredis client setup
│   ├── server/
│   │   ├── app.ts                     # Hono app, webhook endpoint, REST API routes, healthz
│   │   └── router.ts                  # Bot dispatch routing logic
│   └── config/
│       ├── env.ts                     # Zod-validated environment schema
│       └── constants.ts
├── frontend/                          # React SPA (web dashboard)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── StudentsPage.tsx
│   │   │   ├── MappingsPage.tsx
│   │   │   ├── TokensPage.tsx
│   │   │   ├── BroadcastsPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── AuditPage.tsx          # Superadmin only
│   │   │   └── settings/
│   │   │       ├── TeamPage.tsx       # Superadmin: manage dashboard users
│   │   │       └── SystemPage.tsx     # Superadmin: system status + stats
│   │   ├── components/
│   │   │   └── ui/                    # shadcn/ui components (copy-paste)
│   │   ├── lib/
│   │   │   ├── api.ts                 # TanStack Query hooks + fetch wrappers
│   │   │   └── auth.tsx               # Auth context, useCurrentUser hook
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
├── db/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_add_dashboard_users.sql # dashboard_users table
│       ├── 003_add_attendance.sql     # Phase 2
│       └── 004_add_invoices.sql       # Phase 3
├── tests/
│   ├── integration/                   # Docker-based integration tests
│   └── fixtures/                      # Test data factories
├── scripts/
│   ├── backup-db.sh
│   ├── register-webhook.sh
│   ├── gen-token.ts                   # CLI tool for admin token generation
│   └── seed-superadmin.ts             # CLI: create initial superadmin dashboard account
├── docker-compose.yml
├── docker-compose.prod.yml
├── Dockerfile
├── nginx/
│   ├── nginx.conf
│   └── conf.d/
│       └── conduit.conf               # Routes: /webhook, /api/*, /healthz, /* (SPA)
├── .env.example                       # Template with all required keys, no values
├── .gitignore                         # Includes .env*, node_modules, dist, frontend/dist
├── package.json
├── tsconfig.json
└── .github/
    └── workflows/
        ├── ci.yml                     # Test on PR (backend + frontend build)
        └── deploy.yml                 # Deploy on merge to main
```

### Docker Setup

**docker-compose.yml (development):**
```yaml
version: '3.9'

services:
  app:
    build: .
    env_file: .env
    ports:
      - '3000:3000'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mathm_dev
      POSTGRES_USER: mathm
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U mathm']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --save 900 1 --save 300 10 --save 60 10000
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

**Note on frontend in Docker Compose:** The frontend React SPA is a static build artifact — it does not run as a container. The build pipeline (`cd frontend && npm run build`) produces `frontend/dist/`. In production, these files are copied to `/var/www/conduit` on the VPS and served directly by Nginx. No frontend container is needed. The CI/CD pipeline builds the frontend as a step before deploying the backend.

**Dockerfile (backend only):**
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/dist ./dist
COPY --from=build /app/db/migrations ./db/migrations
EXPOSE 3000
CMD ["node", "dist/server/app.js"]
```

**Frontend build (run in CI before deploy, or on VPS):**
```dockerfile
# Optional: frontend build stage (used in CI to produce dist/ artifact)
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build
# Outputs to /frontend/dist — copy to VPS /var/www/conduit via rsync or scp in deploy step
```

### Environment Configuration (.env.example)

```bash
# Telegram
BOT_TOKEN=                         # @MathMavens_bot token from @BotFather
WEBHOOK_SECRET=                    # Random 32-char string for webhook validation
WEBHOOK_URL=                       # https://yourdomain.com/webhook

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=mathm_production
POSTGRES_USER=mathm
POSTGRES_PASSWORD=                 # Strong random password
DB_ENCRYPTION_KEY=                 # 32-char random key for pgcrypto AES-256
DB_POOL_SIZE=10

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Admin
ADMIN_CHAT_ID=                     # Telegram chat_id for system alerts

# Web Dashboard Auth
DASHBOARD_SESSION_SECRET=          # 32-char random string (used for session ID generation)
DASHBOARD_SESSION_TTL_SECONDS=86400  # 24 hours (sliding)
BCRYPT_COST_FACTOR=12              # bcrypt rounds (12 = ~300ms per hash)
# Note: no DASHBOARD_CORS_ORIGIN for MVP — same-origin deployment (SameSite=Strict)

# App
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
SESSION_TTL_SECONDS=28800          # 8 hours (Telegram bot session)

# Phase 2 (leave empty until Phase 2)
OPENCLAW_API_URL=
OPENCLAW_API_KEY=
AI_HOURS_START=22                  # Hour (SGT) after which AI triage activates
AI_HOURS_END=7                     # Hour (SGT) at which AI triage deactivates

# Phase 3 (leave empty until Phase 3)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PAYNOW_PRICE_ID=
```

### CI/CD Pipeline

**.github/workflows/ci.yml:**
```yaml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: mathm_test
          POSTGRES_USER: mathm
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run test
        env:
          DATABASE_URL: postgresql://mathm:test@localhost:5432/mathm_test
          REDIS_URL: redis://localhost:6379
          BOT_TOKEN: 0000000000:test_token_for_ci_do_not_use
          DB_ENCRYPTION_KEY: test_encryption_key_32_chars___
```

**.github/workflows/deploy.yml:**
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
      - name: Upload frontend dist
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist/

  deploy:
    runs-on: ubuntu-latest
    needs: build-frontend
    steps:
      - uses: actions/checkout@v4
      - name: Download frontend dist
        uses: actions/download-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist/
      - name: Copy frontend to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: frontend/dist/*
          target: /var/www/conduit/
          strip_components: 2
      - name: Deploy backend to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/math-mavens-bot
            git pull origin main
            docker-compose -f docker-compose.prod.yml build app
            docker-compose -f docker-compose.prod.yml up -d --no-deps app
            docker-compose -f docker-compose.prod.yml exec -T app npm run migrate
```

### Database Migration Strategy

Migrations run at app startup via `npm run migrate` (using `node-pg-migrate`). The deploy script runs migrations explicitly after container start. Migrations are:
- Idempotent: always check if table/index already exists before creating
- Forward-only: no rollback scripts (write new migrations to fix errors instead)
- Version-controlled: numbered sequentially in `db/migrations/`
- Tested: integration tests run against a fresh migrated schema in CI

### Staging vs. Production

For a 1-2 person team on MVP, a formal staging environment is a secondary concern. The practical approach:
- **Local development:** Docker Compose with dev database, mock Telegram updates
- **Staging:** A separate bot token (create a staging bot via @BotFather) pointing to the same VPS on a different port, with a separate database. Used for pre-release testing.
- **Production:** @MathMavens_bot with the production database and production environment.

Environment separation is enforced by `NODE_ENV` and different `.env` files per environment (never committed to repository).

---

## 12. Phase 2/3 Integration Points

### OpenClaw AI Layer (Phase 2)

**Where it plugs in:** Between the Router and Message Relay in the parent message flow.

**Architecture:**

```
Router (identifies parent message)
    │
    ▼
AI Gateway (Phase 2 — currently stub)
    │
    ├── Is current time within AI triage window (AI_HOURS_START to AI_HOURS_END SGT)?
    │     └── No → proceed to relay immediately
    │
    ├── Is message type text or photo? (AI cannot handle voice/video natively)
    │     └── No → proceed to relay immediately
    │
    ├── Call OpenClaw API:
    │     POST /triage
    │     { student_id, message_content, session_history[], confidence_threshold }
    │
    ├── Response: { action: 'RESOLVE', response: string, confidence: 0.85 }
    │     └── Send AI response to parent
    │         Log: direction='ai_to_parent', message_type='text'
    │         Do NOT relay to teacher
    │
    └── Response: { action: 'ESCALATE', reason: string }
          └── Proceed to relay (with optional note to teacher: "[AI could not resolve]")
```

**Session memory for OpenClaw:**

Each student has an AI conversation history stored in Redis:
```
ai_session:{student_id} → [
  { role: 'parent', content: 'How do I solve this fraction problem?', timestamp },
  { role: 'ai', content: 'Let me explain step by step...', timestamp }
]
```
TTL: 7 days. Older context is truncated to last 20 exchanges.

**Stub implementation (MVP):**
```typescript
// src/modules/ai-gateway/ai-gateway.stub.ts
export async function aiTriage(ctx: MyContext, studentId: number): Promise<AiTriageResult> {
  return { action: 'RELAY' }; // Always relay in Phase 1
}
```

The stub is a proper interface match so Phase 2 only replaces the implementation, not the call sites.

---

### Stripe/PayNow Billing (Phase 3)

**Where it plugs in:**
1. Admin commands: new `/invoice student_id amount` command in Admin Service
2. New webhook endpoint: `/stripe/webhook` for payment confirmation events
3. Scheduled job: monthly invoice generation cron

**Architecture:**

```
Admin: /invoice 42 35000 (cents = SGD 350.00)
    │
    ▼
Admin Service → Payment Gateway
    │
    ├── Stripe API: create PaymentIntent
    │     { amount: 35000, currency: 'sgd', payment_method_types: ['paynow'] }
    │
    ├── Stripe API: get PayNow QR code URL from payment_method
    │
    ├── DB: INSERT INTO invoices (student_id, amount_cents, stripe_payment_intent_id, status='sent')
    │
    └── Bot: send QR code to parent
          "Invoice for Wei Ming: SGD 350.00. Scan QR to pay via PayNow. Valid for 24 hours."

Stripe webhook: POST /stripe/webhook
  Event: payment_intent.succeeded
    │
    ├── Verify Stripe-Signature header (STRIPE_WEBHOOK_SECRET)
    ├── DB: UPDATE invoices SET status='paid', paid_at=now()
    │         WHERE stripe_payment_intent_id = $1
    └── Bot: send confirmation to parent
          "Payment received for Wei Ming — SGD 350.00. Thank you!"
```

**Stub implementation (MVP):**
```typescript
// src/modules/payment/payment.stub.ts
export async function createInvoice(params: InvoiceParams): Promise<void> {
  throw new Error('Phase 3: Stripe integration not yet implemented');
}
```

The `/stripe/webhook` endpoint exists in the HTTP server but returns 200 with no-op body.

---

### Attendance Tracking (Phase 2)

**Where it plugs in:** New teacher commands in the Router.

```
Teacher sends: /attendance
    │
    ▼
Router detects /attendance from teacher
    │
    ▼
Admin Service or dedicated Attendance Module
    │
    ├── Fetch teacher's active students for today
    ├── Send inline keyboard:
    │     [Wei Ming ✓] [Li Xin ✗] [Kai Jie ?]
    │
    ├── Teacher taps each student status
    │
    ├── DB: INSERT INTO attendance_records (student_id, class_date, teacher_user_id, status)
    │
    └── Notify parents:
        bot.api.sendMessage(parent_chat_id,
          "Attendance recorded: Wei Ming was Present at today's class.")
```

This plugs in cleanly because:
- The parent-student-teacher mapping is already resolved
- Sending notifications to parents is the same relay infrastructure (direct sendMessage, not copyMessage)
- Attendance module has no dependencies on relay module

---

### Phase 5 — Conduit Multi-Tenant Architecture

Phase 5 is the architecture evolution that transforms Conduit from a single-customer deployment into a multi-tenant platform.

**Key architectural considerations (deferred to Phase 5):**

- **Tenant isolation:** Each tuition center (tenant) has their own isolated data scope. The `users`, `students`, and `mappings` tables gain a `tenant_id` foreign key. All queries are scoped by tenant.
- **Bot token per tenant:** Each tenant brings their own customer-branded Telegram bot token (e.g., @AceMathTuition_bot). The Conduit backend supports multiple active bot instances, each registered to a separate webhook path (`/webhook/:tenantId`) or separate deployment.
- **Conduit dashboard:** The web dashboard is Conduit-branded at the platform level. Each tenant logs into their own dashboard instance (or a shared platform with tenant-scoped data).
- **Deployment model (TBD at Phase 5):** Options include a single multi-tenant deployment with row-level tenant isolation, or separate container stacks per tenant. The monolithic modular architecture supports both paths — the tenant boundary is a data concern, not a service boundary.

Phase 5 architecture design should be done as a separate document when the first additional customer is in scope. The MVP codebase does not need to pre-build multi-tenancy; clean module boundaries ensure the refactor is tractable.

---

## 13. Traceability Matrix

### Functional Requirements → Components

| Requirement | Description | Primary Component | Supporting Components |
|-------------|-------------|-------------------|----------------------|
| FR-01 | Deep-link onboarding (parents + teachers) | Onboarding Service | Token/Invite Manager, Session Manager |
| FR-02 | Anonymous message relay via copyMessage | Message Relay | Router, Mapping Store, Rate Limiter |
| FR-03 | Multi-child session selection | Session Manager | Router, Mapping Store |
| FR-04 | Teacher reply context (student name header) | Message Relay | Session Manager, Mapping Store |
| FR-05 | Admin (office staff) mapping management commands | Admin Service | Mapping Store, Token/Invite Manager |
| FR-05a | Superadmin user lifecycle management (deactivate, reactivate, promote, demote) | Admin Service (superadmin gate) | PostgreSQL (users table) |
| FR-05b | Superadmin audit log access | Admin Service (superadmin gate), Audit Logger | PostgreSQL (message_audit_log) |
| FR-05c | Superadmin PDPA deletion requests | Admin Service (superadmin gate) | PostgreSQL (anonymization path) |
| FR-06 | Broadcast / announcements | Admin Service, Broadcast Queue | Rate Limiter, Mapping Store |
| FR-07 | PDPA-compliant data handling | Onboarding Service, Audit Logger | Database Schema (no content cols) |
| FR-08 | AI homework triage (Phase 2) | AI Gateway | Session Manager, Message Relay |
| FR-09 | Automated billing (Phase 3) | Payment Gateway | Admin Service |

### Non-Functional Requirements → Architectural Decisions

| NFR | Description | Architectural Decision | Components |
|-----|-------------|----------------------|------------|
| NFR-01 | 99.5% uptime 7am–10pm SGT | Docker with restart policies; UptimeRobot; Hetzner SLA; daily DB backups | Nginx, Docker Compose, PostgreSQL, Backblaze B2 |
| NFR-02 | Relay latency < 2 seconds | Sync relay path (no queue on normal messages); Redis session cache; indexed DB lookups | Message Relay, Session Manager, Rate Limiter |
| NFR-03 | PDPA compliance | Schema-enforced no content storage; consent gate; encrypted PII; deletion paths | Onboarding Service, Audit Logger, PostgreSQL (pgcrypto) |
| NFR-04 | 500 concurrent pairs | Node.js async/await; Redis session cache; indexed PostgreSQL; connection pool | All components (architectural property) |
| NFR-05 | Admin commands < 5 seconds | Synchronous command execution; no external API calls on critical path | Admin Service |
| NFR-06 | Broadcast 500 parents < 30 seconds | BullMQ at 25 msg/sec = 20 seconds for 500 | Broadcast Queue, Rate Limiter |
| NFR-07 | Maintainable by 1-2 person team | Modular monolith; TypeScript; boring proven tech; Docker Compose | Architecture pattern choice |
| NFR-08 | Reproducible deployment | Docker Compose; GitHub Actions CI/CD; .env.example; migration versioning | Docker, GitHub Actions |
| NFR-09 | Secrets never in code/logs | .env file; .gitignore; pino field redaction; no PII in logs | Config module, logging middleware |

### Business Goals → Features → Components

| Business Goal | Feature | Component |
|---------------|---------|-----------|
| BG-01: Eliminate direct contact leakage | Virtual Chat ID routing; no Forwarded attribution | Message Relay (copyMessage) |
| BG-01: Eliminate direct contact leakage | Anonymized user storage | Database Schema (encrypted IDs) |
| BG-02: Reduce admin overhead | Web dashboard (primary admin interface) | REST API Layer, Web Auth Service, Frontend |
| BG-02: Reduce admin overhead | Admin bot commands (mobile supplement) | Admin Service |
| BG-02: Reduce admin overhead | Broadcast to cohorts | Broadcast Queue |
| BG-03: Improve parent communication satisfaction | < 2s relay latency | Relay architecture (sync path) |
| BG-03: Improve parent communication satisfaction | All message types supported | Message Relay (copyMessage handles all) |
| BG-04: Full fee collection automation | PayNow QR via Stripe (Phase 3) | Payment Gateway |
| BG-05: Platform deployment in 8 weeks | Modular monolith; Docker Compose | Architecture pattern; DevOps setup |

---

## Architectural Decisions Log

The following decisions were made deliberately and should be documented for future team members:

| Decision | Choice | Rationale | Alternatives Rejected |
|----------|--------|-----------|----------------------|
| Architecture pattern | Modular Monolith | 1-2 person team; single VPS; Phase 1 scope | Microservices (over-engineered), Pure monolith (no internal boundaries) |
| Language/Runtime | TypeScript/Node.js | grammY type safety; async I/O fit; ecosystem | Python/aiogram (also valid, TypeScript wins on type safety for Telegram API) |
| Telegram framework | grammY | TypeScript-native; active maintenance; Conversations plugin | telegraf (stale), python-telegram-bot (wrong language) |
| Database | PostgreSQL 16 | ACID; relational model; pgcrypto; not SQLite (write contention) | SQLite (concurrent write limits), MongoDB (no referential integrity) |
| Cache/Queue | Redis 7 + BullMQ | Session cache + rate limiting + broadcast queue in one component | In-memory session (not horizontally scalable), separate MQ (extra ops) |
| Encryption approach | pgcrypto + hash for lookup | PDPA at-rest compliance; indexed lookup via hash | Full-disk encryption (harder to manage on VPS), no encryption (PDPA non-compliant) |
| Session storage | Redis (grammY RedisAdapter) | Sub-millisecond reads; TTL-based expiry; horizontally scalable | Database sessions (adds latency to relay path) |
| Message relay | copyMessage (not forward) | No "Forwarded from" attribution = true anonymization | forwardMessage (exposes sender identity) |
| Edit message policy | Not relayed (MVP) | Complexity vs. value trade-off; message_id mapping needed | Full edit relay (Phase 2 extension if needed) |
| Admin interface | Web dashboard (primary) + bot commands (mobile supplement) | Dashboard is primary admin UX for MVP; bot commands remain for quick mobile operations | Dashboard-only (bot supplement retained for field use) |
| Reverse proxy | Nginx + Certbot | Explicit configuration; TLS 1.2+; header-based webhook validation | Caddy (less explicit, defaults could hide security issues) |
| Monitoring | UptimeRobot + pino + admin bot alerts | Free tier; Telegram-native alerts (no new tool); structured logs | Datadog/Sentry (cost; overkill for Phase 1) |

---

*Architecture document prepared by BMAD Systems Architect. 2026-03-03. This document is the canonical architectural reference for math-mavens-bot and supersedes any prior informal architectural discussions. All Phase 1 development decisions should be validated against this document before implementation.*
