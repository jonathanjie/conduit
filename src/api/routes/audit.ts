import { Hono } from 'hono';
import { z } from 'zod';
import { query } from '../../db/client.js';
import { requireAuth } from '../middleware/auth.js';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const auditQuerySchema = z.object({
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
  userId: z.coerce.number().int().positive().optional(),
  direction: z
    .enum(['parent_to_teacher', 'teacher_to_parent', 'ai_to_parent'])
    .optional(),
  studentId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export const auditRoutes = new Hono();

auditRoutes.use('/audit/*', requireAuth);
auditRoutes.use('/audit', requireAuth);

/**
 * GET /api/v1/audit
 * Search the message audit log with query params.
 * Superadmin or admin can access; results never include message content.
 */
auditRoutes.get('/audit', async (c) => {
  const queryParams = auditQuerySchema.safeParse(c.req.query());
  if (!queryParams.success) {
    return c.json(
      { error: 'Invalid query parameters', details: queryParams.error.flatten().fieldErrors },
      422,
    );
  }

  const { dateFrom, dateTo, userId, direction, studentId, limit, offset } = queryParams.data;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (dateFrom) {
    conditions.push(`created_at >= $${idx++}`);
    params.push(new Date(dateFrom));
  }
  if (dateTo) {
    conditions.push(`created_at <= $${idx++}`);
    params.push(new Date(dateTo));
  }
  if (userId !== undefined) {
    // Match entries where the user is either source or target
    conditions.push(`(source_user_id = $${idx} OR target_user_id = $${idx})`);
    params.push(userId);
    idx++;
  }
  if (direction) {
    conditions.push(`direction = $${idx++}`);
    params.push(direction);
  }
  if (studentId !== undefined) {
    conditions.push(`student_id = $${idx++}`);
    params.push(studentId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rowsResult, countResult] = await Promise.all([
    query(
      `SELECT * FROM message_audit_log ${whereClause}
       ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    ),
    query(`SELECT COUNT(*) AS total FROM message_audit_log ${whereClause}`, params),
  ]);

  const total = Number(countResult.rows[0].total);

  return c.json({
    data: rowsResult.rows.map((row) => ({
      id: row.id as number,
      sourceUserId: row.source_user_id as number,
      targetUserId: row.target_user_id as number,
      studentId: row.student_id as number | null,
      direction: row.direction as string,
      messageType: row.message_type as string,
      relayedMessageId: row.relayed_message_id as number | null,
      createdAt: (row.created_at as Date).toISOString(),
    })),
    pagination: {
      limit,
      offset,
      total,
    },
  });
});
