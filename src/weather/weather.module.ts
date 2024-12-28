import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { LocationsModule } from '../locations/locations.module';
import { WeatherController } from './weather.controller';
import { CustomLogger } from '../logger.service'
import { Locations } from '../Locations/entities/locations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisConfig } from '../config/redis.config';
import { RateLimiterService } from '../rateLimit/rateLimit.service';

@Module({
  imports: [
    CacheModule.register(redisConfig),
    LocationsModule,
    TypeOrmModule.forFeature([Locations]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService,RateLimiterService, CustomLogger],
})
export class WeatherModule {}