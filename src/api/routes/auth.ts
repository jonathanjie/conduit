import { Hono } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { z } from 'zod';
import { login, destroySession } from '../../modules/web-auth/index.js';
import { requireAuth, SESSION_COOKIE_NAME } from '../middleware/auth.js';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Cookie config ────────────────────────────────────────────────────────────

function setSessionCookie(c: Parameters<typeof setCookie>[0], token: string): void {
  setCookie(c, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/api',
    maxAge: 86400,
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export const authRoutes = new Hono();

/**
 * POST /api/v1/auth/login
 * Validates email + password, sets httpOnly session cookie, returns user info.
 */
authRoutes.post('/auth/login', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      422,
    );
  }

  const { email, password } = parsed.data;
  const result = await login(email, password);

  if (!result) {
    // Deliberate vagueness to avoid user enumeration
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  setSessionCookie(c, result.sessionToken);

  logger.info({ userId: result.userId }, 'Auth login succeeded');

  return c.json({
    data: {
      userId: result.userId,
      email: result.email,
      role: result.role,
      displayName: result.displayName,
    },
  });
});

/**
 * POST /api/v1/auth/logout
 * Destroys the session from Redis and clears the cookie.
 */
authRoutes.post('/auth/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);

  if (token) {
    await destroySession(token);
  }

  deleteCookie(c, SESSION_COOKIE_NAME, {
    path: '/api',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });

  return c.json({ data: { message: 'Logged out successfully' } });
});

/**
 * GET /api/v1/auth/me
 * Returns the current user info from the session. 401 if not authenticated.
 */
authRoutes.get('/auth/me', requireAuth, async (c) => {
  const session = c.get('session');

  return c.json({
    data: {
      userId: session.userId,
      email: session.email,
      role: session.role,
    },
  });
});
