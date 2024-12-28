import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Cache } from 'cache-manager';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimiterService {
  private rateLimiter: RateLimiterRedis;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    const redisClient = (this.cacheManager.store as any).getClient() as Redis;

    this.rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
    });
  }

  async limit(key: string, points: number, duration: number): Promise<void> {
    try {
      const limiter = new RateLimiterRedis({
        storeClient: (this.cacheManager.store as any).getClient() as Redis,
        points, // Custom points
        duration, // Custom duration
      });
      await limiter.consume(key);
    } catch (err) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
