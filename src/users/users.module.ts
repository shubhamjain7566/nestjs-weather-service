import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entity/users.entity';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { CustomLogger } from '../logger.service'
import { CacheModule } from '@nestjs/cache-manager';
import { redisConfig } from '../cache/redis.config';
import { RateLimiterService } from '../rateLimit/rateLimit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),     
    CacheModule.register(redisConfig),
],
  providers: [UserService, RateLimiterService, CustomLogger],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}