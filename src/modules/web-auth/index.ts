import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { redis } from '../../lib/redis.js';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import {
  findDashboardUserByEmail,
  updateLastLogin,
} from '../../db/queries/dashboard-users.js';
import type { DashboardUserRole } from '../../types/index.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_TTL_SECONDS = 86400; // 24 hours
const SESSION_KEY_PREFIX = 'dashboard_session:';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionData {
  userId: number;
  role: DashboardUserRole;
  email: string;
}

// ─── Password helpers ─────────────────────────────────────────────────────────

/**
 * Hash a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_COST_FACTOR);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Session management ───────────────────────────────────────────────────────

/**
 * Create a new session in Redis and return the session token (UUID).
 */
export async function createSession(
  userId: number,
  role: DashboardUserRole,
  email: string,
): Promise<string> {
  const sessionToken = randomUUID();
  const key = `${SESSION_KEY_PREFIX}${sessionToken}`;
  const value: SessionData = { userId, role, email };

  await redis.set(key, JSON.stringify(value), 'EX', SESSION_TTL_SECONDS);

  logger.info({ userId, role }, 'Dashboard session created');
  return sessionToken;
}

/**
 * Validate a session token by looking it up in Redis.
 * Returns session data if valid, null if expired or not found.
 */
export async function validateSession(sessionToken: string): Promise<SessionData | null> {
  const key = `${SESSION_KEY_PREFIX}${sessionToken}`;
  const raw = await redis.get(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    logger.warn({ key }, 'Malformed session payload in Redis');
    return null;
  }
}

/**
 * Destroy a session by deleting it from Redis.
 */
export async function destroySession(sessionToken: string): Promise<void> {
  const key = `${SESSION_KEY_PREFIX}${sessionToken}`;
  await redis.del(key);
  logger.info({}, 'Dashboard session destroyed');
}

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginResult {
  sessionToken: string;
  userId: number;
  email: string;
  role: DashboardUserRole;
  displayName: string;
}

/**
 * Validate email/password credentials against the dashboard_users table.
 * On success, creates a Redis session and returns session data.
 * Returns null if credentials are invalid or user is inactive.
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResult | null> {
  const user = await findDashboardUserByEmail(email);

  if (!user || !user.isActive) {
    // Use a dummy compare to prevent timing-based user enumeration
    await bcrypt.compare(password, '$2b$12$invalidhashfortimingsafety000000000000000000000');
    logger.warn({ email }, 'Dashboard login attempt for unknown/inactive user');
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    logger.warn({ userId: user.id }, 'Dashboard login failed — bad password');
    return null;
  }

  // Update last login timestamp (fire and forget — don't fail login on this)
  updateLastLogin(user.id).catch((err) => {
    logger.error({ err, userId: user.id }, 'Failed to update last_login_at');
  });

  const sessionToken = await createSession(user.id, user.role, user.email);

  logger.info({ userId: user.id, role: user.role }, 'Dashboard login successful');

  return {
    sessionToken,
    userId: user.id,
    email: user.email,
    role: user.role,
    displayName: user.displayName,
  };
}
