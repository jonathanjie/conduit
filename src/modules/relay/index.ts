import { redis } from '../../lib/redis.js';
import { logger } from '../../lib/logger.js';
import { logRelay } from '../audit/index.js';
import type { ConduitContext } from '../../bot/context.js';
import type { MessageType } from '../../types/index.js';

const RELAY_CONTEXT_TTL = 60 * 60 * 24; // 24 hours in seconds

function relayContextKey(teacherChatId: string, contentMessageId: number): string {
  return `relay:${teacherChatId}:${contentMessageId}`;
}

/**
 * Detect the message type from context for audit logging.
 */
export function detectMessageType(ctx: ConduitContext): MessageType {
  const msg = ctx.message;
  if (!msg) return 'other';
  if (msg.text) return 'text';
  if (msg.photo) return 'photo';
  if (msg.video) return 'video';
  if (msg.voice) return 'voice';
  if (msg.document) return 'document';
  if (msg.sticker) return 'sticker';
  if (msg.animation) return 'animation';
  return 'other';
}

/**
 * Relay a parent's message to the teacher.
 * Sends a student name header, copies the original message, and stores relay context in Redis.
 */
export async function relayParentToTeacher(
  ctx: ConduitContext,
  params: {
    teacherChatId: string;
    studentName: string;
    studentId: number;
    parentUserId: number;
    teacherUserId: number;
  },
): Promise<void> {
  const { teacherChatId, studentName, studentId, parentUserId, teacherUserId } = params;

  // Step 1: Send the student name header
  await ctx.api.sendMessage(teacherChatId, `${studentName} — Parent:`);

  // Step 2: Copy the original message (preserves media, formatting, etc.)
  // We store relay context keyed by the copied message ID so that when the teacher
  // replies to the actual content (not the header), the lookup succeeds.
  const copiedMsg = await ctx.api.copyMessage(teacherChatId, ctx.chat!.id, ctx.message!.message_id);

  // Step 3: Store relay context in Redis for reply routing
  const key = relayContextKey(teacherChatId, copiedMsg.message_id);
  const relayContext = JSON.stringify({
    parentChatId: String(ctx.chat!.id),
    studentId,
    parentUserId,
  });
  await redis.set(key, relayContext, 'EX', RELAY_CONTEXT_TTL);

  // Step 4: Fire-and-forget audit log
  logRelay({
    sourceUserId: parentUserId,
    targetUserId: teacherUserId,
    studentId,
    direction: 'parent_to_teacher',
    messageType: detectMessageType(ctx),
  });

  logger.debug(
    { parentUserId, teacherUserId, studentId, teacherChatId },
    'Relayed parent → teacher',
  );
}

/**
 * Relay a teacher's reply back to the parent.
 * Copies the teacher's message to the parent chat.
 */
export async function relayTeacherToParent(
  ctx: ConduitContext,
  params: {
    parentChatId: string;
    studentId: number;
    teacherUserId: number;
    parentUserId: number;
  },
): Promise<void> {
  const { parentChatId, studentId, teacherUserId, parentUserId } = params;

  // Copy teacher's message to parent
  await ctx.api.copyMessage(parentChatId, ctx.chat!.id, ctx.message!.message_id);

  // Fire-and-forget audit log
  logRelay({
    sourceUserId: teacherUserId,
    targetUserId: parentUserId,
    studentId,
    direction: 'teacher_to_parent',
    messageType: detectMessageType(ctx),
  });

  logger.debug(
    { teacherUserId, parentUserId, studentId, parentChatId },
    'Relayed teacher → parent',
  );
}

/**
 * Look up the relay context (parentChatId, studentId, parentUserId) for a teacher's reply.
 * The teacher replies to the copied content message; we look up by that message ID.
 */
export async function resolveParentFromReply(
  teacherChatId: string,
  replyToMessageId: number,
): Promise<{ parentChatId: string; studentId: number; parentUserId: number } | null> {
  const key = relayContextKey(teacherChatId, replyToMessageId);
  const raw = await redis.get(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      parentChatId: string;
      studentId: number;
      parentUserId: number;
    };
    return parsed;
  } catch (err) {
    logger.error({ err, key }, 'Failed to parse relay context from Redis');
    return null;
  }
}
