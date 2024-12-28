// src/dto/location.dto.ts
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class LocationDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}