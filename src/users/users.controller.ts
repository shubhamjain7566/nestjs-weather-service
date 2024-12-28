import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/users.dto';
import { Users } from './entities/users.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser (@Body() createUserDto: CreateUserDto): Promise<Users> {
    try {
        return this.userService.createUser(createUserDto);
    } catch(error){
        throw error;
    }
  }
}