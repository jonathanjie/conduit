import { insertAuditLog } from '../../db/queries/audit.js';
import { logger } from '../../lib/logger.js';
import type { MessageDirection, MessageType } from '../../types/index.js';

/**
 * Fire-and-forget audit log entry for a relayed message.
 * Errors are logged but never propagated — this MUST NOT block the relay hot path.
 */
export function logRelay(params: {
  sourceUserId: number;
  targetUserId: number;
  studentId: number;
  direction: MessageDirection;
  messageType: MessageType;
  relayedMessageId?: number;
}): void {
  setImmediate(() => {
    insertAuditLog(params).catch((err) => {
      logger.error(
        {
          err,
          sourceUserId: params.sourceUserId,
          targetUserId: params.targetUserId,
          direction: params.direction,
        },
        'Audit log insert failed',
      );
    });
  });
}
