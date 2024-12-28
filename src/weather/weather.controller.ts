import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { RateLimit } from '../rateLimit/rateLimit.decorator';
import { RateLimiterGuard } from '../rateLimit/rateLimit.guard';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @RateLimit(5, 30) // 5 requests per 30 seconds
  @UseGuards(RateLimiterGuard)
  @Get(':city')
  async getCurrentWeather(@Param('city') city: string) {
    return await this.weatherService.getCurrentWeather(city);
  }

  @RateLimit(3, 30)
  @UseGuards(RateLimiterGuard)
  @Get('forecast/:city')
  async getForecast(@Param('city') city: string) {
    return await this.weatherService.getForecast(city);
  }
}