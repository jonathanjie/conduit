# Sprint Plan: Conduit — Math Mavens Deployment

**Date:** 2026-03-03
**Author:** BMAD Scrum Master
**Platform:** Conduit
**Customer Deployment:** Math Mavens (@MathMavens_bot)
**Project:** math-mavens-bot
**Status:** Active — Sprint 0 (Pre-Sprint Setup)
**Companions:**
- `architecture-math-mavens-bot-2026-03-03.md`
- `product-brief-math-mavens-bot-2026-03-03.md`
- `frontend-design-conduit-2026-03-03.md`
- `ux-design-math-mavens-bot-2026-03-03.md`
- `sprint-status.yaml` (machine-readable companion)

---

## Overview

### Team
- **Developer:** 1 senior developer (AI-assisted)
- **Sprint Length:** 2 weeks
- **Velocity:** ~30 story points per sprint
- **Total Sprints:** 5 (10 weeks)
- **Target Ship Date:** Week 10 (2026-05-12)

### Estimation Scale (Fibonacci)
| Points | Meaning |
|--------|---------|
| 1 | Trivial — config, stub, copy-paste boilerplate (~1-2 hours) |
| 2 | Small — well-understood, no surprises (~2-4 hours) |
| 3 | Medium — known complexity, single concern (~4-8 hours) |
| 5 | Large — multiple concerns, non-trivial integration (~1-2 days) |
| 8 | Extra-large — complex, external dependencies, or high uncertainty (~2-3 days) |

### Epic Summary
| Epic | Title | Owner Sprint(s) |
|------|-------|-----------------|
| E1 | Infrastructure & Foundation | Sprint 1 |
| E2 | Core Routing Engine | Sprints 1–2 |
| E3 | Admin/Superadmin Bot Commands | Sprint 2 |
| E4 | Dashboard Backend (REST API) | Sprint 3 |
| E5 | Dashboard Frontend | Sprint 4 |
| E6 | Landing Page | Sprint 5 |
| E7 | QA & Hardening | Sprint 5 |

### Story Count
Total stories: **38**
Total estimated points: **146**
Allocated to sprints: **150 points capacity** (5 × 30)

---

## Story Index

| ID | Title | Epic | Points | Sprint |
|----|-------|------|--------|--------|
| S-01 | Monorepo scaffold and toolchain | E1 | 3 | 1 |
| S-02 | Docker Compose dev environment | E1 | 3 | 1 |
| S-03 | PostgreSQL schema + migrations | E1 | 5 | 1 |
| S-04 | Redis setup and session adapter | E1 | 2 | 1 |
| S-05 | Nginx + TLS + webhook config | E1 | 3 | 1 |
| S-06 | grammY bot bootstrap + webhook handler | E2 | 3 | 1 |
| S-07 | Router / Dispatcher | E2 | 5 | 1 |
| S-08 | Message Relay (text + all media types) | E2 | 5 | 1 |
| S-09 | Multi-child session selection | E2 | 3 | 2 |
| S-10 | Teacher reply context (student name header) | E2 | 2 | 2 |
| S-11 | Media group batching | E2 | 3 | 2 |
| S-12 | Rate limiter (Redis sliding window) | E2 | 3 | 2 |
| S-13 | Onboarding flow — deep-link + PDPA consent | E2 | 8 | 2 |
| S-14 | Token / Invite Manager | E2 | 3 | 2 |
| S-15 | Admin bot commands — mapping management | E3 | 5 | 2 |
| S-16 | Admin bot commands — token generation | E3 | 2 | 2 |
| S-17 | Admin bot commands — broadcast dispatch | E3 | 3 | 2 |
| S-18 | Superadmin bot commands — user lifecycle | E3 | 3 | 2 |
| S-19 | Broadcast Queue (BullMQ + throttle) | E2 | 5 | 2 |
| S-20 | Audit Logger | E2 | 3 | 3 |
| S-21 | Web Auth Service (login, logout, session) | E4 | 5 | 3 |
| S-22 | REST API — students CRUD | E4 | 3 | 3 |
| S-23 | REST API — mappings CRUD | E4 | 3 | 3 |
| S-24 | REST API — tokens CRUD + deep-link gen | E4 | 3 | 3 |
| S-25 | REST API — broadcast endpoint | E4 | 3 | 3 |
| S-26 | REST API — users management (superadmin) | E4 | 3 | 3 |
| S-27 | REST API — audit log endpoint (superadmin) | E4 | 2 | 3 |
| S-28 | REST API — system status endpoint | E4 | 2 | 3 |
| S-29 | Phase 2/3 stubs (AI Gateway, Payment GW) | E4 | 1 | 3 |
| S-30 | Dashboard scaffold + routing + auth shell | E5 | 3 | 4 |
| S-31 | Dashboard login page | E5 | 2 | 4 |
| S-32 | Dashboard home / stats page | E5 | 3 | 4 |
| S-33 | Students, mappings, and tokens pages | E5 | 8 | 4 |
| S-34 | Broadcast composer page | E5 | 5 | 4 |
| S-35 | Superadmin pages (users, audit, system) | E5 | 5 | 4 |
| S-36 | Landing page | E6 | 5 | 5 |
| S-37 | E2E tests (Playwright — critical relay paths) | E7 | 5 | 5 |
| S-38 | Security review + PDPA audit + hardening | E7 | 8 | 5 |

---

## Sprint 1 — Foundation + Core Relay

**Goal:** The bot is deployable. A parent can send a message to a teacher through the bot (happy path, single child).

**Dates:** Week 1–2 (2026-03-03 to 2026-03-14)
**Capacity:** 30 points
**Allocated:** 29 points

**Stories in this sprint:**

| ID | Title | Points |
|----|-------|--------|
| S-01 | Monorepo scaffold and toolchain | 3 |
| S-02 | Docker Compose dev environment | 3 |
| S-03 | PostgreSQL schema + migrations | 5 |
| S-04 | Redis setup and session adapter | 2 |
| S-05 | Nginx + TLS + webhook config | 3 |
| S-06 | grammY bot bootstrap + webhook handler | 3 |
| S-07 | Router / Dispatcher | 5 |
| S-08 | Message Relay (text + all media types) | 5 |
| **Total** | | **29** |

**Sprint 1 Definition of Done:**
- [ ] `docker-compose up` starts Postgres, Redis, app, Nginx with TLS
- [ ] Telegram webhook receives and returns HTTP 200
- [ ] Parent with a pre-seeded single-child mapping can send text, photo, voice, video, document, sticker to a teacher
- [ ] Teacher can reply (via bot's reply-to-message context) and it reaches the parent
- [ ] No message content stored in database or logs
- [ ] All migrations run cleanly on fresh DB

---

### S-01 — Monorepo scaffold and toolchain

**Epic:** E1 — Infrastructure & Foundation
**Points:** 3
**Sprint:** 1
**Dependencies:** None

**User Story:**
As a developer, I want a well-structured TypeScript monorepo with lint, format, type-check, and test scripts configured, so that I can start building features without setup friction.

**Acceptance Criteria:**
- [ ] Repository initialized with `pnpm` workspaces (packages: `backend`, `frontend`)
- [ ] TypeScript 5.x configured in strict mode for both packages
- [ ] ESLint + Prettier configured with shared config in root
- [ ] `vitest` configured for backend unit tests
- [ ] `npm run typecheck`, `npm run lint`, `npm run test` all pass on empty scaffolds
- [ ] `.gitignore` covers `.env`, `node_modules`, `dist`, `*.local`
- [ ] Root `package.json` scripts: `dev`, `build`, `test`, `lint`, `typecheck`
- [ ] `CLAUDE.md` project-level file created with doc lookup table pointing to all architecture docs

**Technical Notes:**
- Backend: `src/` with `bot/`, `api/`, `services/`, `db/`, `queue/`, `lib/` directories
- Frontend: standard Vite + React scaffold inside `packages/frontend/`
- Shared Zod schemas extracted to `packages/shared/` if type overlap warrants it (defer if premature)
- `pino` configured as logger immediately — no `console.log` in production code
- `.env.example` committed with all required keys (values empty or placeholder)

---

### S-02 — Docker Compose dev environment

**Epic:** E1 — Infrastructure & Foundation
**Points:** 3
**Sprint:** 1
**Dependencies:** S-01

**User Story:**
As a developer, I want a single `docker-compose up` command to start all services locally, so that onboarding and environment parity are zero-friction.

**Acceptance Criteria:**
- [ ] `docker-compose.yml` defines services: `app`, `postgres`, `redis`, `nginx`
- [ ] `app` service mounts source directory with hot-reload (ts-node-dev or tsx --watch)
- [ ] `postgres` service uses `postgres:16-alpine`, named volume `pgdata`, with health check
- [ ] `redis` service uses `redis:7-alpine`, named volume `redisdata`, RDB persistence enabled
- [ ] `nginx` service uses official Nginx image, mounts local `nginx.conf`
- [ ] Environment variables loaded from `.env` file via `env_file` directive in `docker-compose.yml`
- [ ] `docker-compose.prod.yml` override defined for production (no source mounts, built image)
- [ ] `restart: unless-stopped` on all services
- [ ] `README` section (or inline comment) explains dev vs prod compose usage

**Technical Notes:**
- Internal Docker network: `conduit_net` (bridge)
- `app` binds on port 3000 (internal only, Nginx proxies)
- `nginx` binds 80 and 443 on host
- For local dev: use self-signed cert or `mkcert`; Certbot runs only on production VPS
- Postgres port 5432 exposed to host in dev only (`127.0.0.1:5432:5432`)
- Redis port 6379 exposed to host in dev only

---

### S-03 — PostgreSQL schema + migrations

**Epic:** E1 — Infrastructure & Foundation
**Points:** 5
**Sprint:** 1
**Dependencies:** S-02

**User Story:**
As a developer, I want the complete database schema applied via versioned migrations, so that every environment (dev, staging, prod) starts from an identical, reproducible schema.

**Acceptance Criteria:**
- [ ] `node-pg-migrate` configured; migrations directory at `db/migrations/`
- [ ] Migration `001_initial_schema.sql` creates all 9 MVP tables (see schema list below)
- [ ] `pgcrypto` extension enabled in migration
- [ ] All indexes from architecture doc created
- [ ] `npm run migrate` runs cleanly on a fresh Postgres 16 instance
- [ ] `npm run migrate:down` rolls back cleanly (down migrations implemented)
- [ ] Seed script `db/seed.ts` inserts: 1 superadmin dashboard_user, 1 teacher user, 1 student, 1 parent user, teacher-student mapping, parent-student mapping (for local dev testing)
- [ ] Application startup calls `migrate` before accepting traffic

**Tables covered:**
- `users` (with pgcrypto encrypted columns: `telegram_user_id`, `chat_id`, `display_name`)
- `students`
- `teacher_student_mappings`
- `parent_student_mappings`
- `onboarding_tokens`
- `message_audit_log`
- `broadcast_log`
- `dashboard_users`
- Phase 2/3 tables (`attendance_records`, `invoices`) created as stubs (schema only, no app logic)

**Technical Notes:**
- Encryption key stored in `APP_ENCRYPTION_KEY` env var; never in DB
- All queries using encrypted columns must use `pgp_sym_encrypt($1, current_setting('app.encryption_key'))` wrapper
- Set `app.encryption_key` in PostgreSQL session via `SET LOCAL` at connection initialization, OR inject it via pgBouncer `server_reset_query` — choose SET LOCAL pattern for simplicity at MVP
- Migration files are SQL (not JS) for auditability

---

### S-04 — Redis setup and session adapter

**Epic:** E1 — Infrastructure & Foundation
**Points:** 2
**Sprint:** 1
**Dependencies:** S-02

**User Story:**
As a developer, I want Redis connected and grammY's session adapter wired up, so that session state is available for all bot handlers from day one.

**Acceptance Criteria:**
- [ ] `ioredis` client initialized with connection retry and error logging
- [ ] grammY `RedisAdapter` configured and wired into bot middleware stack
- [ ] Session type defined: `interface SessionData { studentId?: number; studentName?: string; conversationState?: unknown }`
- [ ] Connection health check at startup: Redis ping → log success/failure
- [ ] `BullMQ` `Queue` and `Worker` instances initialized (broadcast queue — empty worker stub acceptable in Sprint 1)
- [ ] Redis connection failures do not crash the process; error is logged and retried

**Technical Notes:**
- Redis URL from `REDIS_URL` env var (format: `redis://localhost:6379`)
- grammY session middleware added to bot: `bot.use(session({ initial: () => ({}), storage: redisAdapter }))`
- Key prefix for grammY sessions: `grammy:session:` (avoids collision with BullMQ and dashboard session keys)
- Key prefix for dashboard sessions: `dashboard_session:`
- Key prefix for rate limiter: `rate:`
- BullMQ queue name: `broadcast`

---

### S-05 — Nginx + TLS + webhook config

**Epic:** E1 — Infrastructure & Foundation
**Points:** 3
**Sprint:** 1
**Dependencies:** S-02

**User Story:**
As the system operator, I want Nginx to terminate TLS, validate the Telegram webhook secret token header, and proxy requests to the app, so that the bot is reachable from Telegram's servers and malformed requests are rejected before reaching Node.js.

**Acceptance Criteria:**
- [ ] Nginx config routes `/webhook` → `app:3000` with `X-Telegram-Bot-Api-Secret-Token` header validation (return 403 if header absent or wrong)
- [ ] Nginx config routes `/api/` → `app:3000` (no header restriction — auth handled by app)
- [ ] Nginx config routes `/healthz` → `app:3000` passthrough
- [ ] Nginx config serves static files for `/*` from `/var/www/conduit` with `try_files $uri $uri/ /index.html`
- [ ] TLS configured: Let's Encrypt certificate via Certbot (production) or self-signed (dev)
- [ ] HTTP → HTTPS redirect enforced
- [ ] `/healthz` endpoint implemented in app: returns `{ status: 'ok', uptime: <seconds>, ts: <iso> }` with HTTP 200
- [ ] Nginx `client_max_body_size` set to 50MB (media relay requires accepting Telegram's update payload)
- [ ] Rate limiting at Nginx layer: max 10 req/s per IP on `/api/` (protects login endpoint)

**Technical Notes:**
- Webhook secret token: `TELEGRAM_WEBHOOK_SECRET` env var
- Nginx config uses `map` directive for header validation: `if ($http_x_telegram_bot_api_secret_token != $expected_secret) { return 403; }`
- `proxy_read_timeout 30s` on webhook location (Telegram requires 200 within 30s)
- Gzip enabled for API JSON responses
- HSTS header added: `Strict-Transport-Security: max-age=31536000`
- Access logs formatted as JSON for structured log parsing

---

### S-06 — grammY bot bootstrap + webhook handler

**Epic:** E2 — Core Routing Engine
**Points:** 3
**Sprint:** 1
**Dependencies:** S-01, S-02, S-04

**User Story:**
As a developer, I want grammY initialized with a working webhook handler that receives and acknowledges Telegram updates, so that the bot is ready to route messages.

**Acceptance Criteria:**
- [ ] `Bot` instance created with token from `BOT_TOKEN` env var
- [ ] Hono server created; grammY webhook handler mounted at `POST /webhook`
- [ ] `webhookCallback` returns HTTP 200 to Telegram immediately on every valid update
- [ ] Unhandled errors in bot middleware are caught, logged via pino, and do NOT crash the process
- [ ] `bot.start()` called in polling mode for local dev; `webhookCallback` used in production
- [ ] Bot sends a startup message to `ADMIN_CHAT_ID` on successful initialization: "Conduit bot online — @MathMavens_bot"
- [ ] `GET /healthz` returns `{ status: 'ok' }` with 200 regardless of bot state

**Technical Notes:**
- `BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `ADMIN_CHAT_ID` are required env vars; app exits with clear error message if any are missing at startup
- Use `NODE_ENV` to switch between polling (development) and webhook (production) modes
- grammY error handler: `bot.catch((err) => { logger.error({ err: err.error, ctx: err.ctx.update }, 'Bot error') })`
- Hono instance exports from `src/server.ts`; Bot instance exports from `src/bot/index.ts`
- Both share the same process — no separate bot process needed

---

### S-07 — Router / Dispatcher

**Epic:** E2 — Core Routing Engine
**Points:** 5
**Sprint:** 1
**Dependencies:** S-03, S-04, S-06

**User Story:**
As a parent or teacher, I want my messages routed correctly based on my role, so that I always reach the right person without needing to configure anything.

**Acceptance Criteria:**
- [ ] Router identifies sender role by querying `users` table via encrypted `telegram_user_id`
- [ ] Unknown senders receive: "You are not registered. Contact Math Mavens to get your invitation link."
- [ ] `/start` with payload routes to Onboarding Service stub (returns "Onboarding coming soon" in Sprint 1)
- [ ] Parent senders with single active child proceed to Message Relay
- [ ] Parent senders with multiple children and no active session route to Session Manager (inline keyboard — stub in Sprint 1; implemented in S-09)
- [ ] Parent senders with multiple children and active session proceed to Message Relay
- [ ] Teacher senders with a reply context (reply_to_message present) route to Message Relay
- [ ] Teacher senders without reply context receive: "Please reply to a specific parent message to respond."
- [ ] Admin/Superadmin senders (role in users table) route to Admin Service stub (returns "Admin commands coming in Sprint 2")
- [ ] `callback_query` updates (inline keyboard responses) handled for child selection
- [ ] `edited_message` updates are silently ignored with no relay (policy decision: edits not propagated)
- [ ] Router lookup is a single indexed query (no joins on hot path)

**Technical Notes:**
- Role lookup query: `SELECT id, role, is_active FROM users WHERE telegram_user_id = pgp_sym_encrypt($1, ...)` with index on encrypted column (use a deterministic encryption function so index works — pgp_sym_encrypt is deterministic with same passphrase; confirm this is correct for lookup, or use a hash for the lookup index column)
- **Important:** Deterministic encryption via `pgp_sym_encrypt` with same key IS deterministic. Validate this behavior in a test before relying on it. If non-deterministic, add a `telegram_user_id_hash` BYTEA column using `SHA-256(telegram_user_id)` as the lookup key.
- Role is not encrypted (plaintext column) — safe to filter on directly
- Router is a grammY middleware composition, not a monolithic function

---

### S-08 — Message Relay (text + all media types)

**Epic:** E2 — Core Routing Engine
**Points:** 5
**Sprint:** 1
**Dependencies:** S-03, S-04, S-06, S-07

**User Story:**
As a parent, I want to send any type of message (text, photo, voice note, video, document, sticker) to my child's teacher, and as a teacher I want to reply back, all without either party knowing the other's Telegram identity.

**Acceptance Criteria:**
- [ ] `copyMessage` used for all relay — no `forwardMessage` (which exposes sender attribution)
- [ ] Supported incoming message types relayed correctly: `text`, `photo`, `video`, `voice`, `audio`, `document`, `sticker`, `animation`
- [ ] For parent-to-teacher relay: student name header sent first via `sendMessage`, then `copyMessage`
- [ ] Header format: `[Student Name] — Parent:` (plain text, no markdown)
- [ ] For teacher-to-parent relay: `copyMessage` only (no header — teacher identity is abstracted)
- [ ] Teacher reply threading: teacher replies to the header message → bot extracts student context from header text → relays to correct parent
- [ ] Relay latency under 2 seconds for all message types (validated in manual testing with network latency measurement)
- [ ] `message_audit_log` row inserted after each successful relay (async, non-blocking)
- [ ] Failed `copyMessage` calls are logged with error details and retried once after 1-second delay
- [ ] Unsupported message types (polls, locations, contacts) receive: "This message type is not supported."

**Technical Notes:**
- `copyMessage` API: `bot.api.copyMessage(chat_id, from_chat_id, message_id)`
- Audit log insert: `setImmediate(() => auditLogger.logRelay(...))` — ensures it does not block the relay response
- For reply threading: `bot.api.copyMessage(targetChatId, sourceChatId, messageId, { caption: existingCaption })` — do NOT pass `reply_to_message_id` as it would create a broken reference in the target chat
- Teacher reply context extraction: when teacher replies to a header message, the header text contains the student name — parse `[Student Name] — Parent:` pattern to extract student_name → lookup student_id → lookup parent chat_id
- Alternatively (more robust): store a `relay_context` Redis key mapping `(teacher_chat_id, header_message_id)` → `{ student_id, parent_chat_id }` with TTL 8 hours

---

## Sprint 2 — Onboarding + Admin Bot Commands

**Goal:** The bot is operationally usable. Admin can onboard parents and teachers via deep links, manage mappings via bot commands, and send broadcasts. Multi-child parents work correctly.

**Dates:** Week 3–4 (2026-03-17 to 2026-03-28)
**Capacity:** 30 points
**Allocated:** 31 points *(1 point flex — carry S-19 partial if needed)*

**Stories in this sprint:**

| ID | Title | Points |
|----|-------|--------|
| S-09 | Multi-child session selection | 3 |
| S-10 | Teacher reply context (student name header) | 2 |
| S-11 | Media group batching | 3 |
| S-12 | Rate limiter (Redis sliding window) | 3 |
| S-13 | Onboarding flow — deep-link + PDPA consent | 8 |
| S-14 | Token / Invite Manager | 3 |
| S-15 | Admin bot commands — mapping management | 5 |
| S-16 | Admin bot commands — token generation | 2 |
| S-17 | Admin bot commands — broadcast dispatch | 3 |
| S-18 | Superadmin bot commands — user lifecycle | 3 |
| S-19 | Broadcast Queue (BullMQ + throttle) | 5 |
| **Total** | | **34** *(split S-19 across sprints if needed)* |

> Note: Sprint 2 is loaded at 34 points against a 30-point velocity. S-19 (5 pts, Broadcast Queue) can be split: enqueue logic ships in Sprint 2, worker/throttle implementation completes in Sprint 3 (first day). Alternatively, S-11 (media group batching, 3 pts) can defer to Sprint 3 if needed.

**Sprint 2 Definition of Done:**
- [ ] A new parent can complete onboarding end-to-end via deep link (PDPA consent + registration)
- [ ] A new teacher can complete onboarding end-to-end via deep link
- [ ] Multi-child parent can select their active child via inline keyboard and relay messages correctly
- [ ] Admin can generate a token via `/gentoken` and share the deep link
- [ ] Admin can add, remove, and reassign mappings via bot commands
- [ ] Admin can trigger a broadcast to all parents
- [ ] Broadcast respects Telegram rate limits (25 msg/sec)
- [ ] Superadmin can deactivate, reactivate, promote, and demote users
- [ ] Rate limiter prevents 429 errors during any burst scenario

---

### S-09 — Multi-child session selection

**Epic:** E2 — Core Routing Engine
**Points:** 3
**Sprint:** 2
**Dependencies:** S-07, S-08

**User Story:**
As a parent with multiple children enrolled at Math Mavens, I want to be prompted to select which child I am messaging about, so that my messages reach the correct teacher.

**Acceptance Criteria:**
- [ ] On first message from a parent with 2+ active children and no active session, inline keyboard shown with child names as buttons
- [ ] Each button displays student display_name
- [ ] On button press (`callback_query`), session set in Redis: `session:{user_id}` → `{ studentId, studentName }` with TTL 8 hours
- [ ] TTL resets on each subsequent message from parent (sliding window)
- [ ] After selection, relay proceeds for the current message without requiring parent to re-send
- [ ] `/reset` command clears session and prompts re-selection on next message
- [ ] If a parent's single active student changes (mapping updated), stale session is invalidated — check student_id is still active in mapping on each relay

**Technical Notes:**
- grammY `bot.callbackQuery(pattern, handler)` for child selection
- Session stored in grammY session plugin (backed by Redis via S-04)
- Session type: `{ activeStudentId?: number; activeStudentName?: string }`
- On relay: before each relay call, assert `activeStudentId` is still active in `parent_student_mappings` — if not, clear session and re-prompt

---

### S-10 — Teacher reply context (student name header)

**Epic:** E2 — Core Routing Engine
**Points:** 2
**Sprint:** 2
**Dependencies:** S-08

**User Story:**
As a teacher receiving messages from multiple parents, I want each relayed parent message to be preceded by the student's name, so that I always know who I am replying to without maintaining manual context.

**Acceptance Criteria:**
- [ ] Every parent-to-teacher relay sends a header message immediately before the `copyMessage`: `[Wei Ming] — Parent:`
- [ ] Header is a plain `sendMessage` (not copyMessage) so its origin is the bot
- [ ] Teacher's reply is detected by checking `message.reply_to_message` — if it exists, the original message (or its header) provides student context
- [ ] Redis relay context map implemented: on each header send, store `relay_ctx:{teacher_chat_id}:{header_message_id}` → `{ studentId, parentChatId }` TTL 8 hours
- [ ] Teacher reply dispatched by looking up relay context key to find `parentChatId`
- [ ] If relay context key has expired, teacher receives: "This message context has expired. Ask the parent to send a new message."
- [ ] No student name header on teacher-to-parent relay (teacher identity is the secret, not student's)

**Technical Notes:**
- Header message send: `const headerMsg = await bot.api.sendMessage(teacherChatId, '[${studentName}] — Parent:')`
- Store: `redis.set('relay_ctx:${teacherChatId}:${headerMsg.message_id}', JSON.stringify({ studentId, parentChatId }), 'EX', 28800)`
- On teacher reply: `const context = await redis.get('relay_ctx:${teacherChatId}:${replyToMessageId}')`

---

### S-11 — Media group batching

**Epic:** E2 — Core Routing Engine
**Points:** 3
**Sprint:** 2
**Dependencies:** S-08

**User Story:**
As a parent sending multiple photos at once (e.g., photos of a worksheet spread), I want all photos to arrive at the teacher as a single album, not as disconnected individual messages.

**Acceptance Criteria:**
- [ ] Messages with a `media_group_id` are buffered before relay
- [ ] Buffer window: 500ms after first message in a group (Telegram sends all messages in a media group within ~300ms)
- [ ] After buffer window expires, all messages in the group are relayed in order as individual `copyMessage` calls (Telegram does not expose `sendMediaGroup` for relay — each photo is relayed separately but arrives close together)
- [ ] A single audit log entry is created per media group (not per individual photo)
- [ ] Media group header (student name) is sent once before the first photo in the group
- [ ] Buffer implemented using Redis: `media_group:{media_group_id}` → list of message_ids, TTL 2s

**Technical Notes:**
- On each message with `media_group_id`: `RPUSH media_group:{id} {messageId}; EXPIRE media_group:{id} 2`
- If this is the first message in the group, schedule a timeout: `setTimeout(() => flushMediaGroup(mediaGroupId), 500)`
- `flushMediaGroup`: `LRANGE media_group:{id} 0 -1` → relay each message in order → delete key
- Race condition: if timeout fires before all messages in group arrive, remaining messages arrive after the batch. Mitigate by TTL-guarding: do not relay a message_id if it was already flushed.

---

### S-12 — Rate limiter (Redis sliding window)

**Epic:** E2 — Core Routing Engine
**Points:** 3
**Sprint:** 2
**Dependencies:** S-04, S-08

**User Story:**
As the system, I need to ensure that message relay never exceeds Telegram API rate limits, so that the bot is never throttled or banned.

**Acceptance Criteria:**
- [ ] Per-chat limit enforced: max 1 message/second per `target_chat_id` (Telegram hard limit)
- [ ] Global limit enforced: max 25 messages/second across all chats (safety margin; Telegram limit is 30)
- [ ] On limit breach: `checkAndWait()` delays the call for the calculated wait duration (does not reject)
- [ ] Broadcast queue worker consumes `checkAndWait()` before each send to guarantee compliance
- [ ] Rate limiter does not add measurable latency when limits are not being approached (< 1ms overhead)
- [ ] Unit tests for rate limiter logic with mocked Redis

**Technical Notes:**
- Sliding window via Redis: `INCR rate:{chatId}:{windowSecond}; EXPIRE rate:{chatId}:{windowSecond} 2`
- Global limiter: `INCR rate:global:{windowSecond}; EXPIRE rate:global:{windowSecond} 2`
- `checkAndWait(chatId)`: read both counters; if either is at limit, `await sleep(remainingWindowMs)`
- Lua script for atomic INCR+check (prevents race where two concurrent relays both pass the check): `local count = redis.call('INCR', KEYS[1]); redis.call('EXPIRE', KEYS[1], 2); return count`
- Sleep utility: `const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))`

---

### S-13 — Onboarding flow — deep-link + PDPA consent

**Epic:** E2 — Core Routing Engine
**Points:** 8
**Sprint:** 2
**Dependencies:** S-03, S-04, S-06, S-07, S-14

**User Story:**
As a parent or teacher receiving an invitation link from Math Mavens, I want to click `t.me/MathMavens_bot?start=<token>` and complete a guided registration with explicit PDPA consent, so that I am enrolled in the system and my privacy rights are respected.

**Acceptance Criteria:**
- [ ] `/start <token>` command triggers onboarding flow when token payload is present
- [ ] Invalid/expired/used tokens: "This invitation link is invalid or has expired. Contact Math Mavens for a new link." No registration proceeds.
- [ ] Valid token flow for parent:
  - [ ] Display student name the token is for
  - [ ] Present PDPA consent message (exact text from product brief — see Technical Notes)
  - [ ] Await explicit "I Agree" button press (inline keyboard)
  - [ ] "I Decline" or timeout (10 minutes): "Onboarding cancelled. No data has been stored. Contact Math Mavens if you wish to proceed."
  - [ ] On consent: insert `users` row with `pdpa_consent_at = NOW()`; insert `parent_student_mappings` row; mark token `used_at = NOW()`
  - [ ] Send welcome message: "You are now connected. Send any message here and it will be relayed to [StudentName]'s teacher."
- [ ] Valid token flow for teacher:
  - [ ] Display enrollment confirmation
  - [ ] Present PDPA consent (same consent text)
  - [ ] On consent: insert `users` row; insert `teacher_student_mappings` row; mark token used
  - [ ] Send welcome message: "You are now registered. Parents of your students will message you through this bot. Reply to any message to respond to the correct parent."
- [ ] Re-registration guard: if `telegram_user_id` already exists in `users` and token matches their mapping, send "You are already registered." without creating duplicate records
- [ ] All insertions are wrapped in a database transaction (token mark, user insert, mapping insert — atomic)
- [ ] `grammY conversations` plugin used to manage multi-step flow state

**Technical Notes:**
- PDPA consent message text:
  > "Math Mavens collects your Telegram user ID and display name to facilitate teacher-parent communication. Your data will not be shared with third parties and will be deleted upon request. Do you consent to proceed?"
- Inline keyboard: `[✓ I Agree]` | `[✗ I Decline]`
- grammY `conversations` plugin: `createConversation` wraps the multi-step consent flow
- Transaction: `await pool.query('BEGIN'); try { ...inserts... await pool.query('COMMIT') } catch { await pool.query('ROLLBACK') }`
- Edge case: user clicks "I Agree" multiple times (double-tap) — idempotency check: if `users` row already exists with this `telegram_user_id`, update `pdpa_consent_at` without re-inserting

---

### S-14 — Token / Invite Manager

**Epic:** E2 — Core Routing Engine
**Points:** 3
**Sprint:** 2
**Dependencies:** S-03

**User Story:**
As an admin, I want to generate single-use deep-link tokens for new parent or teacher registrations, so that I can control who joins the system and track which invitations have been used.

**Acceptance Criteria:**
- [ ] `generateToken(params)` creates a cryptographically random 32-character base64url token
- [ ] Token stored in `onboarding_tokens` with `expires_at = NOW() + 72 hours`
- [ ] `validateToken(token)` returns the token record if valid (exists, not expired, not used)
- [ ] `markTokenUsed(tokenId, userId)` sets `used_at = NOW()`, `used_by = userId`
- [ ] Deep-link URL format: `https://t.me/MathMavens_bot?start=<token>` (BOT_USERNAME from env)
- [ ] Token payload fits within Telegram's 64-character deep-link limit (32-char token = safe)
- [ ] Expired tokens are cleaned up by a daily cron (soft-delete via `expires_at` filter — no hard delete in MVP, just exclude from validation)
- [ ] Unit tests: generate token, validate (valid), validate (expired), validate (used), mark used

**Technical Notes:**
- Token generation: `crypto.randomBytes(24).toString('base64url')` → 32 chars
- `base64url` is URL-safe by definition (no `+`, `/`, `=` characters)
- `BOT_USERNAME` env var: `MathMavens_bot`
- Deep link: `https://t.me/${process.env.BOT_USERNAME}?start=${token}`

---

### S-15 — Admin bot commands — mapping management

**Epic:** E3 — Admin/Superadmin Bot Commands
**Points:** 5
**Sprint:** 2
**Dependencies:** S-03, S-06, S-07, S-14

**User Story:**
As an admin, I want bot commands to manage student-teacher-parent mappings from my phone, so that I can make quick operational changes without needing to open the web dashboard.

**Acceptance Criteria:**
- [ ] Authorization middleware: all admin commands check `role IN ('admin', 'superadmin')` before executing; unauthorized callers receive "You don't have permission to use this command."
- [ ] `/addmapping <student_name> <parent_telegram_id> <teacher_telegram_id>` — creates student record (if not exists), parent_student_mapping, teacher_student_mapping; returns confirmation with deep-link tokens for both
- [ ] `/removemapping <student_id>` — soft-deletes teacher_student_mapping and parent_student_mapping (sets `is_active = false, deactivated_at = NOW()`); parent and teacher receive: "Your mapping for [student_name] has been deactivated."
- [ ] `/reassign <student_id> <new_teacher_id>` — deactivates current teacher_student_mapping; creates new one; notifies old teacher and new teacher
- [ ] `/listmappings` — returns paginated list (20 per page) of active mappings: `StudentName | ParentID | TeacherID | Active Since`; inline keyboard for pagination
- [ ] `/report message_volume` — generates CSV of message counts by student for the last 7 days; sends as document
- [ ] All commands return structured confirmation messages; destructive commands require confirmation step ("Reply YES to confirm")
- [ ] Admin audit log entries created for each state-changing command

**Technical Notes:**
- Authorization middleware: `adminGuard` function checks `ctx.session` or DB for role; can also check `users.role` in DB for the `chat_id`
- All state-changing commands write to `message_audit_log` with direction = 'admin_action' (add to direction CHECK constraint in schema)
- `/listmappings` pagination: grammY inline keyboard with `page:N` callback data
- `/report` CSV generation: use built-in `csv` formatting in Node.js (no library needed for simple tabular data)
- Telegram document send: `bot.api.sendDocument(chatId, new InputFile(Buffer.from(csvString), 'mappings_report.csv'))`

---

### S-16 — Admin bot commands — token generation

**Epic:** E3 — Admin/Superadmin Bot Commands
**Points:** 2
**Sprint:** 2
**Dependencies:** S-14, S-15

**User Story:**
As an admin, I want to generate onboarding deep-link tokens from the bot, so that I can send invitation links to new parents and teachers directly from my phone.

**Acceptance Criteria:**
- [ ] `/gentoken parent <student_id>` — generates a parent onboarding token for the given student; replies with copyable deep-link URL
- [ ] `/gentoken teacher <student_id>` — generates a teacher onboarding token; replies with copyable deep-link URL
- [ ] Token expiry shown in confirmation: "This link expires in 72 hours."
- [ ] If `student_id` does not exist, returns: "Student not found."
- [ ] Generated token and deep link logged in admin audit

**Technical Notes:**
- Output format: `t.me/MathMavens_bot?start=<token>` as plain text so it is copyable and tappable
- No HTML parse mode needed — plain URL is fine
- Student lookup: `SELECT name FROM students WHERE id = $1 AND is_active = true`

---

### S-17 — Admin bot commands — broadcast dispatch

**Epic:** E3 — Admin/Superadmin Bot Commands
**Points:** 3
**Sprint:** 2
**Dependencies:** S-12, S-15, S-19

**User Story:**
As an admin, I want to send broadcast announcements to all parents (or a cohort) via a bot command, so that I can push important updates from my phone when I am not at a computer.

**Acceptance Criteria:**
- [ ] `/broadcast all <message>` — enqueues broadcast to all active parents; responds: "Broadcast queued for <N> parents."
- [ ] `/broadcast student <student_id> <message>` — sends to parent(s) of a specific student
- [ ] Broadcast message prepended with `[Math Mavens Announcement]\n\n` prefix
- [ ] Admin receives completion report via bot message when all sends complete: "Broadcast complete: <delivered>/<total> delivered."
- [ ] Broadcast logged in `broadcast_log` table
- [ ] Broadcast throughput complies with rate limiter (max 25/sec via S-12 / S-19)
- [ ] Admin must confirm before broadcast fires: "You are about to send to <N> parents. Reply YES to confirm."

**Technical Notes:**
- `/broadcast all` scope resolution: `SELECT chat_id FROM users WHERE role = 'parent' AND is_active = true AND pdpa_consent_at IS NOT NULL`
- Decrypt chat_ids before sending (required for `copyMessage` / `sendMessage`)
- Each parent's `sendMessage` is a separate BullMQ job; jobs have concurrency capped at 25 by the worker's `concurrency` setting

---

### S-18 — Superadmin bot commands — user lifecycle

**Epic:** E3 — Admin/Superadmin Bot Commands
**Points:** 3
**Sprint:** 2
**Dependencies:** S-15

**User Story:**
As a superadmin, I want to deactivate, reactivate, promote, and demote users from the bot, so that I can manage the team and respond to incidents from anywhere.

**Acceptance Criteria:**
- [ ] Superadmin guard: commands in this story require `role = 'superadmin'`; admin users receive "This command requires superadmin access."
- [ ] `/deactivate <user_id>` — sets `users.is_active = false, deactivated_at = NOW(), deactivated_by = callerId`; deactivated user's subsequent messages receive: "Your account has been deactivated. Contact Math Mavens for assistance."
- [ ] `/reactivate <user_id>` — sets `users.is_active = true, deactivated_at = NULL`; user resumes normal messaging
- [ ] `/promote <user_id>` — sets `users.role = 'admin'` for a non-admin user
- [ ] `/demote <user_id>` — sets `users.role` back to previous non-admin role (store previous role, or default to 'teacher' if unclear)
- [ ] `/audit` (via bot) — returns last 20 audit entries as formatted text; superadmin can request more via inline keyboard
- [ ] `/system_status` — returns: active mappings count, today's message relay count, Redis ping latency, Postgres connection pool status, bot uptime
- [ ] All lifecycle changes logged in `message_audit_log` with appropriate direction tag
- [ ] Confirmation step required for `/deactivate` and `/demote`

**Technical Notes:**
- User ID in commands refers to `users.id` (internal integer), not Telegram user ID — prevents accidental PII exposure in command args
- `/system_status` data: `SELECT COUNT(*) FROM teacher_student_mappings WHERE is_active = true` + Redis PING + `pool.totalCount / pool.idleCount`
- Demote: add `previous_role VARCHAR(20)` to `users` or simply reset to 'teacher' (simpler for MVP)

---

### S-19 — Broadcast Queue (BullMQ + throttle)

**Epic:** E2 — Core Routing Engine
**Points:** 5
**Sprint:** 2
**Dependencies:** S-04, S-12

**User Story:**
As the system, I need a reliable, throttled job queue for broadcast message delivery, so that 500 parents can be reached within 30 seconds without exceeding Telegram API rate limits.

**Acceptance Criteria:**
- [ ] BullMQ `Queue` named `broadcast` initialized on Redis
- [ ] BullMQ `Worker` processes `broadcast:send` jobs with concurrency = 25
- [ ] Each job payload: `{ broadcastLogId, targetChatId, messageText }`
- [ ] Worker calls `checkAndWait(targetChatId)` before each `sendMessage`
- [ ] Worker retries failed jobs up to 3 times with exponential backoff (1s, 4s, 16s)
- [ ] After all jobs in a broadcast complete, worker updates `broadcast_log.completed_at` and sends admin notification via bot
- [ ] 500 parents can be fully delivered within 30 seconds at 25 msg/sec (validated via load test or manual calculation)
- [ ] Dead-letter queue for jobs that fail all 3 retries; admin notified of failed deliveries
- [ ] `broadcast_log.delivered_count` and `failed_count` updated atomically on each job completion

**Technical Notes:**
- BullMQ v5 API: `new Queue('broadcast', { connection: redis })`, `new Worker('broadcast', processor, { connection: redis, concurrency: 25 })`
- Job processor: `async (job) => { await checkAndWait(job.data.targetChatId); await bot.api.sendMessage(job.data.targetChatId, job.data.messageText); }`
- Broadcast log update: use Redis INCR for in-progress counters, flush to Postgres on completion
- `BRPOPLPUSH` or BullMQ's built-in completion events for admin notification trigger

---

## Sprint 3 — Dashboard Backend (REST API)

**Goal:** Complete REST API powering the web dashboard. All admin and superadmin operations are available via authenticated HTTP endpoints. Dashboard authentication works.

**Dates:** Week 5–6 (2026-03-31 to 2026-04-11)
**Capacity:** 30 points
**Allocated:** 30 points

**Stories in this sprint:**

| ID | Title | Points |
|----|-------|--------|
| S-20 | Audit Logger | 3 |
| S-21 | Web Auth Service (login, logout, session) | 5 |
| S-22 | REST API — students CRUD | 3 |
| S-23 | REST API — mappings CRUD | 3 |
| S-24 | REST API — tokens CRUD + deep-link gen | 3 |
| S-25 | REST API — broadcast endpoint | 3 |
| S-26 | REST API — users management (superadmin) | 3 |
| S-27 | REST API — audit log endpoint (superadmin) | 2 |
| S-28 | REST API — system status endpoint | 2 |
| S-29 | Phase 2/3 stubs (AI Gateway, Payment GW) | 1 |
| **Total** | | **28** |

> 2 points slack in Sprint 3 absorbs any S-19 overflow from Sprint 2.

**Sprint 3 Definition of Done:**
- [ ] `POST /api/v1/auth/login` and `POST /api/v1/auth/logout` work correctly
- [ ] All CRUD endpoints return proper status codes and paginated responses
- [ ] Session middleware protects all `/api/v1/*` endpoints except login
- [ ] Role-based access enforced: admin endpoints accessible by admin and superadmin; superadmin-only endpoints return 403 for admin
- [ ] Zod validation on all request bodies; 422 returned for invalid input
- [ ] All endpoints covered by integration tests (vitest + supertest)
- [ ] AI Gateway and Payment Gateway stub modules exist with no-op implementations

---

### S-20 — Audit Logger

**Epic:** E2 — Core Routing Engine
**Points:** 3
**Sprint:** 3
**Dependencies:** S-03

**User Story:**
As a superadmin, I want every message relay and admin action to be recorded in an audit log, so that I can investigate incidents and demonstrate PDPA compliance.

**Acceptance Criteria:**
- [ ] `AuditLogger` class with `logRelay(params: RelayAuditParams): void` method (fire-and-forget, no await on relay path)
- [ ] `logAdminAction(params: AdminAuditParams): void` method for admin command executions
- [ ] `RelayAuditParams`: `{ sourceUserId, targetUserId, studentId, direction, messageType, relayedMessageId }`
- [ ] `AdminAuditParams`: `{ adminUserId, action, targetUserId?, studentId?, notes? }`
- [ ] Message content is NEVER logged (enforced via TypeScript type — no `messageText` field in either params type)
- [ ] Audit log inserts are wrapped in try/catch; errors are logged via pino but do NOT propagate to callers
- [ ] `message_audit_log` table used for relay logs; broadcast_log used for broadcast events
- [ ] Unit tests: logRelay with valid params, logRelay with DB error (assert no exception thrown to caller)

**Technical Notes:**
- Relay path: `setImmediate(() => auditLogger.logRelay(params))` — delays execution until after current event loop tick
- Admin actions: can be awaited since they are not on the latency-critical relay path
- Direction enum: `'parent_to_teacher' | 'teacher_to_parent' | 'ai_to_parent' | 'admin_action'`
- Add `'admin_action'` to the `direction` CHECK constraint via migration (additive, non-breaking)

---

### S-21 — Web Auth Service (login, logout, session)

**Epic:** E4 — Dashboard Backend (REST API)
**Points:** 5
**Sprint:** 3
**Dependencies:** S-03, S-04

**User Story:**
As an admin or superadmin, I want to log into the web dashboard with my email and password, so that I can access operational tools securely from a browser.

**Acceptance Criteria:**
- [ ] `POST /api/v1/auth/login` accepts `{ email, password }` body; validates with Zod
- [ ] On valid credentials: create Redis session `dashboard_session:{uuid}` → `{ userId, role, email, displayName }` TTL 86400s; set httpOnly + Secure + SameSite=Strict cookie `session=<uuid>`; return `{ id, email, role, displayName }`
- [ ] On invalid credentials: return HTTP 401 `{ error: 'Invalid credentials' }` — no distinction between wrong email and wrong password
- [ ] Account lockout: 5 consecutive failed logins → Redis key `lockout:{email}` TTL 900s (15 min); subsequent attempts return HTTP 429 `{ error: 'Account locked. Try again in 15 minutes.' }`
- [ ] `POST /api/v1/auth/logout` deletes Redis session key; expires cookie; returns HTTP 200
- [ ] `GET /api/v1/auth/me` returns current session user info or HTTP 401 if not authenticated
- [ ] Session middleware `requireAuth` reads `session` cookie → Redis lookup → attaches `req.dashboardUser` to Hono context; returns 401 if session not found
- [ ] `requireSuperadmin` middleware wraps `requireAuth` and additionally checks `role === 'superadmin'`; returns 403 if role is admin
- [ ] Seed script creates initial superadmin account: `admin@mathm avens.sg` / `ChangeMe123!` (forced change on first login — deferred to Phase 2; note in README)
- [ ] Integration tests: login success, login failure, lockout after 5 attempts, logout, /me authenticated, /me unauthenticated

**Technical Notes:**
- bcrypt comparison: `bcrypt.compare(plaintext, hash)` — async, non-blocking
- Session UUID: `crypto.randomUUID()` (Node.js 14.17+ native)
- Cookie config: `Set-Cookie: session=<uuid>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
- Hono middleware pattern: `const requireAuth: MiddlewareHandler = async (c, next) => { const sessionId = getCookie(c, 'session'); const session = await redis.get('dashboard_session:${sessionId}'); if (!session) return c.json({ error: 'Unauthorized' }, 401); c.set('dashboardUser', JSON.parse(session)); await next(); }`
- Sliding TTL: `requireAuth` middleware calls `redis.expire('dashboard_session:${sessionId}', 86400)` to extend TTL on every authenticated request

---

### S-22 — REST API — students CRUD

**Epic:** E4 — Dashboard Backend (REST API)
**Points:** 3
**Sprint:** 3
**Dependencies:** S-21, S-03

**User Story:**
As an admin, I want to create, view, update, and deactivate student records via the REST API, so that the dashboard can display and manage the student roster.

**Acceptance Criteria:**
- [ ] `GET /api/v1/students` — paginated list; query params: `page`, `pageSize` (default 20), `search` (name filter), `active` (boolean filter); returns `{ data: Student[], total, page, pageSize }`
- [ ] `GET /api/v1/students/:id` — single student with active mappings (teacher name, parent name); 404 if not found
- [ ] `POST /api/v1/students` — create student; body: `{ name, grade? }`; returns 201 with created record
- [ ] `PATCH /api/v1/students/:id` — update `name` and/or `grade`; returns updated record; 404 if not found
- [ ] `DELETE /api/v1/students/:id` — soft-delete (`is_active = false`); also deactivates all active mappings for this student; returns 204
- [ ] All endpoints require `requireAuth`; `DELETE` requires `requireSuperadmin`
- [ ] Zod schema validation on `POST` and `PATCH` bodies; 422 on invalid input
- [ ] Integration tests for each endpoint

**Technical Notes:**
- Pagination: `LIMIT $pageSize OFFSET ($page - 1) * $pageSize`; return `{ total: COUNT(*) OVER() }` via window function or separate count query
- Student response DTO: `{ id, name, grade, enrolledAt, isActive, teacher?: { name }, parents?: [{ name, relationship }] }`
- `DELETE` cascade: `UPDATE teacher_student_mappings SET is_active = false WHERE student_id = $1; UPDATE parent_student_mappings SET is_active = false WHERE student_id = $1`

---

### S-23 — REST API — mappings CRUD

**Epic:** E4 — Dashboard Backend (REST API)
**Points:** 3
**Sprint:** 3
**Dependencies:** S-21, S-22

**User Story:**
As an admin, I want to create, view, and manage teacher-student-parent mappings via the REST API, so that the dashboard provides full mapping lifecycle management.

**Acceptance Criteria:**
- [ ] `GET /api/v1/mappings` — paginated list of active mappings; filterable by `studentId`, `teacherId`, `parentId`
- [ ] `POST /api/v1/mappings/teacher` — create teacher-student mapping; body: `{ teacherUserId, studentId }`; enforces one active teacher per student (returns 409 if student already has active teacher)
- [ ] `POST /api/v1/mappings/parent` — create parent-student mapping; body: `{ parentUserId, studentId, relationship? }`
- [ ] `DELETE /api/v1/mappings/teacher/:id` — soft-delete teacher-student mapping
- [ ] `DELETE /api/v1/mappings/parent/:id` — soft-delete parent-student mapping
- [ ] `POST /api/v1/mappings/reassign` — deactivate existing teacher mapping and create new one; body: `{ studentId, newTeacherUserId }`; atomic transaction
- [ ] All state-changing endpoints log to audit via `AuditLogger.logAdminAction()`
- [ ] Integration tests including 409 conflict on duplicate teacher assignment

**Technical Notes:**
- One active teacher per student constraint: `SELECT 1 FROM teacher_student_mappings WHERE student_id = $1 AND is_active = true` — if row exists, return 409
- Reassign transaction: `BEGIN; UPDATE tsm SET is_active=false WHERE student_id=$1 AND is_active=true; INSERT INTO tsm ...; COMMIT`

---

### S-24 — REST API — tokens CRUD + deep-link gen

**Epic:** E4 — Dashboard Backend (REST API)
**Points:** 3
**Sprint:** 3
**Dependencies:** S-14, S-21

**User Story:**
As an admin, I want to generate, list, and manage onboarding tokens via the REST API, so that the dashboard can display a token management page with copyable deep links.

**Acceptance Criteria:**
- [ ] `GET /api/v1/tokens` — list tokens with filters: `status` (pending/used/expired), `studentId`; paginated
- [ ] `POST /api/v1/tokens` — generate token; body: `{ role, studentId, teacherUserId? }`; returns `{ token, deepLinkUrl, expiresAt }`
- [ ] `DELETE /api/v1/tokens/:id` — invalidate (expire) an unused token by setting `expires_at = NOW() - 1 second`
- [ ] Token status computed field: `pending` (unused + not expired), `used` (used_at IS NOT NULL), `expired` (expires_at < NOW() AND used_at IS NULL)
- [ ] Deep link URL returned in response: `https://t.me/${BOT_USERNAME}?start=${token}`
- [ ] Integration tests: generate token, list by status, delete unused token, attempt delete of used token (should 409)

---

### S-25 — REST API — broadcast endpoint

**Epic:** E4 — Dashboard Backend (REST API)
**Points:** 3
**Sprint:** 3
**Dependencies:** S-19, S-21

**User Story:**
As an admin, I want to trigger and monitor broadcasts via the REST API, so that the dashboard broadcast composer can send and track announcements.

**Acceptance Criteria:**
- [ ] `POST /api/v1/broadcasts` — enqueue broadcast; body: `{ scope: 'all' | 'student', studentId?: number, messageText: string }`; returns `{ broadcastLogId, targetCount, status: 'queued' }`
- [ ] `GET /api/v1/broadcasts` — list broadcast history; paginated; returns `{ id, scope, messagePreview, targetCount, deliveredCount, failedCount, createdAt, completedAt }`
- [ ] `GET /api/v1/broadcasts/:id` — single broadcast status (live polling for dashboard)
- [ ] `messageText` max length: 4096 characters (Telegram message limit)
- [ ] Zod validation; 422 on invalid scope/studentId combination
- [ ] Integration tests: enqueue broadcast, get status, list history

---

### S-26 — REST API — users management (superadmin)

**Epic:** E4 — Dashboard Backend (REST API)
**Points:** 3
**Sprint:** 3
**Dependencies:** S-21

**User Story:**
As a superadmin, I want to list, deactivate, promote, and demote Telegram users and dashboard users via the REST API, so that the user management pages in the dashboard are fully functional.

**Acceptance Criteria:**
**Telegram users (`/api/v1/users/telegram`):**
- [ ] `GET /api/v1/users/telegram` — paginated list; filter by `role`, `isActive`
- [ ] `PATCH /api/v1/users/telegram/:id/deactivate` — set `is_active = false`
- [ ] `PATCH /api/v1/users/telegram/:id/reactivate` — set `is_active = true`
- [ ] `PATCH /api/v1/users/telegram/:id/promote` — set `role = 'admin'`
- [ ] `PATCH /api/v1/users/telegram/:id/demote` — set `role = 'teacher'` (or previous role)

**Dashboard users (`/api/v1/users/dashboard`):**
- [ ] `GET /api/v1/users/dashboard` — list all dashboard users (superadmin only)
- [ ] `POST /api/v1/users/dashboard` — create dashboard user; body: `{ email, password, role, displayName }`; bcrypt hash password before insert
- [ ] `PATCH /api/v1/users/dashboard/:id/deactivate` — set `is_active = false`

**All endpoints require `requireSuperadmin`.**

**Technical Notes:**
- Telegram user response DTO excludes encrypted fields — return `id`, `role`, `registeredAt`, `isActive`, display name (decrypted)
- Password for new dashboard user: bcrypt with cost 12: `bcrypt.hash(password, 12)`

---

### S-27 — REST API — audit log endpoint (superadmin)

**Epic:** E4 — Dashboard Backend (REST API)
**Points:** 2
**Sprint:** 3
**Dependencies:** S-20, S-21

**User Story:**
As a superadmin, I want to search and page through the audit log via the REST API, so that the audit log page in the dashboard provides full visibility into system activity.

**Acceptance Criteria:**
- [ ] `GET /api/v1/audit` — paginated audit log; query params: `studentId`, `userId`, `direction`, `fromDate`, `toDate`, `page`, `pageSize`
- [ ] Returns `{ data: AuditEntry[], total, page, pageSize }`
- [ ] AuditEntry DTO: `{ id, direction, messageType, sourceUserId, targetUserId, studentId, createdAt }` — no message content fields
- [ ] Date range filter defaults to last 7 days if not specified
- [ ] Requires `requireSuperadmin`
- [ ] Query uses indexes: `idx_audit_created`, `idx_audit_student`, `idx_audit_source`

---

### S-28 — REST API — system status endpoint

**Epic:** E4 — Dashboard Backend (REST API)
**Points:** 2
**Sprint:** 3
**Dependencies:** S-21

**User Story:**
As a superadmin, I want a system status API endpoint, so that the dashboard system health page displays real-time infrastructure metrics.

**Acceptance Criteria:**
- [ ] `GET /api/v1/system/status` — returns system health snapshot; requires `requireSuperadmin`
- [ ] Response: `{ status: 'ok' | 'degraded', uptime: seconds, database: { connected, poolSize, idleConnections }, redis: { connected, pingMs }, bot: { connected, username }, todayRelayCount: number, activeMappingCount: number, broadcastQueueDepth: number }`
- [ ] `database.connected = false` and `redis.connected = false` set status to `'degraded'`
- [ ] `GET /healthz` (no auth, existing endpoint) updated to proxy a subset of this data
- [ ] Response cached for 30 seconds to prevent hammering on page refresh

**Technical Notes:**
- Redis ping: `const start = Date.now(); await redis.ping(); pingMs = Date.now() - start`
- Pool stats: `pool.totalCount`, `pool.idleCount` from `pg` Pool instance
- Today's relay count: `SELECT COUNT(*) FROM message_audit_log WHERE created_at >= CURRENT_DATE`
- Cache: simple `{ data, cachedAt }` in-memory object; invalidate if `Date.now() - cachedAt > 30000`

---

### S-29 — Phase 2/3 stubs (AI Gateway, Payment Gateway)

**Epic:** E4 — Dashboard Backend (REST API)
**Points:** 1
**Sprint:** 3
**Dependencies:** S-06

**User Story:**
As a developer, I want Phase 2 and Phase 3 integration points to exist as typed stub modules, so that future feature branches have clear integration points without affecting MVP functionality.

**Acceptance Criteria:**
- [ ] `src/services/ai-gateway.ts` exports `async function aiTriage(ctx): Promise<AiTriageResult>` — always returns `{ action: 'RELAY' }` in MVP
- [ ] `AiTriageResult` type: `{ action: 'RELAY' } | { action: 'AI_RESOLVED'; response: string }`
- [ ] `src/services/payment-gateway.ts` exports no-op stubs for `createInvoice`, `getPaymentStatus`
- [ ] Stripe webhook endpoint `POST /stripe/webhook` returns HTTP 200 (stub)
- [ ] Both modules have JSDoc comments: `// Phase 2 — OpenClaw integration` and `// Phase 3 — Stripe/PayNow integration`
- [ ] No Stripe or OpenClaw SDK installed; stubs use only TypeScript types

---

## Sprint 4 — Dashboard Frontend

**Goal:** The web dashboard is fully functional for admin and superadmin operations. An admin can log in and manage all day-to-day operations from the browser. Superadmin can access all management and audit pages.

**Dates:** Week 7–8 (2026-04-14 to 2026-04-25)
**Capacity:** 30 points
**Allocated:** 28 points

**Stories in this sprint:**

| ID | Title | Points |
|----|-------|--------|
| S-30 | Dashboard scaffold + routing + auth shell | 3 |
| S-31 | Dashboard login page | 2 |
| S-32 | Dashboard home / stats page | 3 |
| S-33 | Students, mappings, and tokens pages | 8 |
| S-34 | Broadcast composer page | 5 |
| S-35 | Superadmin pages (users, audit, system) | 5 |
| **Total** | | **26** |

> 4 points slack in Sprint 4 absorbs UX polish and any frontend integration surprises.

**Sprint 4 Definition of Done:**
- [ ] Admin can log in, see the dashboard home, navigate all pages, and log out
- [ ] Admin can add/edit/deactivate students, create/manage mappings, generate tokens with copyable deep links
- [ ] Admin can compose and send a broadcast; broadcast history page shows delivery stats
- [ ] Superadmin can view user management, audit log, and system status pages
- [ ] All pages handle empty states, loading states, and error states correctly
- [ ] Dashboard is accessible at `https://<domain>/` and redirects to `/login` if unauthenticated
- [ ] Tailwind + shadcn/ui design system applied consistently per frontend design doc

---

### S-30 — Dashboard scaffold + routing + auth shell

**Epic:** E5 — Dashboard Frontend
**Points:** 3
**Sprint:** 4
**Dependencies:** S-21

**User Story:**
As a developer, I want the React SPA scaffold set up with routing, auth context, and the sidebar/layout shell, so that all subsequent dashboard pages can be built as leaf components.

**Acceptance Criteria:**
- [ ] Vite + React 18 + TypeScript project initialized in `packages/frontend/`
- [ ] Tailwind CSS configured with Conduit design tokens from frontend design doc (primary blue, accent amber, neutral gray palettes)
- [ ] shadcn/ui initialized with Conduit theme overrides
- [ ] TanStack Query (React Query v5) configured with `QueryClient` at app root
- [ ] React Router v6 with routes: `/login`, `/`, `/dashboard`, `/students`, `/mappings`, `/tokens`, `/broadcasts`, `/users`, `/audit`, `/settings/team`, `/settings/system`
- [ ] `AuthContext` provides `{ user, isLoading, login, logout }` backed by `GET /api/v1/auth/me`
- [ ] `ProtectedRoute` component redirects to `/login` if not authenticated
- [ ] `SuperadminRoute` component redirects to `/dashboard` if role is not `superadmin`
- [ ] Sidebar navigation renders all routes; superadmin-only items hidden for admin role
- [ ] Top bar shows logged-in user display name and logout button
- [ ] Responsive layout: sidebar collapsible on mobile

**Technical Notes:**
- Tailwind config: extend `colors` with all `--color-primary-*` and `--color-accent-*` tokens from the design doc
- shadcn/ui install: `pnpm dlx shadcn@latest init` with slate base (then override to Conduit Blue)
- TanStack Query: `staleTime: 30_000` default; `refetchOnWindowFocus: false` for admin tools
- Auth check on app load: query `GET /api/v1/auth/me`; on 401 → redirect to login; on success → populate AuthContext

---

### S-31 — Dashboard login page

**Epic:** E5 — Dashboard Frontend
**Points:** 2
**Sprint:** 4
**Dependencies:** S-30, S-21

**User Story:**
As an admin or superadmin, I want a clean login page, so that I can authenticate to access the dashboard.

**Acceptance Criteria:**
- [ ] Login form with email and password fields using react-hook-form + Zod validation
- [ ] Client-side validation: email format, password min 8 chars
- [ ] On submit: `POST /api/v1/auth/login`; on success → redirect to `/dashboard`
- [ ] On 401: display "Invalid email or password."
- [ ] On 429 (lockout): display "Account locked. Try again in 15 minutes."
- [ ] Loading state: submit button shows spinner, inputs disabled during request
- [ ] Conduit logo/wordmark shown above form
- [ ] Page title: "Conduit — Sign in"
- [ ] `/login` redirects to `/dashboard` if already authenticated (no double-login)

**Technical Notes:**
- Use shadcn/ui `Card`, `Input`, `Button`, `Label`, `Form` components
- Error display: shadcn/ui `Alert` component with destructive variant
- Conduit logo: SVG inlined or imported as asset (design doc specifies wordmark style)

---

### S-32 — Dashboard home / stats page

**Epic:** E5 — Dashboard Frontend
**Points:** 3
**Sprint:** 4
**Dependencies:** S-30, S-28

**User Story:**
As an admin, I want a dashboard home page showing key metrics at a glance, so that I can quickly assess system health and activity when I open the dashboard.

**Acceptance Criteria:**
- [ ] 4 stat cards: Active Mappings, Today's Messages Relayed, Active Parents, Active Teachers
- [ ] Recent broadcasts widget: last 3 broadcasts with delivery rate badge
- [ ] System health indicator: green "Operational" / amber "Degraded" based on `GET /api/v1/system/status` (admin sees simplified health; superadmin sees full metrics)
- [ ] Stats auto-refresh every 60 seconds
- [ ] Skeleton loading state while data fetches
- [ ] Empty state: "No data yet — get started by adding students and creating mappings."
- [ ] Quick action buttons: "Add Student", "Generate Token", "Send Broadcast"

**Technical Notes:**
- Data sources: `GET /api/v1/system/status` for counts; `GET /api/v1/broadcasts?pageSize=3` for recent broadcasts
- TanStack Query `refetchInterval: 60_000` on status query
- shadcn/ui `Card`, `Badge`, `Skeleton` components
- Stat card component: reusable `<StatCard title icon value description />`

---

### S-33 — Students, mappings, and tokens pages

**Epic:** E5 — Dashboard Frontend
**Points:** 8
**Sprint:** 4
**Dependencies:** S-30, S-22, S-23, S-24

**User Story:**
As an admin, I want fully functional students, mappings, and tokens pages, so that I can manage the core operational data of the center from the web dashboard.

**Acceptance Criteria:**

**Students page (`/students`):**
- [ ] Searchable, paginated table with columns: Name, Grade, Teacher, Parent(s), Status, Actions
- [ ] "Add Student" button opens a Dialog with form (name, grade)
- [ ] Inline "Edit" opens the same Dialog populated with current values
- [ ] "Deactivate" shows confirmation Dialog before soft-deleting (superadmin only)
- [ ] Status badge: green "Active" / gray "Inactive"
- [ ] Empty state: "No students yet. Add your first student to get started."

**Mappings page (`/mappings`):**
- [ ] Table with columns: Student, Teacher, Parent, Relationship, Assigned Date, Status, Actions
- [ ] "Assign Teacher" button: dropdown of active teachers for a selected student
- [ ] "Add Parent" button: dropdown of active parents for a selected student
- [ ] "Reassign Teacher" action per row with confirmation
- [ ] "Remove" action (soft-delete) with confirmation
- [ ] Filter: by teacher, by student

**Tokens page (`/tokens`):**
- [ ] Table with columns: Role, Student, Created, Expires, Status (Pending / Used / Expired), Deep Link, Actions
- [ ] "Generate Token" button opens Dialog: select role (Parent/Teacher) and student
- [ ] "Copy Link" button copies `t.me/...` URL to clipboard; shows "Copied!" tooltip
- [ ] "Invalidate" action for pending tokens
- [ ] Status tabs: All / Pending / Used / Expired

**All pages:**
- [ ] Loading skeletons during initial fetch
- [ ] Error toast (shadcn/ui `toast`) on API failures with retry option
- [ ] Optimistic updates where appropriate (add student appears immediately)
- [ ] All mutations trigger TanStack Query cache invalidation

**Technical Notes:**
- shadcn/ui `Table`, `Dialog`, `Select`, `Badge`, `Tabs`, `Tooltip`, `Toast` components
- TanStack Query mutations: `useMutation` with `onSuccess: () => queryClient.invalidateQueries(['students'])`
- Clipboard API: `navigator.clipboard.writeText(deepLinkUrl)`
- Form validation: Zod schemas match backend Zod schemas (consider extracting to `packages/shared/`)

---

### S-34 — Broadcast composer page

**Epic:** E5 — Dashboard Frontend
**Points:** 5
**Sprint:** 4
**Dependencies:** S-30, S-25

**User Story:**
As an admin, I want a broadcast composer page where I can write and send announcements, and view a history of past broadcasts with delivery statistics.

**Acceptance Criteria:**
- [ ] Page split: left panel = Broadcast History, right panel = Composer
- [ ] Composer: `<Textarea>` for message (4096 char limit with live counter); scope selector (All Parents / Specific Student); recipient count preview ("This will send to N parents")
- [ ] "Preview" button shows how message will appear (with `[Math Mavens Announcement]` prefix)
- [ ] "Send Broadcast" button → confirmation Dialog → `POST /api/v1/broadcasts` → success toast: "Broadcast queued for N parents"
- [ ] Broadcast history table: columns = Date, Scope, Preview, Target, Delivered, Failed, Status (Queued / In Progress / Complete)
- [ ] Auto-poll in-progress broadcasts every 5 seconds to update delivery stats
- [ ] Delivery rate badge: green (>95%), amber (80–95%), red (<80%)
- [ ] Empty history state: "No broadcasts sent yet."

**Technical Notes:**
- Recipient count: call `GET /api/v1/users/telegram?role=parent&isActive=true` and use total; or add a `/api/v1/users/telegram/count` shortcut endpoint
- Polling: TanStack Query `refetchInterval: (data) => data?.status === 'in_progress' ? 5000 : false`
- shadcn/ui `Textarea`, `Select`, `Badge`, `Progress`, `Alert`

---

### S-35 — Superadmin pages (users, audit, system)

**Epic:** E5 — Dashboard Frontend
**Points:** 5
**Sprint:** 4
**Dependencies:** S-30, S-26, S-27, S-28

**User Story:**
As a superadmin, I want dedicated management pages for users, audit logs, and system status, so that I can perform governance and compliance operations from the dashboard.

**Acceptance Criteria:**

**User Management (`/settings/team`):**
- [ ] Two tabs: "Dashboard Users" and "Telegram Users"
- [ ] Dashboard Users table: Name, Email, Role, Last Login, Status; "Add User" button opens form; "Deactivate" action
- [ ] Telegram Users table: ID, Role, Registered, Status; "Deactivate / Reactivate" and "Promote / Demote" actions
- [ ] All actions with confirmation Dialogs

**Audit Log (`/audit`):**
- [ ] Searchable, paginated audit log table
- [ ] Filter controls: date range picker, direction filter, student search
- [ ] Columns: Timestamp, Direction, Type, Student, Source, Target
- [ ] Export CSV button: generates client-side CSV from current filtered results (no new endpoint needed — use already-fetched data)
- [ ] Empty state: "No audit entries for the selected filters."

**System Status (`/settings/system`):**
- [ ] Full system status card: Database (connected, pool), Redis (connected, ping), Bot (connected, username)
- [ ] Uptime display
- [ ] Today's relay count, active mapping count, broadcast queue depth
- [ ] Auto-refresh every 30 seconds
- [ ] Status indicator: green "All Systems Operational" / amber "Degraded" / red "Outage"

**All pages require `SuperadminRoute` guard.**

---

## Sprint 5 — Landing Page + QA + Hardening

**Goal:** The product is ship-ready. Landing page live for demo requests. E2E tests covering critical paths. Security and PDPA audit complete. All known issues resolved.

**Dates:** Week 9–10 (2026-04-28 to 2026-05-09)
**Capacity:** 30 points
**Allocated:** 30 points *(accounts for S-38 being the largest item)*

**Stories in this sprint:**

| ID | Title | Points |
|----|-------|--------|
| S-36 | Landing page | 5 |
| S-37 | E2E tests (Playwright — critical relay paths) | 5 |
| S-38 | Security review + PDPA audit + hardening | 8 |
| **Total** | | **18** |

> Remaining 12 points of Sprint 5 capacity is reserved for bug fixes surfaced during E2E testing and QA review, UX polish items identified during internal demo, and any stories that slipped from earlier sprints.

**Sprint 5 Definition of Done:**
- [ ] Landing page is live at `https://<domain>/` with working "Book a Demo" CTA
- [ ] E2E test suite covers all 5 critical relay scenarios (defined in S-37)
- [ ] Security checklist complete (all items in S-38 verified or mitigated)
- [ ] PDPA audit passed: consent flow verified, no content in audit logs, deletion path tested
- [ ] No P0 or P1 bugs open
- [ ] Production deploy checklist executed on staging
- [ ] Superadmin has onboarded to the production system with real credentials

---

### S-36 — Landing page

**Epic:** E6 — Landing Page
**Points:** 5
**Sprint:** 5
**Dependencies:** S-30 (shares design tokens and Tailwind config)

**User Story:**
As a potential customer (tuition center owner), I want to read about Conduit on a professional landing page and submit a demo request, so that I can evaluate whether Conduit solves my communication and poaching problems.

**Acceptance Criteria:**
- [ ] Sections (from frontend design doc): Hero, Problem, Solution Features, Trust (PDPA, uptime, latency), Pricing teaser, Demo CTA
- [ ] Hero section: headline "Secure teacher-parent communication for tuition centers. No poaching. No WhatsApp chaos.", subheadline, CTA button "Book a Demo"
- [ ] Feature cards: Virtual Chat IDs, Deep-link Onboarding, Broadcast, Dashboard, PDPA Compliant
- [ ] "Book a Demo" CTA: opens mailto link or simple form (name, center name, email, phone) — form submits to a Formspree endpoint or similar no-backend form service
- [ ] PDPA trust badge: "Your data is protected under Singapore PDPA"
- [ ] Mobile responsive (375px and 1440px breakpoints)
- [ ] Passes Lighthouse accessibility score > 90
- [ ] Conduit brand colors, Inter font, and design tokens applied per frontend design doc
- [ ] `/` route serves landing page when NOT authenticated; authenticated users see dashboard (redirect to `/dashboard`)
- [ ] `<title>Conduit — Secure Communication for Tuition Centers</title>`
- [ ] OpenGraph meta tags for sharing

**Technical Notes:**
- Landing page is a route within the same React SPA (`/` route)
- Conditionally render: `if (user) redirect('/dashboard'); else render LandingPage`
- Formspree: free tier handles 50 submissions/month — sufficient for early demo requests
- Lighthouse: run `npx lighthouse https://staging.domain.com/` before marking complete
- No analytics scripts in MVP (keep bundle clean; add PostHog in Phase 2 if needed)

---

### S-37 — E2E tests (Playwright — critical relay paths)

**Epic:** E7 — QA & Hardening
**Points:** 5
**Sprint:** 5
**Dependencies:** S-08, S-13, S-21, all Sprint 3 API stories

**User Story:**
As a developer, I want automated end-to-end tests covering the critical relay and onboarding paths, so that regressions in core functionality are caught before each deployment.

**Acceptance Criteria:**
- [ ] Playwright configured in `packages/e2e/` with `playwright.config.ts`
- [ ] Test suite covers the following 5 scenarios:

  **Scenario 1 — Parent-to-Teacher Relay (Happy Path)**
  - Seed: teacher and parent registered with single-child mapping
  - Action: parent sends text message → assert teacher receives it (via bot API polling in test)
  - Assert: audit log entry created, no message content in log

  **Scenario 2 — Teacher-to-Parent Reply**
  - Continuation of Scenario 1
  - Action: teacher replies to received message → assert parent receives reply
  - Assert: relay context used correctly; direction = `teacher_to_parent`

  **Scenario 3 — Parent Onboarding via Deep Link**
  - Seed: unregistered user, valid token for parent role
  - Action: user sends `/start <token>` → follow PDPA consent flow → confirm registration
  - Assert: `users` row created with `pdpa_consent_at` set; token marked `used_at`; `parent_student_mappings` row created

  **Scenario 4 — Multi-Child Session Selection**
  - Seed: parent with 2 active children
  - Action: parent sends message → assert inline keyboard shown → select child → relay proceeds
  - Assert: Redis session set correctly; relay reaches correct teacher

  **Scenario 5 — Dashboard Login + Token Generation (API)**
  - Action: POST /api/v1/auth/login with valid creds → assert session cookie set
  - Action: POST /api/v1/tokens with valid body → assert token returned with deep link URL
  - Action: POST /api/v1/auth/logout → assert cookie cleared
  - Assert: all HTTP status codes correct

- [ ] Tests run against a test database (separate from dev DB)
- [ ] GitHub Actions workflow runs E2E tests on every push to `main`
- [ ] Test suite completes within 3 minutes

**Technical Notes:**
- Playwright `page.request` for API-only tests (Scenarios 4, 5)
- Telegram bot integration tests: use a test bot token and test chat IDs (not production bot)
- Test database: `TEST_DATABASE_URL` env var; run migrations before test suite; truncate between tests
- `playwright.config.ts`: `timeout: 30_000`, `retries: 1` on CI
- Seed helpers: `db/test-seeds.ts` with typed factory functions for test data

---

### S-38 — Security review + PDPA audit + hardening

**Epic:** E7 — QA & Hardening
**Points:** 8
**Sprint:** 5
**Dependencies:** All previous stories

**User Story:**
As the superadmin and system owner, I want a comprehensive security review and PDPA audit completed before launch, so that the system is safe to operate and legally compliant.

**Acceptance Criteria:**

**Security Checklist:**
- [ ] Bot token not in version control — verified by `git log -p | grep BOT_TOKEN` returning nothing
- [ ] Webhook secret token validated on every request; returns 403 on mismatch
- [ ] All environment secrets in `.env`, not in `docker-compose.yml` or any committed file
- [ ] Login endpoint brute force protection tested: 5 failed logins → 15-min lockout confirmed
- [ ] Session cookies: `HttpOnly`, `Secure`, `SameSite=Strict` verified in browser DevTools on staging
- [ ] CSRF: SameSite=Strict cookie policy verified; add double-submit token if cross-origin requests are needed (MVP: same-origin, SameSite=Strict is sufficient)
- [ ] SQL injection: all queries use parameterized `$1, $2` — verify no string concatenation in query strings; add automated test
- [ ] XSS: all React-rendered data uses JSX (auto-escaping); no `dangerouslySetInnerHTML` — verify by grep
- [ ] Dependencies: `pnpm audit` returns no critical vulnerabilities; fix or document any high-severity findings
- [ ] Nginx `server_tokens off` configured (hides Nginx version)
- [ ] HSTS header present on all responses
- [ ] Rate limiting on `/api/` Nginx layer tested (10 req/s limit)
- [ ] Error messages do not leak stack traces to clients (production error handler returns generic messages)
- [ ] Pino log redaction configured for `token`, `secret`, `telegram_id`, `chat_id` fields

**PDPA Audit:**
- [ ] Consent flow tested end-to-end: no user registered without explicit "I Agree" — verify no `pdpa_consent_at = NULL` row in users after successful onboarding
- [ ] `message_audit_log` schema verified: attempt to insert a `message_text` column in a migration and confirm it is rejected without code changes (schema enforces minimization)
- [ ] Soft-delete path tested: deactivate a user → verify they can no longer relay messages
- [ ] Hard-delete path implemented: `DELETE /api/v1/users/telegram/:id/gdpr-erase` (superadmin only) — zeros encrypted fields, sets `is_active = false`, sets `display_name = pgp_sym_encrypt('REDACTED', key)`, sets `telegram_user_id = pgp_sym_encrypt('REDACTED_' || id, key)` — preserves FK integrity in audit log while removing PII
- [ ] GDPR/PDPA erase endpoint tested: user erased → audit log entries remain (no FK violation) but reference an anonymized row
- [ ] Application logs reviewed: grep for `telegram_user_id`, `chat_id`, `display_name` in log output — confirm no PII in plaintext logs
- [ ] Data retention policy documented: audit logs retained 2 years; message relay metadata (no content); users retained until erasure request

**Hardening:**
- [ ] Docker images use non-root user in `Dockerfile`
- [ ] PostgreSQL `pg_hba.conf` configured to reject connections from outside the Docker network
- [ ] Redis `requirepass` enabled with strong password in production
- [ ] Nginx `client_max_body_size 50m` verified (prevents OOM from oversized webhook payloads)
- [ ] UptimeRobot monitor configured: polls `/healthz` every 5 minutes; alert to admin Telegram chat
- [ ] Daily database backup cron job configured: `pg_dump` to Backblaze B2 or local volume; tested restore
- [ ] Production deploy checklist executed once on staging before production deploy

**Technical Notes:**
- GDPR erase endpoint is separate from the standard deactivate — it is irreversible. Require double confirmation: `{ confirm: 'ERASE' }` in request body.
- Log grep command for PII audit: `docker-compose logs app 2>&1 | grep -E 'telegram_user_id|chat_id|display_name'` — must return no output
- `pnpm audit --fix` for non-breaking vulnerability fixes; review breaking fixes manually

---

## Appendix A: Dependency Graph

```
S-01 (scaffold)
 └── S-02 (Docker)
      ├── S-03 (DB schema) ──────────────────────────────────────────────────┐
      │    └── S-14 (tokens) ──────┐                                          │
      ├── S-04 (Redis) ─────────── │ ─────────────────────────────────────────│──────────────┐
      └── S-05 (Nginx)             │                                          │               │
                                    │                                          │               │
S-01 ──► S-06 (grammY)             │                                          │               │
          └── S-07 (router) ──────► S-08 (relay) ──► S-10 (header)           │               │
               └── S-09 (multi-child)                └── S-11 (media groups) │               │
                                                       └── S-12 (rate limit)  │               │
                                                            └── S-19 (queue)  │               │
                                                       └── S-13 (onboarding) ◄┘               │
                                                                                               │
S-03 + S-04 + S-21 (auth) ──► S-22 (students API)                                            │
                           ──► S-23 (mappings API)                                            │
                           ──► S-24 (tokens API) ◄──── S-14                                  │
                           ──► S-25 (broadcast API) ◄── S-19                                  │
                           ──► S-26 (users API)                                               │
                           ──► S-27 (audit API) ◄──── S-20                                   │
                           ──► S-28 (system API)                                              │
                                                                                               │
S-30 (FE scaffold) ──► S-31 (login) ──► S-32 (home) ──► S-33 (students+mappings+tokens)     │
                    └──► S-34 (broadcasts)                                                     │
                    └──► S-35 (superadmin pages)                                               │
                                                                                               │
S-36 (landing) ─────────────────────────────────────────────────────────────────────────────►│
S-37 (E2E tests) ◄────────────────────────────────────────────────────────────────────────── ALL
S-38 (security) ◄──────────────────────────────────────────────────────────────────────────── ALL
```

---

## Appendix B: Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|------------|
| R-01 | Telegram API rate limits cause relay failures during burst | Medium | High | S-12 rate limiter with atomic Redis counters; BullMQ retry logic |
| R-02 | pgcrypto deterministic encryption does not support indexed lookup | Medium | High | S-07 technical note: add `telegram_user_id_hash` SHA-256 column as lookup key if deterministic encrypt fails |
| R-03 | grammY `conversations` plugin conflict with Redis session adapter | Low | Medium | Spike test in S-13 development day 1; fallback: manual state machine with Redis |
| R-04 | Media group batching race condition (timeout fires before all messages arrive) | Medium | Low | TTL-guard in S-11: track flushed groups to skip already-processed messages |
| R-05 | Single VPS downtime during operational hours | Low | High | UptimeRobot alerting (S-38), Docker restart policies (S-02), daily DB backups (S-38) |
| R-06 | Sprint 2 over capacity (34 pts vs 30 pt velocity) | High | Medium | S-11 (media groups, 3 pts) deferred to Sprint 3 if needed; S-19 worker logic can start Sprint 3 day 1 |
| R-07 | PDPA non-compliance discovered during audit | Low | Very High | S-38 audit items specifically test each PDPA requirement; schema enforces minimization at DB level |
| R-08 | Bot token compromised | Very Low | Very High | Token in `.env` only, never committed; Nginx validates webhook secret; token rotation runbook documented |

---

## Appendix C: Non-Stories (Out of Scope for MVP)

The following are explicitly NOT in any sprint and are deferred to Phase 2 or Phase 3:

| Item | Reason for Deferral |
|------|---------------------|
| FR-08: AI homework triage (OpenClaw) | Phase 2; stub only (S-29) |
| FR-09: Automated billing (Stripe/PayNow) | Phase 3; stub only (S-29) |
| Attendance tracking bot commands | Phase 2 |
| Multi-tenant Conduit (other tuition centers) | Phase 5 |
| WhatsApp API integration | Phase 5 (if Telegram penetration insufficient) |
| Native mobile app | Explicitly deprecated |
| SSR / Next.js migration | Phase 4/5 if dashboard becomes customer-facing |
| Full HA / failover (second VPS) | Phase 4 |
| WAL archiving for PostgreSQL | Phase 2 |
| External log aggregation (Datadog, Loki) | Phase 2 |
| Magic link / OAuth for dashboard login | Phase 2 |
| Forced password change on first login | Phase 2 |

---

## Appendix D: Functional Requirements Traceability

| FR | Description | Stories |
|----|-------------|---------|
| FR-01 | Deep-link onboarding with PDPA consent | S-13, S-14 |
| FR-02 | Anonymous message relay (all media types) | S-06, S-07, S-08, S-11 |
| FR-03 | Multi-child session selection | S-09 |
| FR-04 | Teacher reply context (student name header) | S-10 |
| FR-05 | Admin mapping management | S-15, S-22, S-23 |
| FR-05a | Superadmin user lifecycle | S-18, S-26 |
| FR-05b | Superadmin audit log access | S-27, S-35 |
| FR-05c | Superadmin PDPA deletion processing | S-38 |
| FR-06 | Broadcast with throttling | S-17, S-19, S-25, S-34 |
| FR-07 | PDPA compliance | S-03, S-13, S-20, S-38 |
| FR-08 | AI homework triage (stub) | S-29 |
| FR-09 | Automated billing (stub) | S-29 |
| Web Dashboard | Admin/Superadmin web interface | S-21–S-28, S-30–S-35 |
