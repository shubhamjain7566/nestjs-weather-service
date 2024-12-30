import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { LoginDto } from '../../src/auth/dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { RateLimiterService } from '../../src/rateLimit/rateLimit.service';

// Mock RateLimiterService
const mockRateLimiterService = {
  checkLimit: jest.fn().mockResolvedValue(true),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: RateLimiterService,
          useValue: mockRateLimiterService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should call AuthService.login with the correct arguments', async () => {
      const loginDto: LoginDto = {
        userName: 'testUser ',
        password: 'testPassword',
      };

      mockAuthService.login.mockResolvedValueOnce({ access_token: 'test_token' });

      const result = await authController.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({ access_token: 'test_token' });
    });

    it('should throw UnauthorizedException if AuthService.login fails', async () => {
      const loginDto: LoginDto = {
        userName: 'invalidUser ',
        password: 'wrongPassword',
      };

      mockAuthService.login.mockRejectedValueOnce(new UnauthorizedException('Invalid credentials'));

      await expect(authController.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});