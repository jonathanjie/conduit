import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;  // 96-bit nonce — NIST recommended for GCM
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  return Buffer.from(env.APP_ENCRYPTION_KEY, 'hex');
}

/**
 * Encrypt a plaintext string to a Buffer using AES-256-GCM (authenticated encryption).
 * Format: [12-byte IV][ciphertext][16-byte auth tag]
 *
 * GCM provides both confidentiality and integrity — bit-flipping attacks on ciphertext
 * are detected at decrypt time. Preferred over CBC for PII fields.
 */
export function encryptField(value: string): Buffer {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv) as ReturnType<typeof createCipheriv> & {
    getAuthTag(): Buffer;
  };
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, ciphertext, authTag]);
}

/**
 * Decrypt a Buffer (IV + ciphertext + auth tag) back to plaintext string.
 * Throws if the auth tag does not match (tampered or corrupted data).
 */
export function decryptField(encrypted: Buffer): string {
  const iv = encrypted.subarray(0, IV_LENGTH);
  const authTag = encrypted.subarray(encrypted.length - AUTH_TAG_LENGTH);
  const ciphertext = encrypted.subarray(IV_LENGTH, encrypted.length - AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv) as ReturnType<
    typeof createDecipheriv
  > & { setAuthTag(tag: Buffer): void };
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

/**
 * Deterministic SHA-256 hash for indexed lookups.
 * This allows O(1) lookups on encrypted telegram_user_id columns.
 */
export function hashTelegramId(telegramUserId: string): Buffer {
  return createHash('sha256').update(telegramUserId).digest();
}
