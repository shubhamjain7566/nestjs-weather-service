import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { WeatherService } from './weather.service';

@Resolver()
export class WeatherResolver {
  constructor(private readonly weatherService: WeatherService) {}

  @Query(() => String)
  async getCurrentWeather(@Args('city') city: string) {
    const weather = await this.weatherService.getCurrentWeather(city);
    return JSON.stringify(weather);
  }

  @Query(() => String)
  async getWeatherForecast(@Args('city') city: string) {
    const forecast = await this.weatherService.getWeatherForecast(city);
    return JSON.stringify(forecast);
  }
}
