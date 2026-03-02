import { redis } from '../../lib/redis.js';
import { logger } from '../../lib/logger.js';

// Telegram Bot API limits:
//   - Per-chat:  1 message/second
//   - Global:    30 messages/second (we use 25 for safety margin)
const PER_CHAT_MAX = 1;
const GLOBAL_MAX = 25;
const WINDOW_MS = 1000;

function perChatKey(chatId: string): string {
  return `conduit:rl:chat:${chatId}`;
}

const GLOBAL_KEY = 'conduit:rl:global';

/**
 * Atomically increment a sliding-window counter and set its TTL.
 *
 * Uses a Lua script so the INCR + PEXPIRE is a single atomic operation.
 * This prevents the race where two callers both see a count below the
 * limit, both increment, and both proceed — or the inverse where an INCR
 * fires but the PEXPIRE never fires because the connection drops between
 * the two calls.
 *
 * Returns the counter value after the increment (1 = first request in window).
 */
const LUA_INCR_WITH_TTL = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return current
`;

async function incrementWindow(key: string): Promise<number> {
  const result = await redis.eval(LUA_INCR_WITH_TTL, 1, key, String(WINDOW_MS));
  return result as number;
}

/**
 * Check whether we're within rate limits for a specific target chat.
 * If either the per-chat or global limit is breached, waits until the
 * current 1-second window expires before resolving.
 *
 * Never rejects — always resolves (may just take a moment).
 */
export async function checkAndWait(targetChatId: string): Promise<void> {
  const start = Date.now();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const [perChatCount, globalCount] = await Promise.all([
        incrementWindow(perChatKey(targetChatId)),
        incrementWindow(GLOBAL_KEY),
      ]);

      if (perChatCount <= PER_CHAT_MAX && globalCount <= GLOBAL_MAX) {
        return; // Within limits — proceed immediately
      }

      // At least one limit exceeded.  The Lua script already incremented the counters;
      // decrement them back so we don't inflate the window we're not using.
      // The undo here is safe because the broadcast worker runs with concurrency=1,
      // meaning only one fiber calls checkAndWait at a time for this process.
      // If this rate limiter is ever used outside concurrency=1 contexts, migrate to
      // a pure read-then-conditional-write Lua script.
      await Promise.all([
        redis.decr(perChatKey(targetChatId)),
        redis.decr(GLOBAL_KEY),
      ]);

      const elapsed = Date.now() - start;
      const remaining = WINDOW_MS - (elapsed % WINDOW_MS);

      logger.debug(
        { targetChatId, perChatCount, globalCount, waitMs: remaining },
        'Rate limit reached — waiting',
      );

      await new Promise<void>((resolve) => setTimeout(resolve, remaining + 10));
    } catch (err) {
      // Redis hiccup — log and fall through rather than blocking the send
      logger.error({ err, targetChatId }, 'Rate limiter Redis error — proceeding anyway');
      return;
    }
  }
}
