import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from '../../src/locations/locations.controller';
import { LocationsService } from '../../src/locations/locations.service';
import { AuthGuard } from '../../src/auth/auth.guard';
import { RateLimiterGuard } from '../../src/rateLimit/rateLimit.guard';
import { UserFavoriteLocationsDto } from '../../src/locations/dto/userFavoriteLocations.dto';

describe('LocationsController', () => {
  let controller: LocationsController;
  let locationsService: LocationsService;

  const mockLocationsService = {
    getLocations: jest.fn(),
    addFavoriteLocations: jest.fn(),
    getFavoriteLocations: jest.fn(),
    removeFavoriteLocations: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockRateLimiterGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        {
          provide: LocationsService,
          useValue: mockLocationsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RateLimiterGuard)
      .useValue(mockRateLimiterGuard)
      .compile();

    controller = module.get<LocationsController>(LocationsController);
    locationsService = module.get<LocationsService>(LocationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLocations', () => {
    it('should return a list of locations', async () => {
      const locations = [{ city: 'City1' }, { city: 'City2' }];
      mockLocationsService.getLocations.mockResolvedValue(locations);

      const result = await controller.getLocations();

      expect(locationsService.getLocations).toHaveBeenCalled();
      expect(result).toEqual(locations);
    });
  });

  describe('addFavoriteLocation', () => {
    it('should add a favorite location for a user', async () => {
      const userFavoriteLocationDto = { cityId: 1 } as UserFavoriteLocationsDto;
      const user = { userId: 123 };
      const addedLocation = { cityId: 1, userId: 123 };
      mockLocationsService.addFavoriteLocations.mockResolvedValue(addedLocation);

      const result = await controller.addFavoriteLocation(userFavoriteLocationDto, user);

      expect(locationsService.addFavoriteLocations).toHaveBeenCalledWith(
        userFavoriteLocationDto.cityId,
        user.userId,
      );
      expect(result).toEqual(addedLocation);
    });
  });

  describe('getFavoriteLocations', () => {
    it('should return a list of favorite locations for a user', async () => {
      const user = { userId: 123 };
      const favoriteLocations = [{ cityId: 1 }, { cityId: 2 }];
      mockLocationsService.getFavoriteLocations.mockResolvedValue(favoriteLocations);

      const result = await controller.getFavoriteLocations(user);

      expect(locationsService.getFavoriteLocations).toHaveBeenCalledWith(user.userId);
      expect(result).toEqual(favoriteLocations);
    });
  });

  describe('removeFavoriteLocation', () => {
    it('should remove a favorite location for a user', async () => {
      const favId = 1;
      const user = { userId: 123 };
      mockLocationsService.removeFavoriteLocations.mockResolvedValue({});

      await controller.removeFavoriteLocation(favId, user);

      expect(locationsService.removeFavoriteLocations).toHaveBeenCalledWith(favId, user.userId);
    });
  });
});
