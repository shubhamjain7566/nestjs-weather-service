// src/dto/user-favorite-locations.dto.ts
import { IsNumber, IsNotEmpty } from 'class-validator';

export class UserFavoriteLocationsDto {
  @IsNumber()
  @IsNotEmpty()
  cityId: number; // Reference to the Locations entity

  @IsNumber()
  @IsNotEmpty()
  userId: number; // Reference to the User entity
}