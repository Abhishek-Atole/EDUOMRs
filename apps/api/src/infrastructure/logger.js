import winston from 'winston';
import { env } from '../config/env.js';

const { combine, timestamp, json, colorize, simple } = winston.format;

const isProd = env.NODE_ENV === 'production' || env.NODE_ENV === 'staging';
const isTest = env.NODE_ENV === 'test';

const transports = [];

if (!isTest) {
  transports.push(
    new winston.transports.Console({
      format: isProd ? combine(timestamp(), json()) : combine(colorize(), simple()),
    })
  );
  transports.push(
    new winston.transports.File({
      filename: env.LOG_FILE_PATH,
      format: combine(timestamp(), json()),
    })
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports,
  silent: isTest,
});
