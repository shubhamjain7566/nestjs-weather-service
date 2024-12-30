import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class LocationDto {
  @ApiProperty({
    example: 'London',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    example: 'UK',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    example: 51.5074,
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    example: -0.1278,
  })
  @IsNumber()
  lng: number;
}
