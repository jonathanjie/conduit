import { Hono } from 'hono';
import { z } from 'zod';
import { query } from '../../db/client.js';
import { deactivateUser, reactivateUser } from '../../db/queries/users.js';
import { decryptField } from '../../lib/crypto.js';
import { requireAuth, requireSuperadmin } from '../middleware/auth.js';
import { logger } from '../../lib/logger.js';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const listUsersSchema = z.object({
  role: z.enum(['parent', 'teacher', 'admin', 'superadmin']).optional(),
  active: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export const userRoutes = new Hono();

// Read access requires auth; write (activate/deactivate) requires superadmin
userRoutes.use('/users/*', requireAuth);
userRoutes.use('/users', requireAuth);

/**
 * GET /api/v1/users
 * List Telegram users with optional filters.
 * display_name is encrypted — decrypt before returning.
 */
userRoutes.get('/users', async (c) => {
  const queryParams = listUsersSchema.safeParse(c.req.query());
  if (!queryParams.success) {
    return c.json(
      { error: 'Invalid query parameters', details: queryParams.error.flatten().fieldErrors },
      422,
    );
  }

  const { page, limit, role, active } = queryParams.data;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (role) {
    conditions.push(`role = $${idx++}`);
    params.push(role);
  }
  if (active !== undefined) {
    conditions.push(`is_active = $${idx++}`);
    params.push(active === 'true');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rowsResult, countResult] = await Promise.all([
    query(
      `SELECT id, display_name, role, is_active, registered_at, deactivated_at
       FROM users ${whereClause} ORDER BY registered_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    ),
    query(`SELECT COUNT(*) AS total FROM users ${whereClause}`, params),
  ]);

  const total = Number(countResult.rows[0].total);

  return c.json({
    data: rowsResult.rows.map((row) => ({
      id: row.id as number,
      displayName: decryptField(row.display_name as Buffer),
      role: row.role as string,
      isActive: row.is_active as boolean,
      registeredAt: (row.registered_at as Date).toISOString(),
      deactivatedAt: row.deactivated_at ? (row.deactivated_at as Date).toISOString() : null,
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
 * PATCH /api/v1/users/:id/activate
 * Reactivate a deactivated Telegram user. Superadmin only.
 */
userRoutes.patch('/users/:id/activate', requireSuperadmin, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) {
    return c.json({ error: 'Invalid user ID' }, 400);
  }

  const check = await query(`SELECT id, is_active FROM users WHERE id = $1`, [id]);
  if (check.rows.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  await reactivateUser(id);
  logger.info({ userId: id }, 'User reactivated via API');

  return c.json({ data: { message: 'User reactivated', userId: id } });
});

/**
 * PATCH /api/v1/users/:id/deactivate
 * Deactivate a Telegram user. Superadmin only.
 */
userRoutes.patch('/users/:id/deactivate', requireSuperadmin, async (c) => {
  const session = c.get('session');
  const id = parseInt(c.req.param('id'), 10);

  if (isNaN(id)) {
    return c.json({ error: 'Invalid user ID' }, 400);
  }

  const check = await query(`SELECT id, is_active FROM users WHERE id = $1`, [id]);
  if (check.rows.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  if (!(check.rows[0].is_active as boolean)) {
    return c.json({ error: 'User is already inactive' }, 409);
  }

  await deactivateUser(id, session.userId);
  logger.info({ userId: id, deactivatedBy: session.userId }, 'User deactivated via API');

  return c.json({ data: { message: 'User deactivated', userId: id } });
});
