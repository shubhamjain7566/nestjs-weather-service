import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserFavoriteLocations } from './userFavoriteLocations.entity';

@Entity('locations')
@Unique(['city', 'country'])
export class Locations {
  @PrimaryGeneratedColumn()
  id: number; 

  @Column()
  city: string;

  @Column()
  country: string;

  @Column('decimal', { precision: 10, scale: 8 })
  lat: number;

  @Column('decimal', { precision: 10, scale: 8 })
  lng: number;

  @OneToMany(() => UserFavoriteLocations, userFavoriteLocation => userFavoriteLocation.location)
  userFavoriteLocations: UserFavoriteLocations[]; 

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

}