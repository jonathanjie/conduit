import { query } from '../client.js';
import { logger } from '../../lib/logger.js';
import type { DbOnboardingToken, TokenRole } from '../../types/index.js';

// ─── Row mapper ───────────────────────────────────────────────────────────────

function rowToToken(row: Record<string, unknown>): DbOnboardingToken {
  return {
    id: row.id as number,
    token: row.token as string,
    role: row.role as TokenRole,
    studentId: row.student_id as number | null,
    teacherUserId: row.teacher_user_id as number | null,
    createdBy: row.created_by as number | null,
    createdAt: row.created_at as Date,
    expiresAt: row.expires_at as Date,
    usedAt: row.used_at as Date | null,
    usedBy: row.used_by as number | null,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Insert a new onboarding token into the database.
 * Returns the generated id and the token string for convenience.
 */
export async function insertToken(params: {
  token: string;
  role: TokenRole;
  studentId?: number;
  teacherUserId?: number;
  createdBy?: number;
  expiresAt: Date;
}): Promise<{ id: number; token: string }> {
  const result = await query<{ id: number; token: string }>(
    `INSERT INTO onboarding_tokens (token, role, student_id, teacher_user_id, created_by, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, token`,
    [
      params.token,
      params.role,
      params.studentId ?? null,
      params.teacherUserId ?? null,
      params.createdBy ?? null,
      params.expiresAt,
    ],
  );

  const row = result.rows[0];
  logger.info(
    { tokenId: row.id, role: params.role, studentId: params.studentId ?? null },
    'Onboarding token created',
  );
  return { id: row.id as number, token: row.token as string };
}

/**
 * Find a token that is not expired and not yet used.
 * Returns null if the token does not exist, is expired, or has been used.
 */
export async function findValidToken(token: string): Promise<DbOnboardingToken | null> {
  const result = await query(
    `SELECT * FROM onboarding_tokens
     WHERE token = $1
       AND used_at IS NULL
       AND expires_at > NOW()`,
    [token],
  );
  if (result.rows.length === 0) return null;
  return rowToToken(result.rows[0]);
}

/**
 * Mark a token as consumed by a specific user.
 * Idempotent — safe to call multiple times but only the first write takes effect.
 */
export async function markTokenUsed(tokenId: number, usedBy: number): Promise<void> {
  await query(
    `UPDATE onboarding_tokens
     SET used_at = NOW(), used_by = $2
     WHERE id = $1 AND used_at IS NULL`,
    [tokenId, usedBy],
  );
  logger.info({ tokenId, usedBy }, 'Onboarding token marked used');
}

/**
 * Atomically claim a token by setting used_at and used_by in one UPDATE.
 * Returns true if this call won the race (rowCount === 1), false if the token
 * was already used or does not exist.
 *
 * Use this as an optimistic lock before creating the user during onboarding so
 * that a token can never be consumed by two concurrent requests.
 */
export async function claimToken(tokenId: number, claimedBy: number): Promise<boolean> {
  const result = await query(
    `UPDATE onboarding_tokens
     SET used_at = NOW(), used_by = $2
     WHERE id = $1
       AND used_at IS NULL
       AND expires_at > NOW()`,
    [tokenId, claimedBy],
  );
  const claimed = (result.rowCount ?? 0) > 0;
  if (claimed) {
    logger.info({ tokenId, claimedBy }, 'Onboarding token claimed');
  }
  return claimed;
}

/**
 * List tokens with optional filters. Intended for admin/dashboard use.
 */
export async function listTokens(filters: {
  role?: TokenRole;
  studentId?: number;
  teacherUserId?: number;
  unusedOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<DbOnboardingToken[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.role !== undefined) {
    conditions.push(`role = $${idx++}`);
    params.push(filters.role);
  }
  if (filters.studentId !== undefined) {
    conditions.push(`student_id = $${idx++}`);
    params.push(filters.studentId);
  }
  if (filters.teacherUserId !== undefined) {
    conditions.push(`teacher_user_id = $${idx++}`);
    params.push(filters.teacherUserId);
  }
  if (filters.unusedOnly) {
    conditions.push('used_at IS NULL');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit ?? 100;
  const offset = filters.offset ?? 0;

  const result = await query(
    `SELECT * FROM onboarding_tokens
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset],
  );

  return result.rows.map(rowToToken);
}
