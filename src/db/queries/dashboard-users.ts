import { query } from '../client.js';
import { logger } from '../../lib/logger.js';
import type { DbDashboardUser, DashboardUserRole } from '../../types/index.js';

// ─── Row mapper ───────────────────────────────────────────────────────────────

function rowToDashboardUser(row: Record<string, unknown>): DbDashboardUser {
  return {
    id: row.id as number,
    email: row.email as string,
    passwordHash: row.password_hash as string,
    role: row.role as DashboardUserRole,
    displayName: row.display_name as string,
    telegramUserId: row.telegram_user_id as number | null,
    createdAt: row.created_at as Date,
    createdBy: row.created_by as number | null,
    lastLoginAt: row.last_login_at as Date | null,
    isActive: row.is_active as boolean,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Find a dashboard user by their email address.
 * Only returns active users.
 */
export async function findDashboardUserByEmail(email: string): Promise<DbDashboardUser | null> {
  const result = await query(
    `SELECT * FROM dashboard_users WHERE email = $1 AND is_active = TRUE`,
    [email.toLowerCase().trim()],
  );
  if (result.rows.length === 0) return null;
  return rowToDashboardUser(result.rows[0]);
}

/**
 * Find a dashboard user by their internal ID.
 */
export async function findDashboardUserById(id: number): Promise<DbDashboardUser | null> {
  const result = await query(`SELECT * FROM dashboard_users WHERE id = $1`, [id]);
  if (result.rows.length === 0) return null;
  return rowToDashboardUser(result.rows[0]);
}

export interface CreateDashboardUserParams {
  email: string;
  passwordHash: string;
  role: DashboardUserRole;
  displayName: string;
  createdBy?: number;
}

/**
 * Create a new dashboard user.
 */
export async function createDashboardUser(
  params: CreateDashboardUserParams,
): Promise<DbDashboardUser> {
  const result = await query(
    `INSERT INTO dashboard_users (email, password_hash, role, display_name, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      params.email.toLowerCase().trim(),
      params.passwordHash,
      params.role,
      params.displayName,
      params.createdBy ?? null,
    ],
  );

  const user = rowToDashboardUser(result.rows[0]);
  logger.info({ dashboardUserId: user.id, role: user.role }, 'Dashboard user created');
  return user;
}

/**
 * Update the role of a dashboard user.
 */
export async function updateDashboardUserRole(
  id: number,
  role: DashboardUserRole,
): Promise<void> {
  await query(`UPDATE dashboard_users SET role = $2 WHERE id = $1`, [id, role]);
  logger.info({ dashboardUserId: id, role }, 'Dashboard user role updated');
}

/**
 * Soft-delete a dashboard user by setting is_active = FALSE.
 */
export async function deactivateDashboardUser(id: number): Promise<void> {
  await query(
    `UPDATE dashboard_users SET is_active = FALSE WHERE id = $1`,
    [id],
  );
  logger.info({ dashboardUserId: id }, 'Dashboard user deactivated');
}

/**
 * List all dashboard users ordered by creation date.
 */
export async function listDashboardUsers(): Promise<DbDashboardUser[]> {
  const result = await query(
    `SELECT * FROM dashboard_users ORDER BY created_at DESC`,
  );
  return result.rows.map(rowToDashboardUser);
}

/**
 * Update the last_login_at timestamp for a dashboard user.
 */
export async function updateLastLogin(id: number): Promise<void> {
  await query(
    `UPDATE dashboard_users SET last_login_at = NOW() WHERE id = $1`,
    [id],
  );
}
