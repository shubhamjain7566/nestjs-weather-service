import { ApiProperty } from '@nestjs/swagger'; 
import { IsNotEmpty, IsString, IsEmail } from 'class-validator'; 

export class CreateUserDto {
  
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',  
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The username of the user (should be unique)',
    example: 'johndoe123',  
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail() 
  userName: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'password123',  
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
