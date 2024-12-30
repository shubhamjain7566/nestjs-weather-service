import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Unique(['cityId', 'date'])
@Entity('current_weather')
export class CurrentWeather {
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