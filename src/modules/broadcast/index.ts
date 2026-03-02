import { Queue, Worker, type Job, type ConnectionOptions } from 'bullmq';
import type { Api } from 'grammy';
import { logger } from '../../lib/logger.js';
import { checkAndWait } from '../admin/rate-limiter.js';
import { insertBroadcastLog, completeBroadcastLog } from '../../db/queries/admin.js';
import { env } from '../../config/env.js';
import type { BroadcastParams } from '../../types/index.js';

// ── Connection config ─────────────────────────────────────────────────────────
// BullMQ bundles its own ioredis version — passing the shared ioredis Redis
// instance causes TypeScript type conflicts between the two copies.
// We pass connection options derived from the same REDIS_URL instead.

function buildBullConnection(): ConnectionOptions {
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: parseInt(url.port || '6379', 10),
    // BullMQ requires this to be null (not 3) to avoid blocking queue operations
    maxRetriesPerRequest: null,
    ...(url.password ? { password: url.password } : {}),
    ...(url.username ? { username: url.username } : {}),
  };
}

const bullConnection = buildBullConnection();

// ── Queue definition ──────────────────────────────────────────────────────────

const QUEUE_NAME = 'conduit:broadcast';

// Use string union for the job name type so BullMQ's generics are satisfied
export const broadcastQueue = new Queue<BroadcastJobData, void, 'send'>(QUEUE_NAME, {
  connection: bullConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

// ── Job data types ────────────────────────────────────────────────────────────

export interface BroadcastJobData {
  broadcastLogId: number;
  adminUserId: number;
  adminChatId: string;
  scope: string;
  messageText: string;
  targetChatIds: string[];
}

// ── Enqueue ───────────────────────────────────────────────────────────────────

/**
 * Enqueue a broadcast job.
 * Inserts a broadcast_log row and returns the BullMQ job ID.
 */
export async function enqueueBroadcast(
  params: BroadcastParams & { adminChatId: string },
): Promise<string> {
  const { adminUserId, adminChatId, scope, messageText, targetChatIds } = params;

  const broadcastLogId = await insertBroadcastLog({
    adminUserId,
    scope,
    messagePreview: messageText,
    targetCount: targetChatIds.length,
  });

  const job = await broadcastQueue.add('send', {
    broadcastLogId,
    adminUserId,
    adminChatId,
    scope,
    messageText,
    targetChatIds,
  });

  logger.info(
    { jobId: job.id, broadcastLogId, targetCount: targetChatIds.length, scope },
    'Broadcast job enqueued',
  );

  return job.id!;
}

// ── Worker ────────────────────────────────────────────────────────────────────

/**
 * Start the BullMQ worker that processes broadcast jobs.
 * Rate-limited to max 25 messages/second (Telegram safe limit).
 * Call once at application startup after the bot API is ready.
 */
export function startBroadcastWorker(botApi: Api): void {
  const worker = new Worker<BroadcastJobData, void, 'send'>(
    QUEUE_NAME,
    async (job: Job<BroadcastJobData, void, 'send'>) => {
      const { broadcastLogId, adminChatId, messageText, targetChatIds } = job.data;

      let delivered = 0;
      let failed = 0;

      for (const chatId of targetChatIds) {
        try {
          // Respect per-chat and global rate limits before each send
          await checkAndWait(chatId);
          await botApi.sendMessage(chatId, messageText);
          delivered++;
        } catch (err) {
          failed++;
          logger.warn(
            { err, chatId, broadcastLogId },
            'Broadcast send failed for chat — continuing',
          );
        }
      }

      // Update broadcast_log with final counts
      try {
        await completeBroadcastLog({
          logId: broadcastLogId,
          deliveredCount: delivered,
          failedCount: failed,
        });
      } catch (err) {
        logger.error({ err, broadcastLogId }, 'Failed to update broadcast_log completion');
      }

      // Notify the admin who triggered the broadcast
      try {
        const summary =
          `Broadcast complete.\n` +
          `Sent: ${delivered}/${targetChatIds.length}` +
          (failed > 0 ? `\nFailed: ${failed}` : '');
        await botApi.sendMessage(adminChatId, summary);
      } catch (err) {
        logger.warn({ err, adminChatId }, 'Could not notify admin of broadcast completion');
      }

      logger.info(
        { broadcastLogId, delivered, failed, total: targetChatIds.length },
        'Broadcast job completed',
      );
    },
    {
      connection: bullConnection,
      // BullMQ limiter: max 25 jobs starting per second at the queue level.
      // Combined with per-send checkAndWait, this is belt-and-suspenders protection.
      limiter: {
        max: 25,
        duration: 1000,
      },
      concurrency: 1, // Process one broadcast at a time to keep rate limiting clean
    },
  );

  worker.on('failed', (job, err) => {
    logger.error(
      { err, jobId: job?.id, broadcastLogId: job?.data.broadcastLogId },
      'Broadcast job exhausted retries',
    );

    // Notify admin of failure if we have their chat ID
    if (job?.data.adminChatId) {
      botApi
        .sendMessage(
          job.data.adminChatId,
          'Broadcast job failed after all retries. Check server logs for details.',
        )
        .catch(() => {
          /* best effort */
        });
    }
  });

  worker.on('error', (err) => {
    logger.error({ err }, 'Broadcast worker error');
  });

  logger.info('Broadcast worker started');
}

// ── Queue health ──────────────────────────────────────────────────────────────

export interface BroadcastQueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export async function getBroadcastQueueStats(): Promise<BroadcastQueueStats> {
  const [waiting, active, completed, failed] = await Promise.all([
    broadcastQueue.getWaitingCount(),
    broadcastQueue.getActiveCount(),
    broadcastQueue.getCompletedCount(),
    broadcastQueue.getFailedCount(),
  ]);
  return { waiting, active, completed, failed };
}
