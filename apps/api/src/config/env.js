import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_VERSION: z.string().default('v1'),
  REQUEST_ID_PREFIX: z.string().default('req_'),

  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.coerce.number().int().min(0).default(2),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).default(10),

  REDIS_URL: z.string(),
  REDIS_PREFIX: z.string().default('eduomr:'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_EXPIRY_SECONDS: z.coerce.number().int().positive().default(604800),
  JWT_ISSUER: z.string().default('eduomr'),

  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(16).default(12),

  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_PHONE_NUMBER_ID: z.string().optional(),
  META_WEBHOOK_TOKEN: z.string().optional(),
  META_API_VERSION: z.string().default('v18.0'),

  SMTP_HOST: z.string().default('smtp.sendgrid.net'),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().default('apikey'),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().default('noreply@eduomr.com'),
  FROM_NAME: z.string().default('EduOMR'),

  BULL_PREFIX: z.string().default('eduomr:bull'),
  BULL_REDIS_URL: z.string().optional(),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(1000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  ANSWER_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_FILE_PATH: z.string().default('logs/app.log'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = Object.freeze(parsed.data);
