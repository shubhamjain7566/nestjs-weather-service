import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis'; 

export const redisConfig: CacheModuleOptions = {
  store: redisStore,
  host: process.env.REDIS_HOST || 'localhost',  
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  ttl: 3600,  // Default TTL of 1 hour
};
