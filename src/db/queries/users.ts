import { query } from '../client.js';
import { encryptField, decryptField, hashTelegramId } from '../../lib/crypto.js';
import { logger } from '../../lib/logger.js';
import type { DbUser, UserRole, CreateUserParams } from '../../types/index.js';

function rowToDbUser(row: Record<string, unknown>): DbUser {
  return {
    id: row.id as number,
    telegramUserId: decryptField(row.telegram_user_id as Buffer),
    chatId: decryptField(row.chat_id as Buffer),
    role: row.role as UserRole,
    displayName: decryptField(row.display_name as Buffer),
    registeredAt: row.registered_at as Date,
    pdpaConsentAt: row.pdpa_consent_at as Date | null,
    isActive: row.is_active as boolean,
    deactivatedAt: row.deactivated_at as Date | null,
    deactivatedBy: row.deactivated_by as number | null,
  };
}

/**
 * Find a user by their Telegram user ID.
 * Uses the SHA-256 hash index for O(1) lookup.
 */
export async function findUserByTelegramId(telegramUserId: string): Promise<DbUser | null> {
  const hash = hashTelegramId(telegramUserId);
  const result = await query(
    'SELECT * FROM users WHERE telegram_user_id_hash = $1',
    [hash],
  );
  if (result.rows.length === 0) return null;
  return rowToDbUser(result.rows[0]);
}

/**
 * Find a user by their internal ID.
 */
export async function findUserById(userId: number): Promise<DbUser | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) return null;
  return rowToDbUser(result.rows[0]);
}

/**
 * Create a new user with encrypted fields.
 */
export async function createUser(params: CreateUserParams): Promise<DbUser> {
  const encTelegramId = encryptField(params.telegramUserId);
  const hashTgId = hashTelegramId(params.telegramUserId);
  const encChatId = encryptField(params.chatId);
  const encDisplayName = encryptField(params.displayName);

  const result = await query(
    `INSERT INTO users (telegram_user_id, telegram_user_id_hash, chat_id, role, display_name, pdpa_consent_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [encTelegramId, hashTgId, encChatId, params.role, encDisplayName, params.pdpaConsentAt ?? null],
  );

  logger.info({ userId: result.rows[0].id, role: params.role }, 'User created');
  return rowToDbUser(result.rows[0]);
}

/**
 * Deactivate a user (soft delete).
 */
export async function deactivateUser(userId: number, deactivatedBy: number): Promise<void> {
  await query(
    `UPDATE users SET is_active = FALSE, deactivated_at = NOW(), deactivated_by = $2
     WHERE id = $1`,
    [userId, deactivatedBy],
  );
  logger.info({ userId, deactivatedBy }, 'User deactivated');
}

/**
 * Reactivate a previously deactivated user.
 */
export async function reactivateUser(userId: number): Promise<void> {
  await query(
    `UPDATE users SET is_active = TRUE, deactivated_at = NULL, deactivated_by = NULL
     WHERE id = $1`,
    [userId],
  );
  logger.info({ userId }, 'User reactivated');
}

/**
 * Update a user's role.
 */
export async function updateUserRole(userId: number, newRole: UserRole): Promise<void> {
  await query('UPDATE users SET role = $2 WHERE id = $1', [userId, newRole]);
  logger.info({ userId, newRole }, 'User role updated');
}
