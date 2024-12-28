import { Entity, Column, PrimaryGeneratedColumn, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Locations } from './locations.entity'; // Adjust the import based on your project structure

@Entity('user_favorite_locations')
@Unique(['cityId', 'userId']) // Ensure that each user can only have one favorite location per city
export class UserFavoriteLocations {
  @PrimaryGeneratedColumn()
  id: number; // Unique identifier for the favorite location

  @Column()
  cityId: number; // Foreign key referencing the Locations entity

  @Column()
  userId: number; // Foreign key referencing the User entity (assuming you have a User entity)

  @ManyToOne(() => Locations, location => location.userFavoriteLocations, { eager: true }) // Establish relationship with Locations
  @JoinColumn({ name: 'cityId', referencedColumnName: 'id' }) // Specify the join column
  location: Locations; // Reference to the Locations entity
}