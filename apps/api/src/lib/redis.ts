import Redis from 'ioredis';
import {
  REDIS_DB,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  REDIS_USERNAME,
} from '@/constants/env';
import { getLogger } from '@/middlewares/logger';

const logger = getLogger();

export const connection = {
  port: REDIS_PORT,
  host: REDIS_HOST,
  db: REDIS_DB,
  
  ...(REDIS_USERNAME && { username: REDIS_USERNAME }),
  
  ...(REDIS_PASSWORD && { password: REDIS_PASSWORD }),
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null,
};

export const redisClient = new Redis(connection);

redisClient.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redisClient.on('error', (err) => {
  logger.error({ error: err.message }, '❌ Redis connection error');
});


export default redisClient;