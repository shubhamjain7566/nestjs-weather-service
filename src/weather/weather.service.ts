import { Injectable, NotFoundException, Inject, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { CustomLogger } from '../logger.service';
import { LocationsService } from '../locations/locations.service';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { get, isEmpty } from 'lodash';
import * as moment from 'moment';
import { CurrentWeatherDto } from './dto/currentWeather.dto';
import { WeatherForecastDto } from './dto/weatherForecast.dto';
import { CurrentWeather } from './entity/currentWeather.entity';
import { WeatherForecast } from './entity/weatherForecast.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeatherConstants } from './weather.constants'; // Assuming you've defined constants
import { Locations } from '../locations/entity/locations.entity';
import { UserFavoriteLocations } from 'src/locations/entity/userFavoriteLocations.entity';
import { UserFavoriteLocationsDto } from 'src/locations/dto/userFavoriteLocations.dto';

let apiKey: string, apiUrl: string;

@Injectable()
export class WeatherService {
  constructor(
    @InjectRepository(CurrentWeather)
    private currentWeatherRepository: Repository<CurrentWeather>,
    @InjectRepository(WeatherForecast)
    private weatherForecastRepository: Repository<WeatherForecast>,
    private readonly logger: CustomLogger,
    private configService: ConfigService,
    private locationsService: LocationsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    apiKey = this.configService.get('WEATHER_API_KEY');
    apiUrl = this.configService.get('WEATHER_API_URL');
  }

  private calculateTTL(): number {
    const now = moment.utc();
    const endOfDay = moment.utc().endOf('day');
    const ttlInSeconds = endOfDay.diff(now, 'seconds');
    return ttlInSeconds;
  }

  private async getCurrentWeatherByCity(cityId: number, date: string): Promise<CurrentWeatherDto | null> {
    return this.currentWeatherRepository.findOne({
      where: {
        cityId,
        date
      }
    });
  }

  private getRepositoryAndData(type: string, cityId: number, weatherData: any, date: string) {
    switch (type) {
      case WeatherConstants.CURRENT:
        return {
          repository: this.currentWeatherRepository,
          data: { cityId, data: weatherData, date } as CurrentWeatherDto,
        };
      case WeatherConstants.FORECAST:
        return {
          repository: this.weatherForecastRepository,
          data: { cityId, data: weatherData, date } as WeatherForecastDto,
        };
      default:
        throw new InternalServerErrorException('Invalid weather type');
    }
  }

  private async saveDataToDb(cityId: number, weatherData: any, type: string, date: string) {
    try {
      const { repository, data } = this.getRepositoryAndData(type, cityId, weatherData, date);
      await repository.save(data);
    } catch (error) {
      this.logger.error(`Error saving data to DB: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error saving data to the database');
    }
  }

  private getWeatherApiThirdPatyUrl(apiUrl, city, apiKey, weatherType) {
    switch(weatherType){
      case WeatherConstants.CURRENT:
        return `${apiUrl}/realtime?location=${city}&apikey=${apiKey}`;
      case WeatherConstants.FORECAST:
        return `${apiUrl}/forecast?location=${city}&apikey=${apiKey}&timesteps=1d`
      default:
        throw new InternalServerErrorException('Invalid weather type')
    }
  }

  private async getWeatherDataFromThirdParty(apiUrl, city, apiKey, weatherType) {
    try {
      const url : any = this.getWeatherApiThirdPatyUrl(apiUrl, encodeURIComponent(city), apiKey, weatherType);
      const response = await axios.get(url);
      if (response.status !== 200) {
        this.logger.error(`Failed to fetch data for ${city} from Weather API :: ${response}`);
        throw new InternalServerErrorException('Failed to fetch data. Please try Again Later.');
      }
      this.logger.log(`API Response for ${city}: ${JSON.stringify(response.data)}`);
      return this.processWeatherData(weatherType, response.data);
    } catch (error) {
      this.logger.error(`Error fetching data from Weather API: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error fetching data from Weather API');
    }
  }
  
  private processWeatherData(type: string, data: any) {
    if (type === WeatherConstants.CURRENT) {
      return get(data, 'data.values', {});
    } else if (type === WeatherConstants.FORECAST) {
      return get(data, 'timelines.daily', {});
    } else {
      throw new Error('Invalid weather type');
    }
  }


  private getCacheKey(type: string, city: string, key: string = "") {
    return `${type}_${WeatherConstants.WEATHER}_${city}_${key}`;
  }

  private async getWeatherForecastByCity(cityId: number, date: string): Promise<WeatherForecastDto | null> {
    return this.weatherForecastRepository.findOne({
      where: {
        cityId,
        date: date
      }
    });
  }

  async getWeatherData(city: string, type: string, today:string = "") {
    try {
      today = today ||  moment.utc().startOf('day').format('YYYY-MM-DD');
      const cacheKey = this.getCacheKey(type, city, today);
      let saveToDb = false;

      const location = await this.locationsService.getLocationByCity(city);
      if (!location) {
        this.logger.log(`Location not found for city: ${city}`);
        throw new NotFoundException('City not found');
      }

      // Check cache first
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        this.logger.log(`Cache hit for ${type} in ${city}`);
        return cachedData;
      }

      const weatherDataDb = type === WeatherConstants.CURRENT
        ? await this.getCurrentWeatherByCity(location.id, today)
        : await this.getWeatherForecastByCity(location.id, today);

      this.logger.log(`${type} DB response for ${city}: ${JSON.stringify(weatherDataDb)}`);
      
      let weatherData = get(weatherDataDb, 'data', {});
      let response = this.getCacheAndSaveWeather(weatherData, city, type, saveToDb, today, location, cacheKey)

      this.logger.log(`Stored ${type} data in cache for ${city}: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch ${type} for ${city}`, error.stack);
      throw error;
    }
  }

  private async getCacheAndSaveWeather(weatherData: object, city: string, type: string, saveToDb: boolean, today: string, location: Locations, cacheKey: string){
    try {
      this.logger.log(`${type} Req Received for ${city}: ${JSON.stringify(weatherData)}`);

      if (isEmpty(weatherData)) {
        weatherData = await this.getWeatherDataFromThirdParty(apiUrl, city, apiKey, type);
        saveToDb = true;
      }

      if (isEmpty(weatherData)) {
        this.logger.log(`${type} weather data not found for ${city}`);
        throw new NotFoundException(`${type} weather data not found for ${city}`);
      }

      if (saveToDb) {
        await this.saveDataToDb(location.id, weatherData, type, today);
      }

      const response = {
        city,
        lat: location.lat,
        lng: location.lng,
        weatherData,
      };

      await this.cacheManager.set(cacheKey, response, this.calculateTTL());
      return response;
    } catch(error){
      this.logger.error(`Failed in getCacheAndSaveWeather: ${error.message}`);
      throw error;
    }
  }

  async getCurrentWeather(city: string) {
    return this.getWeatherData(city, WeatherConstants.CURRENT);
  }

  async getWeatherForecast(city: string) {
    return this.getWeatherData(city, WeatherConstants.FORECAST);
  }

  async updateWeatherDataForFavoriteCities() {
    let limit = 10;
    let skip = 0;
    let today = moment.utc().startOf('day').format('YYYY-MM-DD');
    const weatherTypes = [WeatherConstants.CURRENT, WeatherConstants.FORECAST]
    while(limit != -1){
      try {
        const favoriteLocations = await this.locationsService.getAllFavoriteLocations(limit,skip);
        if(isEmpty(favoriteLocations)){
          break;
        }
        skip = skip + favoriteLocations.length;
        for (const favoriteLocation of favoriteLocations) {
          
          for(const weatherType of weatherTypes){
            
            try {
              await this.getCacheAndSaveWeather(
                {}, 
                favoriteLocation.location.city,
                weatherType, 
                true, today,
                favoriteLocation.location,
                this.getCacheKey(weatherType, favoriteLocation.location.city, today)
              )
              this.logger.log(`Data added for favorite cities location : 
                ${favoriteLocation.location.city}, userID :  ${favoriteLocation.userId} `);
            } catch(error){
              this.logger.error(`Failed to add favorite cities weather for : 
                ${favoriteLocation.location.city}, userID :  ${favoriteLocation.userId}  
                error : ${error.message}`);
            }
          }
        }
      } catch(error){
        this.logger.error(`Failed to fetch favorite cities weather data: ${error.message}`);
        break;
      }
    } 
  }

}
