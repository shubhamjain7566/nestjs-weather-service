import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFavoriteLocations } from './entity/userFavoriteLocations.entity';
import { Locations } from './entity/locations.entity';
import { CustomLogger } from '../logger.service'

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(UserFavoriteLocations)
    private userFavoriteLocationsRepository: Repository<UserFavoriteLocations>,
    @InjectRepository(Locations)
    private LocationsRepository: Repository<Locations>,
    private readonly logger: CustomLogger
  ) {}

  async addFavoriteLocations(cityId: number, userId: number): Promise<UserFavoriteLocations> {
    try {
      const location = await this.LocationsRepository.findOne({ where : { id: cityId }});
      if (!location) {
        this.logger.error(`Add Location Not found FOR CITY ID ${cityId} and user ID ${userId}`);
        throw new NotFoundException(`City not found`);
      }
      const favLocation = this.userFavoriteLocationsRepository.create({ cityId, userId });
      const addedLocation = await this.userFavoriteLocationsRepository.save(favLocation);
      this.logger.log(`Add Location FOR ${userId} AND ${cityId} data :: ${JSON.stringify(addedLocation)}`);
      return addedLocation;
    } catch(error){
      this.logger.error("Add Location Service Error", error);
      if (error.code === '23505') {
        throw new ConflictException(`Location already exists for user ${userId}`);
      }
      throw error;
    }
  }

  async getFavoriteLocations(userId: number): Promise<UserFavoriteLocations[]> {
    try {
      const locations = await this.userFavoriteLocationsRepository.find({
        where: { userId },
        relations: ['location'], // Include the relation to the Locations entity
      });
      this.logger.log(`GET Location FOR ${userId} :: ${JSON.stringify(locations)}`);
      return locations;
    } catch(error){
      this.logger.error("Get Location Service Error", error);
      throw error;
    }
  }

  async getLocations(): Promise<Locations[]> {
    try {
      const locations = await this.LocationsRepository.find({});
      return locations;
    } catch(error){
      this.logger.error("Get Location Service Error", error);
      throw error;
    }
  }

  async getLocationByCity(city): Promise<Locations| null> {    
    return this.LocationsRepository.createQueryBuilder('location')
    .where('LOWER(location.city) ILIKE LOWER(:city)', { city }).getOne()   
  }

  async removeFavoriteLocations(id: number, userId: number): Promise<void> {
    try {
      const location = await this.userFavoriteLocationsRepository.findOne({ where: { id, userId } });
      if (!location) {
        this.logger.error(`Remove Location Not found for ID ${id} and user ID ${userId}`);
        throw new NotFoundException(`Location with id ${id} for user ${userId} not found`);
      }
      await this.userFavoriteLocationsRepository.delete({id, userId});
      this.logger.log(`ID ${id} Removed FOR ${userId}`);
      return;
    } catch(error){
      this.logger.error("Remove Location Service Error", error);
      throw error;
    }
  }

  async getAllFavoriteLocations(limit, skip): Promise<UserFavoriteLocations[]> {
    try {
      const locations = (await this.userFavoriteLocationsRepository.find({
        relations: ['location'], 
        where: {}, 
        take: limit ,
        skip
      }));
      this.logger.log(`GET ALL Favotites Location:: ${JSON.stringify(locations)}`);
      return locations;
    } catch(error){
      this.logger.error("Get Location Service Error", error);
      throw error;
    }
  }
}