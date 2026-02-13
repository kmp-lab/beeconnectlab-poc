import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Response, Request } from 'express';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  socialRegister: jest.fn(),
  setCookies: jest.fn(),
  clearCookies: jest.fn(),
  verifyRefreshToken: jest.fn(),
  generateTokens: jest.fn(),
};

const mockUsersService = {
  findById: jest.fn(),
};

function createMockResponse(): Partial<Response> {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };
}

function createMockRequest(
  cookies: Record<string, string> = {},
): Partial<Request> {
  return { cookies };
}

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/register', () => {
    it('should register and return user id and email', async () => {
      mockAuthService.register.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });

      const result = await controller.register({
        email: 'test@example.com',
        password: 'Test123!@#',
        name: 'Test',
        phone: '010-0000-0000',
        birthDate: '1990-01-01',
        gender: 'male' as any,
        termsAccepted: true,
      });

      expect(result).toEqual({ id: 'user-1', email: 'test@example.com' });
      expect(mockAuthService.register).toHaveBeenCalled();
    });
  });

  describe('POST /auth/login', () => {
    it('should login and set cookies', async () => {
      const loginResult = {
        user: { id: 'user-1', email: 'test@example.com', name: 'Test' },
        accessToken: 'at',
        refreshToken: 'rt',
      };
      mockAuthService.login.mockResolvedValue(loginResult);
      const res = createMockResponse() as Response;

      const result = await controller.login(
        { email: 'test@example.com', password: 'Test123!@#' },
        res,
      );

      expect(result).toEqual({ user: loginResult.user });
      expect(mockAuthService.setCookies).toHaveBeenCalledWith(res, 'at', 'rt');
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear cookies and return message', async () => {
      const res = createMockResponse() as Response;

      const result = await controller.logout(res);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockAuthService.clearCookies).toHaveBeenCalledWith(res);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens when refresh_token cookie exists', async () => {
      const req = createMockRequest({
        refresh_token: 'valid-rt',
      }) as Request;
      const res = createMockResponse() as Response;

      mockAuthService.verifyRefreshToken.mockReturnValue({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'user',
      });
      mockAuthService.generateTokens.mockReturnValue({
        accessToken: 'new-at',
        refreshToken: 'new-rt',
      });

      const result = await controller.refresh(req, res);

      expect(result).toEqual({ message: 'Tokens refreshed' });
      expect(mockAuthService.setCookies).toHaveBeenCalledWith(
        res,
        'new-at',
        'new-rt',
      );
    });

    it('should return 401 when no refresh_token cookie', async () => {
      const req = createMockRequest({}) as Request;
      const res = createMockResponse() as Response;

      await controller.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({ message: 'No refresh token' });
    });
  });

  describe('GET /auth/me', () => {
    it('should return user profile when authenticated', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        phone: '010-0000-0000',
      };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const req = { user: { id: 'user-1' } } as any;
      const result = await controller.me(req);

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        phone: '010-0000-0000',
      });
    });
  });
});
