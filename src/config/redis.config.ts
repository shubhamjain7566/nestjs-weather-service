import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';  // Ensure you have installed the correct package

export const redisConfig: CacheModuleOptions = {
  store: redisStore,
  host: process.env.REDIS_HOST || 'localhost',  // Default to localhost or fetch from environment
  port: parseInt(process.env.REDIS_PORT, 10) || 6379, // Default to 6379
  ttl: 3600,  // Default TTL of 1 hour
};
