import {
  Controller,
  Get,
  Param,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
export class PublicAnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  async list() {
    return this.announcementsService.findPublished();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const announcement = await this.announcementsService.findPublishedById(id);
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    // Increment view count (fire-and-forget)
    this.announcementsService.incrementViewCount(id);
    return announcement;
  }
}
