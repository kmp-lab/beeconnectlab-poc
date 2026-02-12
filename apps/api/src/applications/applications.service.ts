import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../database/entities/application.entity';
import { Announcement } from '../database/entities/announcement.entity';
import {
  ApplicationStatus,
  PublishStatus,
  RecruitStatus,
} from '@beeconnectlab/shared-types';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
  ) {}

  private computeRecruitStatus(announcement: Announcement): RecruitStatus {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(announcement.recruitStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(announcement.recruitEndDate);
    end.setHours(0, 0, 0, 0);

    if (today < start) return RecruitStatus.UPCOMING;
    if (today > end) return RecruitStatus.CLOSED;
    return RecruitStatus.RECRUITING;
  }

  async create(
    dto: CreateApplicationDto,
    userId: string,
  ): Promise<Application> {
    // Verify announcement exists, is published, and is recruiting
    const announcement = await this.announcementRepo.findOne({
      where: { id: dto.announcementId },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.publishStatus !== PublishStatus.PUBLISHED) {
      throw new BadRequestException(
        'Cannot apply to an unpublished announcement',
      );
    }

    const recruitStatus = this.computeRecruitStatus(announcement);
    if (recruitStatus !== RecruitStatus.RECRUITING) {
      throw new BadRequestException(
        'Cannot apply: recruitment is not currently open',
      );
    }

    const application = this.applicationRepo.create({
      ...dto,
      userId,
      status: ApplicationStatus.SUBMITTED,
    });

    return this.applicationRepo.save(application);
  }
}
