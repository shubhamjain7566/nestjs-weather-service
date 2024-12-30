import { Entity, Column, PrimaryGeneratedColumn, Unique, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Locations } from './locations.entity';

@Entity('user_favorite_locations')
@Unique(['cityId', 'userId'])
export class UserFavoriteLocations {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cityId: number;

  @Column()
  userId: number;

  @ManyToOne(() => Locations, location => location.userFavoriteLocations, { eager: true })
  @JoinColumn({ name: 'cityId', referencedColumnName: 'id' })
  location: Locations;
 
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  
}