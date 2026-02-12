import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { AuthProvider } from '@beeconnectlab/shared-types';
import { RegisterDto } from './dto/register.dto';
import { SocialRegisterDto } from './dto/social-register.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly resetTokens = new Map<
    string,
    { email: string; expiresAt: Date }
  >();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.termsAccepted) {
      throw new BadRequestException('Terms must be accepted');
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      provider: AuthProvider.EMAIL,
      name: dto.name,
      phone: dto.phone,
      birthDate: new Date(dto.birthDate),
      gender: dto.gender,
      residence: dto.residence,
      interestRegions: dto.interestRegions,
      desiredJob: dto.desiredJob,
      skills: dto.skills,
      marketingConsent: dto.marketingConsent ?? false,
    });

    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.usersService.updateLastLogin(user.id);

    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email,
      role: 'user',
    });
    return {
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    };
  }

  async socialRegister(dto: SocialRegisterDto) {
    if (!dto.termsAccepted) {
      throw new BadRequestException('Terms must be accepted');
    }

    // In a real implementation, we'd verify the accessToken with the provider
    // For now, we use the accessToken as the providerId
    const providerId = dto.accessToken;

    const existing = await this.usersService.findByEmail(
      dto.provider + '_' + providerId + '@social',
    );
    if (existing) {
      throw new ConflictException('Social account already registered');
    }

    const user = await this.usersService.create({
      email: dto.provider + '_' + providerId + '@social',
      passwordHash: null,
      provider: dto.provider,
      providerId,
      name: dto.name,
      phone: dto.phone,
      birthDate: new Date(dto.birthDate),
      gender: dto.gender,
      residence: dto.residence,
      interestRegions: dto.interestRegions,
      desiredJob: dto.desiredJob,
      skills: dto.skills,
      marketingConsent: dto.marketingConsent ?? false,
    });

    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email,
      role: 'user',
    });
    return {
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    };
  }

  async resetPasswordRequest(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const token = randomBytes(32).toString('hex');
    this.resetTokens.set(token, {
      email,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    // In production, send email with reset link
    return {
      message: 'If the email exists, a reset link has been sent',
      token,
    };
  }

  async resetPasswordConfirm(token: string, newPassword: string) {
    const entry = this.resetTokens.get(token);
    if (!entry || entry.expiresAt < new Date()) {
      this.resetTokens.delete(token);
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.usersService.findByEmail(entry.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, passwordHash);
    this.resetTokens.delete(token);

    return { message: 'Password has been reset successfully' };
  }

  async refresh(userId: string, role: 'user' | 'admin') {
    if (role === 'user') {
      const user = await this.usersService.findByEmail(userId);
      if (!user) throw new UnauthorizedException('User not found');
      return this.generateTokens({
        sub: user.id,
        email: user.email,
        role: 'user',
      });
    }
    // Admin refresh is handled in admin auth controller
    throw new UnauthorizedException('Invalid role');
  }

  generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  clearCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
