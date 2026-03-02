import { Hono } from 'hono';
import { z } from 'zod';
import {
  listDashboardUsers,
  createDashboardUser,
  findDashboardUserById,
  updateDashboardUserRole,
  deactivateDashboardUser,
} from '../../db/queries/dashboard-users.js';
import { hashPassword } from '../../modules/web-auth/index.js';
import { requireSuperadmin } from '../middleware/auth.js';
import { logger } from '../../lib/logger.js';
import type { DashboardUserRole } from '../../types/index.js';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createDashboardUserSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  role: z.enum(['admin', 'superadmin']),
  displayName: z.string().min(1, 'displayName is required').max(200),
});

const updateDashboardUserSchema = z.object({
  role: z.enum(['admin', 'superadmin']),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export const dashboardUserRoutes = new Hono();

// All dashboard-users routes are superadmin only
dashboardUserRoutes.use('/dashboard-users/*', requireSuperadmin);
dashboardUserRoutes.use('/dashboard-users', requireSuperadmin);

/**
 * GET /api/v1/dashboard-users
 * List all dashboard admin accounts.
 */
dashboardUserRoutes.get('/dashboard-users', async (c) => {
  const users = await listDashboardUsers();

  return c.json({
    data: users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      displayName: u.displayName,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    })),
  });
});

/**
 * POST /api/v1/dashboard-users
 * Create a new dashboard admin account.
 */
dashboardUserRoutes.post('/dashboard-users', async (c) => {
  const session = c.get('session');

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = createDashboardUserSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      422,
    );
  }

  const { email, password, role, displayName } = parsed.data;
  const passwordHash = await hashPassword(password);

  const user = await createDashboardUser({
    email,
    passwordHash,
    role: role as DashboardUserRole,
    displayName,
    createdBy: session.userId,
  });

  logger.info({ dashboardUserId: user.id, role, createdBy: session.userId }, 'Dashboard user created via API');

  return c.json(
    {
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        createdAt: user.createdAt.toISOString(),
      },
    },
    201,
  );
});

/**
 * PATCH /api/v1/dashboard-users/:id
 * Update a dashboard user's role.
 */
dashboardUserRoutes.patch('/dashboard-users/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) {
    return c.json({ error: 'Invalid dashboard user ID' }, 400);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = updateDashboardUserSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      422,
    );
  }

  const existing = await findDashboardUserById(id);
  if (!existing || !existing.isActive) {
    return c.json({ error: 'Dashboard user not found' }, 404);
  }

  await updateDashboardUserRole(id, parsed.data.role as DashboardUserRole);

  logger.info({ dashboardUserId: id, role: parsed.data.role }, 'Dashboard user role updated via API');

  return c.json({ data: { message: 'Role updated', userId: id, role: parsed.data.role } });
});

/**
 * DELETE /api/v1/dashboard-users/:id
 * Deactivate a dashboard admin account.
 */
dashboardUserRoutes.delete('/dashboard-users/:id', async (c) => {
  const session = c.get('session');
  const id = parseInt(c.req.param('id'), 10);

  if (isNaN(id)) {
    return c.json({ error: 'Invalid dashboard user ID' }, 400);
  }

  // Prevent self-deletion
  if (id === session.userId) {
    return c.json({ error: 'Cannot deactivate your own account' }, 409);
  }

  const existing = await findDashboardUserById(id);
  if (!existing || !existing.isActive) {
    return c.json({ error: 'Dashboard user not found' }, 404);
  }

  await deactivateDashboardUser(id);

  logger.info({ dashboardUserId: id, deactivatedBy: session.userId }, 'Dashboard user deactivated via API');

  return c.json({ data: { message: 'Dashboard user deactivated', userId: id } });
});
