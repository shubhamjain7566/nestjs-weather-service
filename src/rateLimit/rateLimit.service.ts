import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager'; 
import { CACHE_MANAGER } from '@nestjs/cache-manager'; 

@Injectable()
export class RateLimiterService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async limit(key: string, points: number, duration: number): Promise<boolean> {
    const currentTime = Date.now();
    const bucketKey = `rateLimit:${key}`;  // Unique key for each IP + URL pair

    const bucket: any = await this.cache.get(bucketKey);

    if (!bucket) {
      const newBucket = {
        tokens: points,
        lastRefillTime: currentTime,
      };
      await this.cache.set(bucketKey, newBucket, duration );
      return true; 
    }

    const { tokens, lastRefillTime } = bucket;

    const elapsedTime = currentTime - lastRefillTime;
    
    const refillRate = points / duration;
    const newTokens = Math.min(
      points,
      tokens + Math.floor(elapsedTime / 1000) * refillRate 
    );

    if (newTokens > 0) {
      const updatedBucket = {
        tokens: newTokens - 1, 
        lastRefillTime: currentTime,
      };
      await this.cache.set(bucketKey, updatedBucket, duration );
      return true;
    } else {
      return false;
    }
  }
}
