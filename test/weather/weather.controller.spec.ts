import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from '../../src/weather/weather.controller';
import { WeatherService } from '../../src/weather/weather.service';
import { RateLimiterService } from '../../src/rateLimit/rateLimit.service';
import { Reflector } from '@nestjs/core';
import { WeatherConstants } from '../../src/weather/weather.constants';
import {  NotFoundException } from '@nestjs/common';

describe('WeatherController', () => {
  let weatherController: WeatherController;
  let weatherService: WeatherService;

  const mockWeatherService = {
    getCurrentWeather: jest.fn(),
    getWeatherForecast: jest.fn(),
  };

  const mockRateLimiterService = {
    // Mock methods of RateLimiterService if needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
        {
          provide: RateLimiterService,
          useValue: mockRateLimiterService,
        },
        Reflector, // Include Reflector if it's used in the guard
      ],
    }).compile();

    weatherController = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should return current weather for a given city', async () => {
      const city = 'London';
      const result = {
        city,
        lat: 51.5074,
        lng: -0.1278,
        weatherData: { temperature: 20, condition: 'Sunny' },
      };
      mockWeatherService.getCurrentWeather.mockResolvedValue(result);

      const response = await weatherController.getCurrentWeather(city);
      expect(response).toBe(result);
      expect(mockWeatherService.getCurrentWeather).toHaveBeenCalledWith(city);
    });

    it('should throw a NotFoundException if city is not found', async () => {
      const city = 'UnknownCity';
      mockWeatherService.getCurrentWeather.mockRejectedValue(new NotFoundException('City not found'));

      await expect(weatherController.getCurrentWeather(city)).rejects.toThrow(NotFoundException);
      expect(mockWeatherService.getCurrentWeather).toHaveBeenCalledWith(city);
    });
  });

  describe('getForecast', () => {
    it('should return weather forecast for a given city', async () => {
      const city = 'London';
      const result = {
        city,
        lat: 51.5074,
        lng: -0.1278,
        weatherData: [
          { day: 'Monday', temperature: 18, condition: 'Cloudy' },
          { day: 'Tuesday', temperature: 22, condition: 'Sunny' },
        ],
      };
      mockWeatherService.getWeatherForecast.mockResolvedValue(result);

      const response = await weatherController.getForecast(city);
      expect(response).toBe(result);
      expect(mockWeatherService.getWeatherForecast).toHaveBeenCalledWith(city);
    });

    it('should throw a NotFoundException if forecast data is not found', async () => {
      const city = 'UnknownCity';
      mockWeatherService.getWeatherForecast.mockRejectedValue(new NotFoundException('Weather forecast not found'));

      await expect(weatherController.getForecast(city)).rejects.toThrow(NotFoundException);
      expect(mockWeatherService.getWeatherForecast).toHaveBeenCalledWith(city);
    });
  });
});