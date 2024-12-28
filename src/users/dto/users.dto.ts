import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class CreateUserDto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  userName: string;

  @Exclude() // Exclude the password from serialization
  @Column()
  password: string; // In a real application, make sure to hash passwords!
}