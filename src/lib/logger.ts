import pino from 'pino';
import { env } from '../config/env.js';

const redactPaths = [
  'token',
  'secret',
  'password',
  'password_hash',
  'encryption_key',
  'telegram_id',
  'telegram_user_id',
  'chat_id',
  'req.headers.authorization',
  'req.headers["x-telegram-bot-api-secret-token"]',
];

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
});
