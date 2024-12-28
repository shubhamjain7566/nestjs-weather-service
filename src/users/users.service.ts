import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { CreateUserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';
import { CustomLogger } from '../logger.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private logger: CustomLogger,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<Users> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); // Hash the password
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword, // Store the hashed password
    });

    try {
      let savedUser = await this.usersRepository.save(user);
      delete savedUser.password;
      return savedUser;
    } catch (error) {
        this.logger.error(`User Post Error: ${error.stack}`);
      if (error.code === '23505') { 
        this.logger.warn(`Username already exists: ${createUserDto.userName}`);
        throw new ConflictException('Username already exists');
      }
      // Handle other database errors
      throw error;
    }
  }

  async findOne(cond): Promise<Users|null> {
    try {
      return await this.usersRepository.findOne({where : cond});
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }
}