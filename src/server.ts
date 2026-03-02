import { Hono } from 'hono';
import { timingSafeEqual } from 'node:crypto';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { dbHealthCheck } from './db/client.js';
import { redisHealthCheck } from './lib/redis.js';
import { bot } from './bot/index.js';
import { webhookCallback } from 'grammy';

const WEBHOOK_SECRET_HEADER = 'x-telegram-bot-api-secret-token';

export const app = new Hono();

// ── POST /webhook — Telegram webhook endpoint ─────────────────────────────────

app.post('/webhook', async (c) => {
  // Validate the secret token header with timing-safe comparison
  const incomingSecret = c.req.header(WEBHOOK_SECRET_HEADER);
  const expected = env.TELEGRAM_WEBHOOK_SECRET;
  const secretValid =
    incomingSecret !== undefined &&
    incomingSecret.length === expected.length &&
    timingSafeEqual(Buffer.from(incomingSecret), Buffer.from(expected));
  if (!secretValid) {
    logger.warn({ ip: c.req.header('x-forwarded-for') }, 'Webhook secret mismatch — rejected');
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const handler = webhookCallback(bot, 'hono');
    return handler(c);
  } catch (err) {
    logger.error({ err }, 'Webhook handler error');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ── GET /healthz — Health check ───────────────────────────────────────────────

app.get('/healthz', async (c) => {
  const [dbOk, redisOk] = await Promise.all([dbHealthCheck(), redisHealthCheck()]);

  const status = dbOk && redisOk ? 'ok' : 'degraded';

  return c.json(
    {
      status,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        db: dbOk ? 'ok' : 'error',
        redis: redisOk ? 'ok' : 'error',
      },
    },
    status === 'ok' ? 200 : 503,
  );
});

// ── GET /api/v1/health — REST API health placeholder ─────────────────────────

app.get('/api/v1/health', (c) => {
  return c.json({
    status: 'ok',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
});
