import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { UserFavoriteLocations } from './entities/userFavoriteLocations.entity';
import { Locations } from './entities/locations.entity';
import { CustomLogger } from '../logger.service'
import { RateLimiterService } from '../rateLimit/rateLimit.service';
import { CacheModule } from '@nestjs/cache-manager';
import { redisConfig } from '../config/redis.config'; // Import the redis configuration

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