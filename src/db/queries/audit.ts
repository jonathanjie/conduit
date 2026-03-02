import { query } from '../client.js';
import type { MessageDirection, MessageType } from '../../types/index.js';

/**
 * Insert a relay audit log entry.
 * This is called fire-and-forget from the relay path — errors are logged but never propagated.
 */
export async function insertAuditLog(params: {
  sourceUserId: number;
  targetUserId: number;
  studentId: number;
  direction: MessageDirection;
  messageType: MessageType;
  relayedMessageId?: number;
}): Promise<void> {
  await query(
    `INSERT INTO message_audit_log
     (source_user_id, target_user_id, student_id, direction, message_type, relayed_message_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      params.sourceUserId,
      params.targetUserId,
      params.studentId,
      params.direction,
      params.messageType,
      params.relayedMessageId ?? null,
    ],
  );
}
