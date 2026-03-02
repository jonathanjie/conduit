import 'dotenv/config';
import { serve } from '@hono/node-server';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { closePool } from './db/client.js';
import { app } from './server.js';
import { bot } from './bot/index.js';
import { authMiddleware } from './bot/middleware/auth.js';
import { router } from './bot/middleware/router.js';

// Register middleware and router on the bot
bot.use(authMiddleware);
bot.use(router);

const PORT = env.PORT;
const MODE = env.NODE_ENV;

async function notifyAdmin(message: string): Promise<void> {
  try {
    await bot.api.sendMessage(env.ADMIN_CHAT_ID, message);
  } catch (err) {
    logger.warn({ err }, 'Failed to send admin notification');
  }
}

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutdown signal received');

  try {
    if (MODE === 'development') {
      await bot.stop();
      logger.info('Bot polling stopped');
    }
  } catch (err) {
    logger.error({ err }, 'Error stopping bot');
  }

  try {
    await closePool();
  } catch (err) {
    logger.error({ err }, 'Error closing DB pool');
  }

  logger.info('Graceful shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => { shutdown('SIGTERM').catch(() => process.exit(1)); });
process.on('SIGINT', () => { shutdown('SIGINT').catch(() => process.exit(1)); });

async function main(): Promise<void> {
  logger.info(
    {
      port: PORT,
      mode: MODE,
      nodeVersion: process.version,
    },
    'Conduit starting up',
  );

  // Start Hono HTTP server in all modes
  serve({ fetch: app.fetch, port: PORT }, (info) => {
    logger.info({ address: `http://localhost:${info.port}` }, 'HTTP server listening');
  });

  if (MODE === 'development') {
    // Polling mode — useful for local dev without a public URL
    logger.info('Starting bot in polling mode');
    bot.start({
      onStart: async (botInfo) => {
        logger.info({ username: botInfo.username }, 'Bot polling started');
        await notifyAdmin('Conduit online (development / polling mode)');
      },
    }).catch((err) => {
      logger.error({ err }, 'Bot polling fatal error');
      process.exit(1);
    });
  } else {
    // Production — webhook mode; Telegram pushes updates to /webhook
    logger.info('Bot running in webhook mode');
    await notifyAdmin('Conduit online');
  }
}

main().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});
