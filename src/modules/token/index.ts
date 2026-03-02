import { randomBytes } from 'node:crypto';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { insertToken, findValidToken, markTokenUsed as dbMarkTokenUsed, claimToken as dbClaimToken } from '../../db/queries/tokens.js';
import type { TokenRole } from '../../types/index.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_EXPIRY_HOURS = 72;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a URL-safe base64 token string from 24 random bytes.
 * Output length is 32 characters — well within Telegram's 64-char deep link payload limit.
 */
function generateTokenString(): string {
  return randomBytes(24).toString('base64url');
}

function buildDeepLink(token: string): string {
  return `https://t.me/${env.BOT_USERNAME}?start=${token}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a single-use onboarding token and persist it.
 * Returns the token string and the Telegram deep link URL.
 */
export async function generateToken(params: {
  role: TokenRole;
  studentId?: number;
  teacherUserId?: number;
  createdBy?: number;
  expiresInHours?: number;
}): Promise<{ token: string; deepLink: string }> {
  const expiresInHours = params.expiresInHours ?? DEFAULT_EXPIRY_HOURS;
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  const tokenString = generateTokenString();

  await insertToken({
    token: tokenString,
    role: params.role,
    studentId: params.studentId,
    teacherUserId: params.teacherUserId,
    createdBy: params.createdBy,
    expiresAt,
  });

  const deepLink = buildDeepLink(tokenString);

  logger.info(
    {
      role: params.role,
      studentId: params.studentId ?? null,
      teacherUserId: params.teacherUserId ?? null,
      expiresAt,
    },
    'Onboarding token generated',
  );

  return { token: tokenString, deepLink };
}

/**
 * Validate a token: checks existence, expiry, and that used_at IS NULL.
 * Returns the token record fields needed for onboarding, or null if invalid/expired/used.
 */
export async function validateToken(token: string): Promise<{
  id: number;
  role: TokenRole;
  studentId: number | null;
  teacherUserId: number | null;
} | null> {
  const record = await findValidToken(token);
  if (!record) {
    logger.debug({ token: '[REDACTED]' }, 'Token validation failed — not found, expired, or used');
    return null;
  }
  return {
    id: record.id,
    role: record.role,
    studentId: record.studentId,
    teacherUserId: record.teacherUserId,
  };
}

/**
 * Mark a token as used by the given user.
 * Delegates to the DB query helper.
 */
export async function markTokenUsed(tokenId: number, usedBy: number): Promise<void> {
  await dbMarkTokenUsed(tokenId, usedBy);
}

/**
 * Atomically claim a token before creating the onboarding user.
 * Returns true if this caller won the race, false if the token was already used.
 * Use this instead of the validate→create→markUsed sequence to prevent double-spend.
 */
export async function claimToken(tokenId: number, claimedBy: number): Promise<boolean> {
  return dbClaimToken(tokenId, claimedBy);
}
