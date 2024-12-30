import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from '../../src/weather/weather.service';
import { CustomLogger } from '../../src/logger.service';
import { LocationsService } from '../../src/locations/locations.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios from 'axios';
import { NotFoundException } from '@nestjs/common';
import * as moment from 'moment';
import { get } from 'lodash';
import { Locations } from '../../src/locations/entity/locations.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CurrentWeather } from '../../src/weather/entity/currentWeather.entity';
import { WeatherForecast } from '../../src/weather/entity/weatherForecast.entity';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('axios');

jest.mock('axios');

describe('WeatherService', () => {
  let weatherService: WeatherService;
  let mockLogger: CustomLogger;
  let mockLocationsService: any;
  let mockCacheManager: any;
  let mockCurrentWeatherRepository: any;
  let mockWeatherForecastRepository: any;

  const mockCity = 'London';
  const mockLocation = { id: 1, lat: 51.5074, lng: -0.1278 };
  const mockCurrentWeatherData = { cityId: 1, data: { temperature: 20 }, createdAt: new Date() };
  const mockWeatherForecastData = { cityId: 1, data: { forecast: 'Sunny' }, createdAt: new Date() };

  beforeEach(async () => {
    mockLogger = { log: jest.fn(), error: jest.fn() } as any;
    mockLocationsService = { getLocationByCity: jest.fn() } as any;
    mockCacheManager = { get: jest.fn(), set: jest.fn() } as any;

    mockCurrentWeatherRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockWeatherForecastRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: CustomLogger, useValue: mockLogger },
        { provide: LocationsService, useValue: mockLocationsService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: getRepositoryToken(CurrentWeather), useValue: mockCurrentWeatherRepository },
        { provide: getRepositoryToken(WeatherForecast), useValue: mockWeatherForecastRepository },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('mockApiKey') } },
      ],
    }).compile();

    weatherService = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should return current weather data from cache', async () => {
      mockLocationsService.getLocationByCity.mockResolvedValue(mockLocation);
      mockCacheManager.get.mockResolvedValue({ weatherData: mockCurrentWeatherData });

      const result = await weatherService.getCurrentWeather(mockCity);

      expect(result).toEqual({ weatherData: mockCurrentWeatherData });
      expect(mockCacheManager.get).toHaveBeenCalledWith(expect.any(String));
    });

    it('should fetch current weather data from API if not in cache or DB', async () => {
      mockLocationsService.getLocationByCity.mockResolvedValue(mockLocation);
      mockCacheManager.get.mockResolvedValue(null);
      mockCurrentWeatherRepository.findOne.mockResolvedValue(null);
      (axios.get as jest.Mock).mockResolvedValue({ status: 200, data: { data: { values: mockCurrentWeatherData } } });

      const result = await weatherService.getCurrentWeather(mockCity);

      expect(result).toEqual({
        city: mockCity,
        lat: mockLocation.lat,
        lng: mockLocation.lng,
        weatherData: mockCurrentWeatherData,
      });
      expect(mockCurrentWeatherRepository.save).toHaveBeenCalledWith(expect.objectContaining({ cityId: mockLocation.id, data: mockCurrentWeatherData }));
    });

    it('should throw NotFoundException if city is not found', async () => {
      mockLocationsService.getLocationByCity.mockResolvedValue(null);

      await expect(weatherService.getCurrentWeather(mockCity)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if weather data is not found', async () => {
      mockLocationsService.getLocationByCity.mockResolvedValue(mockLocation);
      mockCacheManager.get.mockResolvedValue(null);
      mockCurrentWeatherRepository.findOne.mockResolvedValue(null);
      (axios.get as jest.Mock).mockResolvedValue({ status: 200, data: { data: { values: {} } } });

      await expect(weatherService.getCurrentWeather(mockCity)).rejects.toThrow(NotFoundException);
    });

    it('should handle errors from the API', async () => {
      mockLocationsService.getLocationByCity.mockResolvedValue(mockLocation);
      mockCacheManager.get.mockResolvedValue(null);
      mockCurrentWeatherRepository.findOne.mockResolvedValue(null);
      (axios.get as jest.Mock).mockRejectedValue(new Error('API Error'));
      await expect(weatherService.getCurrentWeather(mockCity)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getWeatherForecast', () => {
    it('should return weather forecast data from cache', async () => {
      mockLocationsService.getLocationByCity.mockResolvedValue(mockLocation);
      mockCacheManager.get.mockResolvedValue({ weatherData: mockWeatherForecastData });

      const result = await weatherService.getWeatherForecast(mockCity);

      expect(result).toEqual({ weatherData: mockWeatherForecastData });
      expect(mockCacheManager.get).toHaveBeenCalledWith(expect.any(String));
    });

    it('should fetch weather forecast data from API if not in cache or DB', async () => {
      mockLocationsService.getLocationByCity.mockResolvedValue(mockLocation);
      mockCacheManager.get.mockResolvedValue(null);
      mockWeatherForecastRepository.findOne.mockResolvedValue(null);
      (axios.get as jest.Mock).mockResolvedValue({ status: 200, data: { timelines: { daily: mockWeatherForecastData } } });

      const result = await weatherService.getWeatherForecast(mockCity);

      expect(result).toEqual({
        city: mockCity,
        lat: mockLocation.lat,
        lng: mockLocation.lng,
        weatherData: mockWeatherForecastData,
      });
      expect(mockWeatherForecastRepository.save).toHaveBeenCalledWith(expect.objectContaining({ cityId: mockLocation.id, data: mockWeatherForecastData }));
    });

    it('should throw NotFoundException if city is not found', async () => {
      mockLocationsService.getLocationByCity.mockResolvedValue(null);

      await expect(weatherService.getWeatherForecast(mockCity)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if forecast data is not found', async () => {
      mockLocationsService.getLocationByCity.mockResolvedValue(mockLocation);
      mockCacheManager.get.mockResolvedValue(null);
      mockWeatherForecastRepository.findOne.mockResolvedValue(null);
      (axios.get as jest.Mock).mockResolvedValue({ status: 200, data: { timelines: { daily: {} } } });

      await expect(weatherService.getWeatherForecast(mockCity)).rejects.toThrow(NotFoundException);
    });

    it('should handle errors from the API', async () => {
      mockLocationsService.getLocationByCity.mockResolvedValue(mockLocation);
      mockCacheManager.get.mockResolvedValue(null);
      mockWeatherForecastRepository.findOne.mockResolvedValue(null);
      (axios.get as jest.Mock).mockRejectedValue(new Error('API Error'));

      await expect(weatherService.getWeatherForecast(mockCity)).rejects.toThrow(InternalServerErrorException);
    });
  });
});