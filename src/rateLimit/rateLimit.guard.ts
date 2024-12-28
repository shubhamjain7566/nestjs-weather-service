import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from './rateLimit.service';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(
    private readonly rateLimiterService: RateLimiterService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.ip; // Unique key (e.g., user IP or ID)
    const customLimit = this.reflector.get<{ points: number; duration: number }>(
      'rateLimit',
      context.getHandler(),
    );

    if (customLimit) {
      const { points, duration } = customLimit;
      await this.rateLimiterService.limit(key, points, duration);
    } else {
      // Default rate limit (optional)
      await this.rateLimiterService.limit(key, 10, 60);
    }

    return true;
  }
}