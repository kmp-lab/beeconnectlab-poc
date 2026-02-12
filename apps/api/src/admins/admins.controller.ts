import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import * as bcrypt from 'bcrypt';
import { AdminsService } from './admins.service';
import { AuthService } from '../auth/auth.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminStatus } from '@beeconnectlab/shared-types';

@Controller('admin')
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly authService: AuthService,
  ) {}

  @Post('auth/register')
  async register(@Body() dto: AdminRegisterDto) {
    const existing = await this.adminsService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const admin = await this.adminsService.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      phone: dto.phone,
      organization: dto.organization ?? '비커넥트랩',
    });

    return {
      id: admin.id,
      email: admin.email,
      status: admin.status,
      message: 'Registration pending approval',
    };
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const admin = await this.adminsService.findByEmail(dto.email);
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (admin.status !== AdminStatus.APPROVED) {
      throw new ForbiddenException('Account not yet approved');
    }

    const tokens = this.authService.generateTokens({
      sub: admin.id,
      email: admin.email,
      role: 'admin',
    });
    this.authService.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        organization: admin.organization,
      },
    };
  }

  @Get('auth/me')
  @UseGuards(AdminGuard)
  async me(@Req() req: Request) {
    const currentAdmin = (req as Request & { user: { id: string } }).user;
    const admin = await this.adminsService.findById(currentAdmin.id);
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      organization: admin.organization,
    };
  }

  @Get('accounts')
  @UseGuards(AdminGuard)
  async listAccounts() {
    const admins = await this.adminsService.findAll();
    return admins.map((a) => ({
      id: a.id,
      email: a.email,
      name: a.name,
      phone: a.phone,
      organization: a.organization,
      status: a.status,
      createdAt: a.createdAt,
      approvedAt: a.approvedAt,
    }));
  }

  @Patch('accounts/:id/approve')
  @UseGuards(AdminGuard)
  async approveAccount(@Param('id') id: string, @Req() req: Request) {
    const currentAdmin = (req as Request & { user: { id: string } }).user;
    const admin = await this.adminsService.findById(id);
    if (!admin) {
      throw new BadRequestException('Admin not found');
    }
    if (admin.status === AdminStatus.APPROVED) {
      throw new BadRequestException('Admin already approved');
    }

    const approved = await this.adminsService.approve(id, currentAdmin.id);
    return {
      id: approved.id,
      email: approved.email,
      status: approved.status,
      approvedAt: approved.approvedAt,
    };
  }

  @Delete('accounts/:id')
  @UseGuards(AdminGuard)
  async deleteAccount(@Param('id') id: string, @Req() req: Request) {
    const currentAdmin = (req as Request & { user: { id: string } }).user;

    if (currentAdmin.id === id) {
      throw new BadRequestException('Cannot delete your own account');
    }

    const activeCount = await this.adminsService.countActive();
    const targetAdmin = await this.adminsService.findById(id);
    if (!targetAdmin) {
      throw new BadRequestException('Admin not found');
    }

    if (targetAdmin.status === AdminStatus.APPROVED && activeCount <= 1) {
      throw new BadRequestException('Cannot delete the last approved admin');
    }

    await this.adminsService.softDelete(id);
    return { message: 'Admin deleted successfully' };
  }
}
