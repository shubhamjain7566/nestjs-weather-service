import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { RateLimit } from '../rateLimit/rateLimit.decorator';
import { RateLimiterGuard } from '../rateLimit/rateLimit.guard';

@ApiTags('Weather') 
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @RateLimit(5, 30)
  @UseGuards(RateLimiterGuard) 
  @Get(':city')
  @ApiOperation({ summary: 'Get current weather for a city' }) 
  @ApiParam({ name: 'city', description: 'The name of the city to get current weather for', example: 'London' }) // Param description for Swagger
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched current weather data.',
  })
  @ApiResponse({
    status: 404,
    description: 'City not found.',
  })
  async getCurrentWeather(@Param('city') city: string) {
    return await this.weatherService.getCurrentWeather(city);
  }

  @RateLimit(3, 30) 
  @UseGuards(RateLimiterGuard)
  @Get('forecast/:city')
  @ApiOperation({ summary: 'Get weather forecast for a city' })
  @ApiParam({ name: 'city', description: 'The name of the city to get forecast data for', example: 'London' }) // Param description for Swagger
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched weather forecast data.',
  })
  @ApiResponse({
    status: 404,
    description: 'City not found.',
  })
  async getForecast(@Param('city') city: string) {
    return await this.weatherService.getWeatherForecast(city);
  }
}
