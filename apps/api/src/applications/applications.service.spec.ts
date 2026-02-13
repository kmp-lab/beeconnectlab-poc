import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Application } from '../database/entities/application.entity';
import { Announcement } from '../database/entities/announcement.entity';
import {
  ApplicationStatus,
  PublishStatus,
  RecruitStatus,
} from '@beeconnectlab/shared-types';
import { CreateApplicationDto } from './dto/create-application.dto';

const mockApplicationRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockAnnouncementRepo = {
  findOne: jest.fn(),
};

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepo,
        },
        {
          provide: getRepositoryToken(Announcement),
          useValue: mockAnnouncementRepo,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  const baseDto: CreateApplicationDto = {
    announcementId: 'ann-1',
    applicantName: 'Test User',
    applicantEmail: 'test@example.com',
    applicantPhone: '010-0000-0000',
    fileUrl1: 'https://example.com/file.pdf',
    fileName1: 'resume.pdf',
  };

  function makeRecruitingAnnouncement(overrides: Partial<Announcement> = {}) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 5);
    const end = new Date(now);
    end.setDate(end.getDate() + 5);

    return {
      id: 'ann-1',
      publishStatus: PublishStatus.PUBLISHED,
      recruitStatus: RecruitStatus.RECRUITING,
      recruitStartDate: start,
      recruitEndDate: end,
      ...overrides,
    };
  }

  describe('create', () => {
    it('should create an application for a valid announcement', async () => {
      const announcement = makeRecruitingAnnouncement();
      mockAnnouncementRepo.findOne.mockResolvedValue(announcement);

      const savedApp = {
        id: 'app-1',
        ...baseDto,
        userId: 'user-1',
        status: ApplicationStatus.SUBMITTED,
      };
      mockApplicationRepo.create.mockReturnValue(savedApp);
      mockApplicationRepo.save.mockResolvedValue(savedApp);

      const result = await service.create(baseDto, 'user-1');

      expect(result.status).toBe(ApplicationStatus.SUBMITTED);
      expect(result.userId).toBe('user-1');
      expect(mockApplicationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          announcementId: 'ann-1',
          userId: 'user-1',
          status: ApplicationStatus.SUBMITTED,
        }),
      );
    });

    it('should throw NotFoundException for non-existent announcement', async () => {
      mockAnnouncementRepo.findOne.mockResolvedValue(null);

      await expect(service.create(baseDto, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for unpublished announcement', async () => {
      const announcement = makeRecruitingAnnouncement({
        publishStatus: PublishStatus.UNPUBLISHED,
      });
      mockAnnouncementRepo.findOne.mockResolvedValue(announcement);

      await expect(service.create(baseDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when recruitment is upcoming (not open)', async () => {
      const futureStart = new Date();
      futureStart.setDate(futureStart.getDate() + 10);
      const futureEnd = new Date();
      futureEnd.setDate(futureEnd.getDate() + 20);

      const announcement = makeRecruitingAnnouncement({
        recruitStartDate: futureStart,
        recruitEndDate: futureEnd,
      });
      mockAnnouncementRepo.findOne.mockResolvedValue(announcement);

      await expect(service.create(baseDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when recruitment is closed', async () => {
      const pastStart = new Date();
      pastStart.setDate(pastStart.getDate() - 20);
      const pastEnd = new Date();
      pastEnd.setDate(pastEnd.getDate() - 5);

      const announcement = makeRecruitingAnnouncement({
        recruitStartDate: pastStart,
        recruitEndDate: pastEnd,
      });
      mockAnnouncementRepo.findOne.mockResolvedValue(announcement);

      await expect(service.create(baseDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
