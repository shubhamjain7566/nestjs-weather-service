import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/users.dto';
import { Users } from './entity/users.entity';
import { RateLimiterGuard } from '../rateLimit/rateLimit.guard';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';

@UseGuards(RateLimiterGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'Successfully created the user.',
    type: Users,
  })
  async createUser (@Body() createUserDto: CreateUserDto): Promise<Users> {
    try {
      return this.userService.createUser(createUserDto);
    } catch(error){
      throw error;
    }
  }
}