import { Hono } from 'hono';
import { z } from 'zod';
import { listTokens } from '../../db/queries/tokens.js';
import { generateToken } from '../../modules/token/index.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../../lib/logger.js';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const listTokensSchema = z.object({
  role: z.enum(['parent', 'teacher']).optional(),
  studentId: z.coerce.number().int().positive().optional(),
  teacherUserId: z.coerce.number().int().positive().optional(),
  unusedOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const generateTokenSchema = z.object({
  role: z.enum(['parent', 'teacher']),
  studentId: z.number().int().positive().optional(),
  teacherUserId: z.number().int().positive().optional(),
  expiresInHours: z.number().int().min(1).max(720).optional(),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export const tokenRoutes = new Hono();

tokenRoutes.use('/tokens/*', requireAuth);
tokenRoutes.use('/tokens', requireAuth);

/**
 * GET /api/v1/tokens
 * List onboarding tokens with optional filters.
 */
tokenRoutes.get('/tokens', async (c) => {
  const queryParams = listTokensSchema.safeParse(c.req.query());
  if (!queryParams.success) {
    return c.json(
      { error: 'Invalid query parameters', details: queryParams.error.flatten().fieldErrors },
      422,
    );
  }

  const { page, limit, role, studentId, teacherUserId, unusedOnly } = queryParams.data;
  const offset = (page - 1) * limit;

  const tokens = await listTokens({
    role,
    studentId,
    teacherUserId,
    unusedOnly,
    limit,
    offset,
  });

  return c.json({
    data: tokens.map((t) => ({
      id: t.id,
      token: t.token,
      role: t.role,
      studentId: t.studentId,
      teacherUserId: t.teacherUserId,
      createdBy: t.createdBy,
      createdAt: t.createdAt.toISOString(),
      expiresAt: t.expiresAt.toISOString(),
      usedAt: t.usedAt?.toISOString() ?? null,
      usedBy: t.usedBy,
      isUsed: t.usedAt !== null,
      isExpired: t.expiresAt < new Date(),
    })),
    pagination: {
      page,
      limit,
    },
  });
});

/**
 * POST /api/v1/tokens
 * Generate a new onboarding token.
 * Response includes the deep link URL.
 */
tokenRoutes.post('/tokens', async (c) => {
  const session = c.get('session');

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = generateTokenSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      422,
    );
  }

  const { role, studentId, teacherUserId, expiresInHours } = parsed.data;

  const result = await generateToken({
    role,
    studentId,
    teacherUserId,
    createdBy: session.userId,
    expiresInHours,
  });

  logger.info({ role, studentId, teacherUserId, createdBy: session.userId }, 'Token generated via API');

  return c.json(
    {
      data: {
        token: result.token,
        deepLink: result.deepLink,
        role,
        studentId: studentId ?? null,
        teacherUserId: teacherUserId ?? null,
      },
    },
    201,
  );
});
