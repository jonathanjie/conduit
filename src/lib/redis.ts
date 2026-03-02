import IORedis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

export const redis = new IORedis.default(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 200, 5000);
    logger.warn({ attempt: times, delay }, 'Redis connection retry');
    return delay;
  },
  lazyConnect: false,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err: Error) => {
  logger.error({ err }, 'Redis connection error');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

/**
 * Health check — returns true if Redis responds to PING.
 */
export async function redisHealthCheck(): Promise<boolean> {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}
