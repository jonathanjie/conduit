import { redis } from '../../lib/redis.js';
import { logger } from '../../lib/logger.js';

const SESSION_KEY_PREFIX = 'conduit:active-student:';
const SESSION_TTL = 60 * 60 * 24; // 24 hours

function sessionKey(userId: number): string {
  return `${SESSION_KEY_PREFIX}${userId}`;
}

/**
 * Get the active student for a parent user.
 * Returns null if no session is set.
 */
export async function getActiveStudent(
  userId: number,
): Promise<{ studentId: number; studentName: string } | null> {
  try {
    const raw = await redis.get(sessionKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { studentId: number; studentName: string };
    return parsed;
  } catch (err) {
    logger.error({ err, userId }, 'Failed to get active student from session');
    return null;
  }
}

/**
 * Set the active student for a parent user.
 * TTL resets on each write.
 */
export async function setActiveStudent(
  userId: number,
  studentId: number,
  studentName: string,
): Promise<void> {
  try {
    await redis.set(
      sessionKey(userId),
      JSON.stringify({ studentId, studentName }),
      'EX',
      SESSION_TTL,
    );
  } catch (err) {
    logger.error({ err, userId, studentId }, 'Failed to set active student in session');
    throw err;
  }
}

/**
 * Clear the active student session for a user.
 */
export async function clearSession(userId: number): Promise<void> {
  try {
    await redis.del(sessionKey(userId));
  } catch (err) {
    logger.error({ err, userId }, 'Failed to clear session');
    throw err;
  }
}
