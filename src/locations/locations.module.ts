import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { UserFavoriteLocations } from './entity/userFavoriteLocations.entity';
import { Locations } from './entity/locations.entity';
import { CustomLogger } from '../logger.service'
import { RateLimiterService } from '../rateLimit/rateLimit.service';
import { CacheModule } from '@nestjs/cache-manager';
import { redisConfig } from '../cache/redis.config';

@Module({
  imports: [
    CacheModule.register(redisConfig),
    TypeOrmModule.forFeature([UserFavoriteLocations, Locations]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService, CustomLogger, RateLimiterService],
  exports: [LocationsService],
})
export class LocationsModule {}