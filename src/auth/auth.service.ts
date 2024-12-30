import { Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RateLimiterGuard } from '../rateLimit/rateLimit.guard';

@UseGuards(RateLimiterGuard)
@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOne({ userName : loginDto?.userName});
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException("Password or username is invalid.");
    }
    const payload = { username: user.userName, userId: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}