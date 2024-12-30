import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Unique(['cityId', 'date'])
@Entity('weather_forecast')
export class WeatherForecast {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cityId: number;

  @Column('json')
  data: object; 

  @Column()
  date: string; 

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) 
  updatedAt: Date;
} 