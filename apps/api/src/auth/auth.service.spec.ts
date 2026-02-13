import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthProvider, Gender } from '@beeconnectlab/shared-types';
import { RegisterDto } from './dto/register.dto';

jest.mock('bcrypt');

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  updateLastLogin: jest.fn(),
  updatePassword: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('test'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  const validRegisterDto: RegisterDto = {
    email: 'test@example.com',
    password: 'Test123!@#',
    name: 'Test User',
    phone: '010-1234-5678',
    birthDate: '1990-01-01',
    gender: Gender.MALE,
    termsAccepted: true,
  };

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUsersService.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });

      const result = await service.register(validRegisterDto);

      expect(result).toEqual({ id: 'user-1', email: 'test@example.com' });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('Test123!@#', 10);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          passwordHash: 'hashed-password',
          provider: AuthProvider.EMAIL,
          name: 'Test User',
        }),
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'existing',
        email: 'test@example.com',
      });

      await expect(service.register(validRegisterDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException when terms not accepted', async () => {
      const dto = { ...validRegisterDto, termsAccepted: false };

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@example.com', 'Test123!@#');

      expect(result.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith('user-1');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login('no@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for user without password (social)', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: null,
      });

      await expect(
        service.login('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = service.generateTokens({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'user',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-1' }),
        { expiresIn: '1h' },
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-1' }),
        { expiresIn: '7d' },
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'user' as const,
      };
      mockJwtService.verify.mockReturnValue(payload);

      const result = service.verifyRefreshToken('valid-token');

      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException for invalid token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      expect(() => service.verifyRefreshToken('bad-token')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens for existing user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('new-access')
        .mockReturnValueOnce('new-refresh');

      const result = await service.refresh('test@example.com', 'user');

      expect(result.accessToken).toBe('new-access');
      expect(result.refreshToken).toBe('new-refresh');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.refresh('no@example.com', 'user')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for admin role', async () => {
      await expect(service.refresh('user-1', 'admin')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('resetPasswordRequest', () => {
    it('should return message for existing user and store token', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });

      const result = await service.resetPasswordRequest('test@example.com');

      expect(result.message).toContain('reset link has been sent');
      expect(result.token).toBeDefined();
    });

    it('should return same message for non-existent user (no leak)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.resetPasswordRequest('no@example.com');

      expect(result.message).toContain('reset link has been sent');
    });
  });

  describe('resetPasswordConfirm', () => {
    it('should reset password with valid token', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });
      // First generate a token
      mockUsersService.findByEmail.mockResolvedValueOnce({
        id: 'user-1',
        email: 'test@example.com',
      });
      const { token } = await service.resetPasswordRequest('test@example.com');

      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');

      const result = await service.resetPasswordConfirm(
        token!,
        'NewPass123!@#',
      );

      expect(result.message).toContain('reset successfully');
      expect(mockUsersService.updatePassword).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid token', async () => {
      await expect(
        service.resetPasswordConfirm('bad-token', 'NewPass123!@#'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
