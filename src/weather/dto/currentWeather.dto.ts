import { ApiProperty } from '@nestjs/swagger'; 
import { IsNumber, IsNotEmpty, IsObject, IsString } from 'class-validator'; 

export class CurrentWeatherDto {
  
  @ApiProperty({
    description: 'The unique identifier for the city',
    example: 12345,
  })
  @IsNumber()
  @IsNotEmpty()
  cityId: number;

  @ApiProperty({
    description: 'Weather data for the city (object containing various weather attributes)',
    example: { temperature: 22.5, humidity: 60 }, 
  })
  @IsObject()
  @IsNotEmpty()
  data: object;

  @ApiProperty({
    description: 'Date when the weather data was recorded',
    example: '2024-12-30T14:00:00Z',
  })
  @IsString()
  @IsNotEmpty()
  date: string;
}
