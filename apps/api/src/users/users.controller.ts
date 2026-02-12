import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UserGuard } from '../auth/guards/user.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(UserGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req: Request) {
    const jwtUser = (req as Request & { user: { id: string } }).user;
    const user = await this.usersService.getProfile(jwtUser.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender,
      profileImageUrl: user.profileImageUrl,
      residence: user.residence,
      activityStatus: user.activityStatus,
      interestRegions: user.interestRegions,
      desiredJob: user.desiredJob,
      skills: user.skills,
      marketingConsent: user.marketingConsent,
      createdAt: user.createdAt,
    };
  }

  @Patch('me')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const jwtUser = (req as Request & { user: { id: string } }).user;
    const user = await this.usersService.updateProfile(jwtUser.id, dto);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender,
      profileImageUrl: user.profileImageUrl,
      residence: user.residence,
      activityStatus: user.activityStatus,
      interestRegions: user.interestRegions,
      desiredJob: user.desiredJob,
      skills: user.skills,
      marketingConsent: user.marketingConsent,
      createdAt: user.createdAt,
    };
  }

  @Get('me/applications')
  async getApplications(@Req() req: Request) {
    const jwtUser = (req as Request & { user: { id: string } }).user;
    const applications = await this.usersService.getApplications(jwtUser.id);
    return applications.map((app) => ({
      id: app.id,
      announcementName: app.announcement?.name ?? '-',
      jobType: app.announcement?.jobType ?? '-',
      region: app.announcement?.program
        ? `${app.announcement.program.regionSido}`
        : '-',
      createdAt: app.createdAt,
      fileUrl1: app.fileUrl1,
      fileName1: app.fileName1,
      fileUrl2: app.fileUrl2,
      fileName2: app.fileName2,
      status: app.status,
    }));
  }

  @Get('me/activities')
  async getActivities(@Req() req: Request) {
    const jwtUser = (req as Request & { user: { id: string } }).user;
    const activities = await this.usersService.getActivities(jwtUser.id);
    return activities.map((act) => ({
      id: act.id,
      programName: act.program?.name ?? '-',
      region: act.program
        ? `${act.program.regionSido}${act.program.regionSigungu ? ' ' + act.program.regionSigungu : ''}`
        : '-',
      activityStartDate: act.program?.activityStartDate ?? null,
      activityEndDate: act.program?.activityEndDate ?? null,
      participationStatus: act.participationStatus,
    }));
  }
}
