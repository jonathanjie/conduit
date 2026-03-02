import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected PostgreSQL pool error');
});

pool.on('connect', () => {
  logger.debug('New PostgreSQL connection acquired');
});

/**
 * Execute a query with parameters. Returns rows.
 */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  if (duration > 500) {
    logger.warn({ duration, query: text.slice(0, 100) }, 'Slow query detected');
  }

  return result;
}

/**
 * Health check — returns true if a simple query succeeds.
 */
export async function dbHealthCheck(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Gracefully close the pool (for shutdown).
 */
export async function closePool(): Promise<void> {
  await pool.end();
  logger.info('PostgreSQL pool closed');
}
