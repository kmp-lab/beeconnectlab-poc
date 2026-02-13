import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { Program } from '../database/entities/program.entity';
import { Announcement } from '../database/entities/announcement.entity';
import { Activity } from '../database/entities/activity.entity';
import { ParticipationStatus } from '@beeconnectlab/shared-types';

const mockProgramRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

const mockAnnouncementRepo = {
  delete: jest.fn(),
};

const mockActivityRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
};

describe('ProgramsService', () => {
  let service: ProgramsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramsService,
        { provide: getRepositoryToken(Program), useValue: mockProgramRepo },
        {
          provide: getRepositoryToken(Announcement),
          useValue: mockAnnouncementRepo,
        },
        { provide: getRepositoryToken(Activity), useValue: mockActivityRepo },
      ],
    }).compile();

    service = module.get<ProgramsService>(ProgramsService);
  });

  function makeProgram(overrides: Partial<Program> = {}): Program {
    return {
      id: 'prog-1',
      name: 'Test Program',
      host: 'Test Host',
      organizer: 'Test Org',
      activityStartDate: new Date('2025-01-01'),
      activityEndDate: new Date('2025-12-31'),
      regionSido: 'Seoul',
      regionSigungu: null,
      benefits: null,
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as Program;
  }

  describe('computeStatus', () => {
    it('should return "예정" for future programs', () => {
      const futureStart = new Date();
      futureStart.setDate(futureStart.getDate() + 10);
      const futureEnd = new Date();
      futureEnd.setDate(futureEnd.getDate() + 30);

      const program = makeProgram({
        activityStartDate: futureStart,
        activityEndDate: futureEnd,
      });

      expect(service.computeStatus(program)).toBe('예정');
    });

    it('should return "진행중" for active programs', () => {
      const pastStart = new Date();
      pastStart.setDate(pastStart.getDate() - 10);
      const futureEnd = new Date();
      futureEnd.setDate(futureEnd.getDate() + 10);

      const program = makeProgram({
        activityStartDate: pastStart,
        activityEndDate: futureEnd,
      });

      expect(service.computeStatus(program)).toBe('진행중');
    });

    it('should return "종료" for ended programs', () => {
      const pastStart = new Date();
      pastStart.setDate(pastStart.getDate() - 30);
      const pastEnd = new Date();
      pastEnd.setDate(pastEnd.getDate() - 5);

      const program = makeProgram({
        activityStartDate: pastStart,
        activityEndDate: pastEnd,
      });

      expect(service.computeStatus(program)).toBe('종료');
    });
  });

  describe('findAll', () => {
    it('should return programs with computed status', async () => {
      const pastStart = new Date();
      pastStart.setDate(pastStart.getDate() - 10);
      const futureEnd = new Date();
      futureEnd.setDate(futureEnd.getDate() + 10);

      const program = makeProgram({
        activityStartDate: pastStart,
        activityEndDate: futureEnd,
      });
      mockProgramRepo.find.mockResolvedValue([program]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]!.status).toBe('진행중');
    });
  });

  describe('findById', () => {
    it('should return program with status', async () => {
      const pastStart = new Date();
      pastStart.setDate(pastStart.getDate() - 10);
      const futureEnd = new Date();
      futureEnd.setDate(futureEnd.getDate() + 10);

      const program = makeProgram({
        activityStartDate: pastStart,
        activityEndDate: futureEnd,
      });
      mockProgramRepo.findOne.mockResolvedValue(program);

      const result = await service.findById('prog-1');

      expect(result).not.toBeNull();
      expect(result!.status).toBe('진행중');
    });

    it('should return null for non-existent program', async () => {
      mockProgramRepo.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a program and return with status', async () => {
      const futureStart = new Date();
      futureStart.setDate(futureStart.getDate() + 10);
      const futureEnd = new Date();
      futureEnd.setDate(futureEnd.getDate() + 30);

      const created = makeProgram({
        activityStartDate: futureStart,
        activityEndDate: futureEnd,
      });
      mockProgramRepo.create.mockReturnValue(created);
      mockProgramRepo.save.mockResolvedValue(created);

      const result = await service.create(
        {
          name: 'Test Program',
          host: 'Test Host',
          organizer: 'Test Org',
          activityStartDate: futureStart.toISOString(),
          activityEndDate: futureEnd.toISOString(),
          regionSido: 'Seoul',
        },
        'admin-1',
      );

      expect(result.status).toBe('예정');
      expect(mockProgramRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ createdById: 'admin-1' }),
      );
    });
  });

  describe('update', () => {
    it('should update and return with status', async () => {
      const program = makeProgram();
      mockProgramRepo.findOne.mockResolvedValue(program);
      mockProgramRepo.save.mockResolvedValue({
        ...program,
        name: 'Updated',
      });

      const result = await service.update('prog-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException for non-existent program', async () => {
      mockProgramRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove program and its announcements', async () => {
      const program = makeProgram();
      mockProgramRepo.findOne.mockResolvedValue(program);

      await service.remove('prog-1');

      expect(mockAnnouncementRepo.delete).toHaveBeenCalledWith({
        programId: 'prog-1',
      });
      expect(mockProgramRepo.remove).toHaveBeenCalledWith(program);
    });

    it('should throw NotFoundException for non-existent program', async () => {
      mockProgramRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('computeParticipationStatus', () => {
    it('should return UPCOMING for future programs', () => {
      const futureStart = new Date();
      futureStart.setDate(futureStart.getDate() + 10);
      const futureEnd = new Date();
      futureEnd.setDate(futureEnd.getDate() + 30);

      const program = makeProgram({
        activityStartDate: futureStart,
        activityEndDate: futureEnd,
      });

      expect(
        service.computeParticipationStatus(
          program,
          ParticipationStatus.UPCOMING,
        ),
      ).toBe(ParticipationStatus.UPCOMING);
    });

    it('should return ACTIVE for ongoing programs', () => {
      const pastStart = new Date();
      pastStart.setDate(pastStart.getDate() - 10);
      const futureEnd = new Date();
      futureEnd.setDate(futureEnd.getDate() + 10);

      const program = makeProgram({
        activityStartDate: pastStart,
        activityEndDate: futureEnd,
      });

      expect(
        service.computeParticipationStatus(
          program,
          ParticipationStatus.UPCOMING,
        ),
      ).toBe(ParticipationStatus.ACTIVE);
    });

    it('should return PERIOD_ENDED for past programs', () => {
      const pastStart = new Date();
      pastStart.setDate(pastStart.getDate() - 30);
      const pastEnd = new Date();
      pastEnd.setDate(pastEnd.getDate() - 5);

      const program = makeProgram({
        activityStartDate: pastStart,
        activityEndDate: pastEnd,
      });

      expect(
        service.computeParticipationStatus(
          program,
          ParticipationStatus.UPCOMING,
        ),
      ).toBe(ParticipationStatus.PERIOD_ENDED);
    });

    it('should preserve COMPLETED status regardless of dates', () => {
      const futureStart = new Date();
      futureStart.setDate(futureStart.getDate() + 10);
      const futureEnd = new Date();
      futureEnd.setDate(futureEnd.getDate() + 30);

      const program = makeProgram({
        activityStartDate: futureStart,
        activityEndDate: futureEnd,
      });

      expect(
        service.computeParticipationStatus(
          program,
          ParticipationStatus.COMPLETED,
        ),
      ).toBe(ParticipationStatus.COMPLETED);
    });

    it('should preserve DROPPED status regardless of dates', () => {
      const pastStart = new Date();
      pastStart.setDate(pastStart.getDate() - 10);
      const futureEnd = new Date();
      futureEnd.setDate(futureEnd.getDate() + 10);

      const program = makeProgram({
        activityStartDate: pastStart,
        activityEndDate: futureEnd,
      });

      expect(
        service.computeParticipationStatus(
          program,
          ParticipationStatus.DROPPED,
        ),
      ).toBe(ParticipationStatus.DROPPED);
    });
  });
});
