import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { AnnouncementsService } from './announcements.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { RecruitStatus } from '@beeconnectlab/shared-types';

@Controller('admin/announcements')
@UseGuards(AdminGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  async list(@Query('recruitStatus') recruitStatus?: RecruitStatus) {
    return this.announcementsService.findAll(recruitStatus);
  }

  @Post()
  async create(@Body() dto: CreateAnnouncementDto, @Req() req: Request) {
    const admin = (req as Request & { user: { id: string } }).user;
    return this.announcementsService.create(dto, admin.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const announcement = await this.announcementsService.findById(id);
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    return announcement;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.announcementsService.remove(id);
    return { message: 'Announcement deleted successfully' };
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string, @Req() req: Request) {
    const admin = (req as Request & { user: { id: string } }).user;
    return this.announcementsService.duplicate(id, admin.id);
  }
}
