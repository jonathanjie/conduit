# Conduit — Project Instructions

## What is Conduit?
Telegram-based routing engine for tuition centers. Proxies teacher-parent communication anonymously. First customer: Math Mavens (@MathMavens_bot).

## Documentation Lookup
| Document | Path |
|----------|------|
| Product Brief | `docs/product-brief-math-mavens-bot-2026-03-03.md` |
| Architecture | `docs/architecture-math-mavens-bot-2026-03-03.md` |
| UX Design | `docs/ux-design-math-mavens-bot-2026-03-03.md` |
| Frontend Design | `docs/frontend-design-conduit-2026-03-03.md` |
| Sprint Plan | `docs/sprint-plan-conduit-2026-03-03.md` |
| Sprint Status | `docs/sprint-status.yaml` |

## Tech Stack
- **Runtime:** Node.js 20, TypeScript 5 (strict, ESM)
- **Bot:** grammY with Redis sessions
- **HTTP:** Hono
- **DB:** PostgreSQL 16 (pgcrypto, AES-256 encrypted PII)
- **Cache/Queue:** Redis 7, ioredis, BullMQ
- **Frontend:** Vite + React + shadcn/ui + TanStack Query
- **Infra:** Docker Compose, Nginx, Let's Encrypt

## Key Patterns
- **ESM imports:** Always use `.js` extension in imports
- **Logging:** Use `logger` from `src/lib/logger.ts` — never `console.log`
- **Encryption:** PII (telegram_user_id, chat_id, display_name) encrypted at app level via `src/lib/crypto.ts`
- **Lookups:** User lookup by telegram_user_id uses SHA-256 hash index, not decryption
- **Relay:** Use `copyMessage` (never `forwardMessage`) for anonymous relay
- **Audit:** Log metadata only, never message content (PDPA compliance)
- **Roles:** parent, teacher, admin (office staff), superadmin (god mode)

## Doc Sync Rule
If you modify source code, check if corresponding documentation needs updating. Docs and code ship together.

## Commands
```bash
npm run dev          # Start dev server (polling mode)
npm run build        # TypeScript compile
npm run test         # Run vitest
npm run migrate      # Run DB migrations
npm run seed         # Seed test data
npm run typecheck    # Type check without emit
```
