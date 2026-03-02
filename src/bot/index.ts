import { Bot } from 'grammy';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import type { ConduitContext } from './context.js';

export const bot = new Bot<ConduitContext>(env.BOT_TOKEN);

// Global error handler — logs and never crashes the process
bot.catch((err) => {
  const ctx = err.ctx;
  logger.error(
    {
      err: err.error,
      update_id: ctx.update.update_id,
      from_id: ctx.from?.id,
      chat_id: ctx.chat?.id,
    },
    'Unhandled bot error',
  );
});
