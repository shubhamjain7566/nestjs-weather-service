import { ApiProperty } from '@nestjs/swagger'; 
import { IsNumber, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class WeatherForecastDto {
  
  @ApiProperty({
    description: 'The unique identifier for the city',
    example: 12345,
  })
  @IsNumber()
  @IsNotEmpty()
  cityId: number;

  @ApiProperty({
    description: 'Weather forecast data for the city (object containing various weather attributes)',
    example: { temperature: 22.5, humidity: 60 },
  })
  @IsObject()
  @IsNotEmpty()
  data: object;

  @ApiProperty({
    description: 'Date for the weather forecast',
    example: '2024-12-30T14:00:00Z', 
  })
  @IsString()
  @IsNotEmpty()
  date: string;
}
