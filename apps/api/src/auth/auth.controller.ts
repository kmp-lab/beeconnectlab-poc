import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialRegisterDto } from './dto/social-register.dto';
import {
  ResetPasswordRequestDto,
  ResetPasswordConfirmDto,
} from './dto/reset-password.dto';
import { UserGuard } from './guards/user.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto.email, dto.password);
    this.authService.setCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Get('kakao')
  kakaoLogin() {
    // Placeholder: In production, redirect to Kakao OAuth
    return { message: 'Kakao OAuth endpoint - implement with passport-kakao' };
  }

  @Get('google')
  googleLogin() {
    // Placeholder: In production, redirect to Google OAuth
    return {
      message: 'Google OAuth endpoint - implement with passport-google',
    };
  }

  @Post('register/social')
  async socialRegister(
    @Body() dto: SocialRegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.socialRegister(dto);
    this.authService.setCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordRequestDto) {
    return this.authService.resetPasswordRequest(dto.email);
  }

  @Post('reset-password/confirm')
  @HttpCode(HttpStatus.OK)
  async resetPasswordConfirm(@Body() dto: ResetPasswordConfirmDto) {
    return this.authService.resetPasswordConfirm(dto.token, dto.newPassword);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'No refresh token' });
    }

    const payload = this.authService.verifyRefreshToken(refreshToken);
    const tokens = this.authService.generateTokens({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
    this.authService.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Tokens refreshed' };
  }

  @Get('me')
  @UseGuards(UserGuard)
  async me(@Req() req: Request) {
    const jwtUser = (req as Request & { user: { id: string } }).user;
    const user = await this.usersService.findById(jwtUser.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.clearCookies(res);
    return { message: 'Logged out successfully' };
  }
}
