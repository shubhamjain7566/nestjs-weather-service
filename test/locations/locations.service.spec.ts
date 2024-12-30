import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from '../../src/locations/locations.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserFavoriteLocations } from '../../src/locations/entity/userFavoriteLocations.entity';
import { Locations } from '../../src/locations/entity/locations.entity';
import { CustomLogger } from '../../src/logger.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('LocationsService', () => {
  let service: LocationsService;
  let userFavoriteLocationsRepository: Repository<UserFavoriteLocations>;
  let locationsRepository: Repository<Locations>;
  let logger: CustomLogger;

  const mockUserFavoriteLocationsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockLocationsRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockLogger = {
    error: jest.fn(),
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: getRepositoryToken(UserFavoriteLocations),
          useValue: mockUserFavoriteLocationsRepository,
        },
        {
          provide: getRepositoryToken(Locations),
          useValue: mockLocationsRepository,
        },
        {
          provide: CustomLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    userFavoriteLocationsRepository = module.get(getRepositoryToken(UserFavoriteLocations));
    locationsRepository = module.get(getRepositoryToken(Locations));
    logger = module.get<CustomLogger>(CustomLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addFavoriteLocations', () => {
    it('should add a favorite location for a user', async () => {
      const cityId = 1;
      const userId = 123;
      const location = { id: cityId };
      const favoriteLocation = { cityId, userId };

      mockLocationsRepository.findOne.mockResolvedValue(location);
      mockUserFavoriteLocationsRepository.create.mockReturnValue(favoriteLocation);
      mockUserFavoriteLocationsRepository.save.mockResolvedValue(favoriteLocation);

      const result = await service.addFavoriteLocations(cityId, userId);

      expect(locationsRepository.findOne).toHaveBeenCalledWith({ where: { id: cityId } });
      expect(userFavoriteLocationsRepository.create).toHaveBeenCalledWith({ cityId, userId });
      expect(userFavoriteLocationsRepository.save).toHaveBeenCalledWith(favoriteLocation);
      expect(result).toEqual(favoriteLocation);
    });

    it('should throw NotFoundException if location is not found', async () => {
      mockLocationsRepository.findOne.mockResolvedValue(null);

      await expect(service.addFavoriteLocations(1, 123)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if location already exists for user', async () => {
      const error = { code: '23505' };
      mockLocationsRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserFavoriteLocationsRepository.save.mockRejectedValue(error);

      await expect(service.addFavoriteLocations(1, 123)).rejects.toThrow(ConflictException);
    });
  });

  describe('getFavoriteLocations', () => {
    it('should return a list of favorite locations for a user', async () => {
      const userId = 123;
      const favoriteLocations = [{ cityId: 1, userId }];

      mockUserFavoriteLocationsRepository.find.mockResolvedValue(favoriteLocations);

      const result = await service.getFavoriteLocations(userId);

      expect(userFavoriteLocationsRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['location'],
      });
      expect(result).toEqual(favoriteLocations);
    });
  });

  describe('getLocations', () => {
    it('should return a list of locations', async () => {
      const locations = [{ id: 1, city: 'City1' }, { id: 2, city: 'City2' }];
      mockLocationsRepository.find.mockResolvedValue(locations);

      const result = await service.getLocations();

      expect(locationsRepository.find).toHaveBeenCalledWith({});
      expect(result).toEqual(locations);
    });
  });

  describe('getLocationByCity', () => {
    it('should return a location by city name', async () => {
      const city = 'City1';
      const location = { id: 1, city: 'City1' };
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(location),
      };

      mockLocationsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getLocationByCity(city);

      expect(queryBuilder.where).toHaveBeenCalledWith('LOWER(location.city) ILIKE LOWER(:city)', { city });
      expect(result).toEqual(location);
    });
  });

  describe('removeFavoriteLocations', () => {
    it('should remove a favorite location for a user', async () => {
      const id = 1;
      const userId = 123;
      const location = { id, userId };

      mockUserFavoriteLocationsRepository.findOne.mockResolvedValue(location);
      mockUserFavoriteLocationsRepository.delete.mockResolvedValue(null);

      await service.removeFavoriteLocations(id, userId);

      expect(userFavoriteLocationsRepository.findOne).toHaveBeenCalledWith({ where: { id, userId } });
      expect(userFavoriteLocationsRepository.delete).toHaveBeenCalledWith({ id, userId });
    });

    it('should throw NotFoundException if location is not found', async () => {
      mockUserFavoriteLocationsRepository.findOne.mockResolvedValue(null);

      await expect(service.removeFavoriteLocations(1, 123)).rejects.toThrow(NotFoundException);
    });
  });
});
