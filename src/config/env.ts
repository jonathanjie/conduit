import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  // Bot
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
  BOT_USERNAME: z.string().min(1, 'BOT_USERNAME is required'),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1, 'TELEGRAM_WEBHOOK_SECRET is required'),
  ADMIN_CHAT_ID: z.string().min(1, 'ADMIN_CHAT_ID is required'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid postgres URL'),
  APP_ENCRYPTION_KEY: z.string().length(64, 'APP_ENCRYPTION_KEY must be 64 hex chars (32 bytes)'),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Dashboard Auth
  DASHBOARD_SESSION_SECRET: z.string().min(32, 'DASHBOARD_SESSION_SECRET must be at least 32 chars'),
  BCRYPT_COST_FACTOR: z.coerce.number().min(10).max(14).default(12),

  // Webhook (production only)
  WEBHOOK_URL: z.string().url().optional(),
});

function loadEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    console.error(`\n❌ Environment validation failed:\n${missing}\n`);
    console.error('Copy .env.example to .env and fill in the required values.\n');
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
export type Env = z.infer<typeof envSchema>;
