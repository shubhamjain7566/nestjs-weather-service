import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { LocationsModule } from '../locations/locations.module';
import { WeatherController } from './weather.controller';
import { CustomLogger } from '../logger.service'
import { Locations } from '../locations/entity/locations.entity';
import { CurrentWeather } from './entity/currentWeather.entity';
import { WeatherForecast } from './entity/weatherForecast.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisConfig } from '../cache/redis.config';
import { RateLimiterService } from '../rateLimit/rateLimit.service';
import { WeatherResolver } from './weather.resolver';

@Module({
  imports: [
    CacheModule.register(redisConfig),
    LocationsModule,
    TypeOrmModule.forFeature([Locations, CurrentWeather, WeatherForecast])
  ],
  controllers: [WeatherController],
  providers: [WeatherService,RateLimiterService, CustomLogger, WeatherResolver],
})
export class WeatherModule {}