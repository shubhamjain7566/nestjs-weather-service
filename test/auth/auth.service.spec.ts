import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UserService } from '../../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Users } from '../../src/users/entity/users.entity';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from '../../src/rateLimit/rateLimit.service';
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockRateLimiterService = {};

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
            provide: RateLimiterService,
            useValue: mockRateLimiterService,
        },
        Reflector, 
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const loginDto = { userName: 'testUser', password: 'testPassword' };
      const user = { id: 1, userName: 'testUser', password: 'testPassword' } as Users;
      const payload = { username: user.userName, userId: user.id };
      const token = 'testAccessToken';

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
      const result = await service.login(loginDto);
      expect(userService.findOne).toHaveBeenCalledWith({ userName: loginDto.userName });
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ access_token: token });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      const loginDto = { userName: 'invalidUser', password: 'testPassword' }
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(userService.findOne).toHaveBeenCalledWith({ userName: loginDto.userName });
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = { userName: 'testUser', password: 'invalidPassword' };
      const user = { id: 1, userName: 'testUser', password: 'hashedPassword' } as Users;

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(userService.findOne).toHaveBeenCalledWith({ userName: loginDto.userName });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
    });
  });
});
