import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { validateSession, type SessionData } from '../../modules/web-auth/index.js';
import { logger } from '../../lib/logger.js';

// ─── Context variable declaration ─────────────────────────────────────────────

export const SESSION_COOKIE_NAME = 'dashboard_session';

// Hono context variable key for session data
declare module 'hono' {
  interface ContextVariableMap {
    session: SessionData;
  }
}

// ─── requireAuth ─────────────────────────────────────────────────────────────

/**
 * Middleware that validates the session cookie and attaches session data to
 * the Hono context. Returns 401 if the session is missing or expired.
 */
export const requireAuth = createMiddleware(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);

  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const session = await validateSession(token);

  if (!session) {
    logger.debug({}, 'Session token invalid or expired');
    return c.json({ error: 'Session expired or invalid' }, 401);
  }

  c.set('session', session);
  await next();
});

// ─── requireSuperadmin ────────────────────────────────────────────────────────

/**
 * Middleware that requires the authenticated user to have the 'superadmin' role.
 * Must be chained after requireAuth.
 */
export const requireSuperadmin = createMiddleware(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);

  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const session = await validateSession(token);

  if (!session) {
    return c.json({ error: 'Session expired or invalid' }, 401);
  }

  if (session.role !== 'superadmin') {
    logger.warn({ userId: session.userId, role: session.role }, 'Superadmin route access denied');
    return c.json({ error: 'Superadmin role required' }, 403);
  }

  c.set('session', session);
  await next();
});
