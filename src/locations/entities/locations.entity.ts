import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany } from 'typeorm';
import { UserFavoriteLocations } from './userFavoriteLocations.entity';

@Entity('locations')
@Unique(['city', 'country']) // Ensure that each city-country combination is unique
export class Locations {
  @PrimaryGeneratedColumn()
  id: number; // Unique identifier for the location

  @Column()
  city: string; // Name of the city

  @Column()
  country: string; // Name of the country

  @Column('decimal', { precision: 10, scale: 8 }) // Use decimal for latitude and longitude
  lat: number; // Latitude of the location

  @Column('decimal', { precision: 10, scale: 8 }) // Use decimal for latitude and longitude
  lng: number; // Longitude of the location

  @OneToMany(() => UserFavoriteLocations, userFavoriteLocation => userFavoriteLocation.location) // Establish relationship with UserFavoriteLocations
  userFavoriteLocations: UserFavoriteLocations[]; // Reference to the UserFavoriteLocations entity
}