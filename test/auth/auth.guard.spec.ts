import { AuthGuard } from '../../src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { CustomLogger } from '../../src/logger.service';
import { ExecutionContext } from '@nestjs/common/interfaces';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let logger: CustomLogger;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockLogger = {
    error: jest.fn(),
  };

  const mockExecutionContext: Partial<ExecutionContext> = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
    }),
  };

  beforeEach(() => {
    jwtService = mockJwtService as unknown as JwtService;
    logger = mockLogger as unknown as CustomLogger;
    authGuard = new AuthGuard(jwtService, logger);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if token is valid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      };
      mockExecutionContext.switchToHttp().getRequest = jest.fn().mockReturnValue(mockRequest);

      mockJwtService.verifyAsync.mockResolvedValueOnce({ userId: 1, username: 'testUser' });

      const result = await authGuard.canActivate(mockExecutionContext as ExecutionContext);

      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('validToken');
      expect(mockRequest['user']).toEqual({ userId: 1, username: 'testUser' });
    });

    it('should throw UnauthorizedException if token is missing', async () => {
      const mockRequest = { headers: {} };
      mockExecutionContext.switchToHttp().getRequest = jest.fn().mockReturnValue(mockRequest);

      await expect(authGuard.canActivate(mockExecutionContext as ExecutionContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalidToken',
        },
      };
      mockExecutionContext.switchToHttp().getRequest = jest.fn().mockReturnValue(mockRequest);

      mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('Invalid token'));

      await expect(authGuard.canActivate(mockExecutionContext as ExecutionContext)).rejects.toThrow(UnauthorizedException);
      expect(mockLogger.error).toHaveBeenCalledWith('Auth Gurad Failure::', expect.any(Error));
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should return token if authorization header is valid', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      } as any;

      const token = authGuard['extractTokenFromHeader'](mockRequest);

      expect(token).toBe('validToken');
    });

    it('should return undefined if authorization header is missing', () => {
      const mockRequest = { headers: {} } as any;

      const token = authGuard['extractTokenFromHeader'](mockRequest);

      expect(token).toBeUndefined();
    });

    it('should return undefined if authorization header is not a Bearer token', () => {
      const mockRequest = {
        headers: {
          authorization: 'Basic invalidToken',
        },
      } as any;

      const token = authGuard['extractTokenFromHeader'](mockRequest);

      expect(token).toBeUndefined();
    });
  });
});
