import Redis from 'ioredis';
import { env } from '../../config/env.js';

let redis;

function createRedisClient() {
  const client = new Redis(env.REDIS_URL, {
    keyPrefix: env.REDIS_PREFIX,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 5) {
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    maxRetriesPerRequest: 3,
  });

  client.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  client.on('connect', () => {
    console.log('Redis connected');
  });

  return client;
}

export function getRedis() {
  if (!redis) {
    redis = createRedisClient();
  }
  return redis;
}

export async function connectRedis() {
  try {
    await getRedis().connect();
  } catch (err) {
    console.error('Redis connection failed:', err.message);
  }
}

export async function disconnectRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export async function setCache(key, value, ttlSeconds = 300) {
  try {
    const serialized = JSON.stringify(value);
    await getRedis().setex(key, ttlSeconds, serialized);
  } catch (err) {
    console.error('Redis setCache error:', err.message);
  }
}

export async function getCache(key) {
  try {
    const value = await getRedis().get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('Redis getCache error:', err.message);
    return null;
  }
}

export async function delCache(key) {
  try {
    await getRedis().del(key);
  } catch (err) {
    console.error('Redis delCache error:', err.message);
  }
}
