import { Hono } from 'hono';
import { z } from 'zod';
import { query } from '../../db/client.js';
import { getBroadcastTargets } from '../../db/queries/admin.js';
import { enqueueBroadcast } from '../../modules/broadcast/index.js';
import { findUserById } from '../../db/queries/users.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../../lib/logger.js';
import { env } from '../../config/env.js';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createBroadcastSchema = z.object({
  scope: z.string().min(1, 'scope is required'),
  messageText: z.string().min(1, 'messageText is required').max(4096),
  // Optional: the dashboard user's linked Telegram user ID for completion notifications
  adminTelegramUserId: z.number().int().positive().optional(),
});

const listBroadcastsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export const broadcastRoutes = new Hono();

broadcastRoutes.use('/broadcasts/*', requireAuth);
broadcastRoutes.use('/broadcasts', requireAuth);

/**
 * GET /api/v1/broadcasts
 * List past broadcasts with delivery stats.
 */
broadcastRoutes.get('/broadcasts', async (c) => {
  const queryParams = listBroadcastsSchema.safeParse(c.req.query());
  if (!queryParams.success) {
    return c.json(
      { error: 'Invalid query parameters', details: queryParams.error.flatten().fieldErrors },
      422,
    );
  }

  const { page, limit } = queryParams.data;
  const offset = (page - 1) * limit;

  const [rowsResult, countResult] = await Promise.all([
    query(
      `SELECT * FROM broadcast_log ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    ),
    query(`SELECT COUNT(*) AS total FROM broadcast_log`),
  ]);

  const total = Number(countResult.rows[0].total);

  return c.json({
    data: rowsResult.rows.map((row) => ({
      id: row.id as number,
      adminUserId: row.admin_user_id as number,
      scope: row.scope as string,
      messagePreview: row.message_preview as string | null,
      targetCount: row.target_count as number,
      deliveredCount: row.delivered_count as number,
      failedCount: row.failed_count as number,
      createdAt: (row.created_at as Date).toISOString(),
      completedAt: row.completed_at ? (row.completed_at as Date).toISOString() : null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * GET /api/v1/broadcasts/:id
 * Get detail for a single broadcast.
 */
broadcastRoutes.get('/broadcasts/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) {
    return c.json({ error: 'Invalid broadcast ID' }, 400);
  }

  const result = await query(`SELECT * FROM broadcast_log WHERE id = $1`, [id]);
  if (result.rows.length === 0) {
    return c.json({ error: 'Broadcast not found' }, 404);
  }

  const row = result.rows[0];
  return c.json({
    data: {
      id: row.id as number,
      adminUserId: row.admin_user_id as number,
      scope: row.scope as string,
      messagePreview: row.message_preview as string | null,
      targetCount: row.target_count as number,
      deliveredCount: row.delivered_count as number,
      failedCount: row.failed_count as number,
      createdAt: (row.created_at as Date).toISOString(),
      completedAt: row.completed_at ? (row.completed_at as Date).toISOString() : null,
    },
  });
});

/**
 * POST /api/v1/broadcasts
 * Create and queue a new broadcast.
 * scope = "all" | "<student_id>"
 */
broadcastRoutes.post('/broadcasts', async (c) => {
  const session = c.get('session');

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = createBroadcastSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      422,
    );
  }

  const { scope, messageText } = parsed.data;

  // Resolve target chat IDs
  const targetChatIds = await getBroadcastTargets(scope);

  if (targetChatIds.length === 0) {
    return c.json({ error: 'No active recipients found for the given scope' }, 422);
  }

  // For the broadcast worker completion notification we need the admin's Telegram chat ID.
  // If the dashboard user has no linked Telegram account, we use the configured admin chat ID.
  let adminChatId: string = env.ADMIN_CHAT_ID;
  if (parsed.data.adminTelegramUserId) {
    const adminUser = await findUserById(parsed.data.adminTelegramUserId).catch(() => null);
    if (adminUser?.chatId) {
      adminChatId = adminUser.chatId;
    }
  }

  const jobId = await enqueueBroadcast({
    adminUserId: session.userId,
    adminChatId,
    scope,
    messageText,
    targetChatIds,
  });

  logger.info({ jobId, scope, targetCount: targetChatIds.length, adminUserId: session.userId }, 'Broadcast enqueued via API');

  return c.json(
    {
      data: {
        message: 'Broadcast queued',
        jobId,
        targetCount: targetChatIds.length,
        scope,
      },
    },
    202,
  );
});
