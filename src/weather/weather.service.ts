import { Injectable, NotFoundException, Inject  } from '@nestjs/common';
import axios from 'axios';
import { CustomLogger } from '../logger.service'; 
import { LocationsService } from '../locations/locations.service';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { get } from 'lodash';
import * as moment from 'moment';  // Import moment
let apiKey:string, apiUrl:string;

@Injectable()
export class WeatherService {
  constructor(
    private readonly logger: CustomLogger,
    private configService: ConfigService,
    private locationsService: LocationsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    apiKey = this.configService.get('WEATHER_API_KEY');
    apiUrl = this.configService.get('WEATHER_API_URL');
  }

  private calculateTTLForNextHour(): number {
    const now = moment.utc();
    const nextHour = now.add(1, 'hour').startOf('hour');
    const ttlInSeconds = nextHour.diff(now, 'seconds');
    if(ttlInSeconds == 0){
      return 3600;
    }
    return ttlInSeconds;
  }
  
  private calculateTTLForLastHourOfDay(): number {
     const now = moment.utc();
     const endOfDay = moment.utc().endOf('day');
     const ttlInSeconds = endOfDay.diff(now, 'seconds');     
     return ttlInSeconds;
  }

  async getCurrentWeather(city: string) {
    try {

      const cacheKey = `weather:current:${city}`;
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        this.logger.log(`Cache hit for current weather in ${city}`);
        return cachedData;
      }
      
      const location = await this.locationsService.getLocationByCity(city);
      if (!location) {
        throw new NotFoundException(`City not found`);
      }
      const url = `${apiUrl}/forecast?location=${location.city}&apikey=${apiKey}&timesteps=1h`;
      const response = await axios.get(url);
      let resp = {
        city : city,
        lat: location.lat,  
        lng: location.lng,
        timelines : get(response, 'data.timelines.hourly', {})
      };
      await this.cacheManager.set(cacheKey, resp, this.calculateTTLForNextHour() );
      this.logger.log(`Data Stored in cache current weather in ${city} : ${resp}`);
      return resp;
    } catch (error) {
      this.logger.error(`Failed to fetch current weather for ${city}`, error.stack);
      throw error;
    }
  }

  async getForecast(city: string) {
    try {
      
      const cacheKey = `weather:forecast:${city}`;
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        this.logger.log(`Cache hit for current weather in ${city}`);
        return cachedData;
      }

      const location = await this.locationsService.getLocationByCity(city);
      if (!location) {
        throw new NotFoundException(`City not found`);
      }
      
      const url = `${apiUrl}/forecast?location=${location.city}&apikey=${apiKey}&timesteps=1d`;
      const response = await axios.get(url);
      let resp = {
        city : city,
        lat: location.lat,  
        lng: location.lng,
        timelines : get(response, 'data.timelines.daily', {})
      };
      await this.cacheManager.set(cacheKey, resp, this.calculateTTLForLastHourOfDay() );
      this.logger.log(`Data Stored in cache weather forecast in ${city} : ${resp}`);
      return resp;
    } catch(error){
        this.logger.error(`Failed to fetch weather forecast for ${city}`, error.stack);
        throw error;
    }
  }
}