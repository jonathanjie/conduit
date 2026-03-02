import type { NextFunction } from 'grammy';
import { findUserByTelegramId } from '../../db/queries/users.js';
import { logger } from '../../lib/logger.js';
import type { ConduitContext } from '../context.js';

/**
 * Auth middleware — runs on every update.
 * Looks up the user by telegram_user_id_hash (single indexed query).
 * Attaches the found DbUser to ctx.dbUser, or null if not found.
 */
export async function authMiddleware(ctx: ConduitContext, next: NextFunction): Promise<void> {
  const telegramId = ctx.from?.id;

  if (telegramId === undefined) {
    ctx.dbUser = null;
    return next();
  }

  try {
    ctx.dbUser = await findUserByTelegramId(String(telegramId));
  } catch (err) {
    // Do not log telegramId — it is PII and the redact path covers snake_case keys only
    logger.error({ err }, 'Auth middleware DB lookup failed');
    ctx.dbUser = null;
  }

  return next();
}
