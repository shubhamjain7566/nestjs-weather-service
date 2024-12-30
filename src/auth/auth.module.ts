
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/users.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisConfig } from '../cache/redis.config';
import { RateLimiterService } from '../rateLimit/rateLimit.service';

@Module({
  imports: [
    UserModule,
    CacheModule.register(redisConfig),
  ],
  controllers: [AuthController],
  providers: [AuthService, RateLimiterService],
  exports: [AuthService],
})
export class AuthModule {}
