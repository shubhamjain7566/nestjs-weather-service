import { Test, TestingModule } from '@nestjs/testing';
import { WeatherResolver } from '../../src/weather/weather.resolver';
import { WeatherService } from '../../src/weather/weather.service';

describe('WeatherResolver', () => {
  let resolver: WeatherResolver;
  let weatherService: WeatherService;

  const mockWeatherService = {
    getCurrentWeather: jest.fn(),
    getWeatherForecast: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherResolver,
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
      ],
    }).compile();

    resolver = module.get<WeatherResolver>(WeatherResolver);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getCurrentWeather', () => {
    it('should return the current weather for a city', async () => {
      const city = 'TestCity';
      const weatherData = { city, temperature: 25 };
      mockWeatherService.getCurrentWeather.mockResolvedValue(weatherData);

      const result = await resolver.getCurrentWeather(city);

      expect(weatherService.getCurrentWeather).toHaveBeenCalledWith(city);
      expect(result).toEqual(JSON.stringify(weatherData));
    });

    it('should throw an error if WeatherService throws an error', async () => {
      const city = 'InvalidCity';
      mockWeatherService.getCurrentWeather.mockRejectedValue(
        new Error('City not found'),
      );

      await expect(resolver.getCurrentWeather(city)).rejects.toThrowError(
        'City not found',
      );
      expect(weatherService.getCurrentWeather).toHaveBeenCalledWith(city);
    });
  });

  describe('getWeatherForecast', () => {
    it('should return the weather forecast for a city', async () => {
      const city = 'TestCity';
      const forecastData = { city, forecast: ['Sunny', 'Rainy'] };
      mockWeatherService.getWeatherForecast.mockResolvedValue(forecastData);

      const result = await resolver.getWeatherForecast(city);

      expect(weatherService.getWeatherForecast).toHaveBeenCalledWith(city);
      expect(result).toEqual(JSON.stringify(forecastData));
    });

    it('should throw an error if WeatherService throws an error', async () => {
      const city = 'InvalidCity';
      mockWeatherService.getWeatherForecast.mockRejectedValue(
        new Error('City not found'),
      );

      await expect(resolver.getWeatherForecast(city)).rejects.toThrowError(
        'City not found',
      );
      expect(weatherService.getWeatherForecast).toHaveBeenCalledWith(city);
    });
  });
});
