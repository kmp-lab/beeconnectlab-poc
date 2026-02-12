import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from '../database/entities/announcement.entity';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { PublicAnnouncementsController } from './public-announcements.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Announcement])],
  providers: [AnnouncementsService],
  controllers: [AnnouncementsController, PublicAnnouncementsController],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
