import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../database/entities/announcement.entity';
import { PublishStatus, RecruitStatus } from '@beeconnectlab/shared-types';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
  ) {}

  computeRecruitStatus(announcement: Announcement): RecruitStatus {
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

  private withComputedStatus(
    announcement: Announcement,
  ): Announcement & { computedRecruitStatus: RecruitStatus } {
    return {
      ...announcement,
      computedRecruitStatus: this.computeRecruitStatus(announcement),
    };
  }

  async findAll(
    recruitStatusFilter?: RecruitStatus,
  ): Promise<(Announcement & { computedRecruitStatus: RecruitStatus })[]> {
    const announcements = await this.announcementRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['program', 'createdBy'],
    });

    const withStatus = announcements.map((a) => this.withComputedStatus(a));

    if (recruitStatusFilter) {
      return withStatus.filter(
        (a) => a.computedRecruitStatus === recruitStatusFilter,
      );
    }
    return withStatus;
  }

  async findById(
    id: string,
  ): Promise<(Announcement & { computedRecruitStatus: RecruitStatus }) | null> {
    const announcement = await this.announcementRepo.findOne({
      where: { id },
      relations: ['program', 'createdBy'],
    });
    if (!announcement) return null;
    return this.withComputedStatus(announcement);
  }

  async findPublished(): Promise<
    (Announcement & { computedRecruitStatus: RecruitStatus })[]
  > {
    const announcements = await this.announcementRepo.find({
      where: { publishStatus: PublishStatus.PUBLISHED },
      order: { createdAt: 'DESC' },
      relations: ['program'],
    });

    return announcements.map((a) => this.withComputedStatus(a));
  }

  async findPublishedById(
    id: string,
  ): Promise<(Announcement & { computedRecruitStatus: RecruitStatus }) | null> {
    const announcement = await this.announcementRepo.findOne({
      where: { id, publishStatus: PublishStatus.PUBLISHED },
      relations: ['program'],
    });
    if (!announcement) return null;
    return this.withComputedStatus(announcement);
  }

  async create(
    dto: CreateAnnouncementDto,
    createdById: string,
  ): Promise<Announcement & { computedRecruitStatus: RecruitStatus }> {
    const announcement = this.announcementRepo.create({
      ...dto,
      createdById,
    });
    // Compute initial recruit status based on dates
    announcement.recruitStatus = this.computeRecruitStatus(announcement);
    const saved = await this.announcementRepo.save(announcement);
    return this.withComputedStatus(saved);
  }

  async update(
    id: string,
    dto: UpdateAnnouncementDto,
  ): Promise<Announcement & { computedRecruitStatus: RecruitStatus }> {
    const announcement = await this.announcementRepo.findOne({
      where: { id },
    });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    Object.assign(announcement, dto);
    // If recruit dates changed and no manual status override, recompute
    if ((dto.recruitStartDate || dto.recruitEndDate) && !dto.recruitStatus) {
      announcement.recruitStatus = this.computeRecruitStatus(announcement);
    }
    const saved = await this.announcementRepo.save(announcement);
    return this.withComputedStatus(saved);
  }

  async remove(id: string): Promise<void> {
    const announcement = await this.announcementRepo.findOne({
      where: { id },
    });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    await this.announcementRepo.remove(announcement);
  }

  async duplicate(
    id: string,
    createdById: string,
  ): Promise<Announcement & { computedRecruitStatus: RecruitStatus }> {
    const original = await this.announcementRepo.findOne({
      where: { id },
    });
    if (!original) {
      throw new NotFoundException('Announcement not found');
    }

    const duplicate = this.announcementRepo.create({
      programId: original.programId,
      name: `${original.name} (복제)`,
      jobType: original.jobType,
      capacity: original.capacity,
      thumbnailUrl: original.thumbnailUrl,
      detailContent: original.detailContent,
      publishStatus: 'unpublished' as Announcement['publishStatus'],
      recruitStartDate: original.recruitStartDate,
      recruitEndDate: original.recruitEndDate,
      scheduleResult: original.scheduleResult,
      scheduleTraining: original.scheduleTraining,
      scheduleOnsite: original.scheduleOnsite,
      createdById,
    });
    duplicate.recruitStatus = this.computeRecruitStatus(duplicate);
    const saved = await this.announcementRepo.save(duplicate);
    return this.withComputedStatus(saved);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.announcementRepo.increment({ id }, 'viewCount', 1);
  }
}
