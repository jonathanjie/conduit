import { Hono } from 'hono';
import { dbHealthCheck, query } from '../../db/client.js';
import { redisHealthCheck } from '../../lib/redis.js';
import { getSystemStats } from '../../db/queries/admin.js';
import { getBroadcastQueueStats } from '../../modules/broadcast/index.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../../lib/logger.js';

// ─── Routes ───────────────────────────────────────────────────────────────────

export const systemRoutes = new Hono();

systemRoutes.use('/system/*', requireAuth);

/**
 * GET /api/v1/system/status
 * Returns health status of DB, Redis, uptime, and broadcast queue.
 */
systemRoutes.get('/system/status', async (c) => {
  const [dbOk, redisOk, queueStats] = await Promise.all([
    dbHealthCheck(),
    redisHealthCheck(),
    getBroadcastQueueStats().catch((err) => {
      logger.warn({ err }, 'Could not fetch broadcast queue stats');
      return null;
    }),
  ]);

  const allOk = dbOk && redisOk;

  return c.json(
    {
      data: {
        status: allOk ? 'ok' : 'degraded',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
          db: dbOk ? 'ok' : 'error',
          redis: redisOk ? 'ok' : 'error',
          queue: queueStats
            ? {
                status: 'ok',
                waiting: queueStats.waiting,
                active: queueStats.active,
                completed: queueStats.completed,
                failed: queueStats.failed,
              }
            : { status: 'error' },
        },
      },
    },
    allOk ? 200 : 503,
  );
});

/**
 * GET /api/v1/system/stats
 * Returns aggregate counts: users, students, messages, broadcasts.
 */
systemRoutes.get('/system/stats', async (c) => {
  const [stats, messageCountResult, broadcastCountResult] = await Promise.all([
    getSystemStats(),
    query(`SELECT COUNT(*) AS total FROM message_audit_log`),
    query(`SELECT COUNT(*) AS total FROM broadcast_log`),
  ]);

  return c.json({
    data: {
      users: {
        total: stats.totalUsers,
        active: stats.activeUsers,
        teachers: stats.totalTeachers,
        parents: stats.totalParents,
      },
      students: {
        total: stats.totalStudents,
        active: stats.activeStudents,
      },
      mappings: {
        active: stats.activeMappings,
      },
      messages: {
        total: Number(messageCountResult.rows[0].total),
      },
      broadcasts: {
        total: Number(broadcastCountResult.rows[0].total),
      },
      uptimeSeconds: stats.uptimeSeconds,
    },
  });
});
