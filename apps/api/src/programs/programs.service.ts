import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParticipationStatus } from '@beeconnectlab/shared-types';
import { Program } from '../database/entities/program.entity';
import { Announcement } from '../database/entities/announcement.entity';
import { Activity } from '../database/entities/activity.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { EvaluateParticipantDto } from './dto/evaluate-participant.dto';

export type ProgramStatus = '예정' | '진행중' | '종료';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
  ) {}

  computeStatus(program: Program): ProgramStatus {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(program.activityStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(program.activityEndDate);
    end.setHours(0, 0, 0, 0);

    if (today < start) return '예정';
    if (today > end) return '종료';
    return '진행중';
  }

  async findAll(): Promise<(Program & { status: ProgramStatus })[]> {
    const programs = await this.programRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return programs.map((p) => ({ ...p, status: this.computeStatus(p) }));
  }

  async findById(
    id: string,
  ): Promise<(Program & { status: ProgramStatus }) | null> {
    const program = await this.programRepo.findOne({
      where: { id },
      relations: ['createdBy', 'announcements'],
    });
    if (!program) return null;
    return { ...program, status: this.computeStatus(program) };
  }

  async create(
    dto: CreateProgramDto,
    createdById: string,
  ): Promise<Program & { status: ProgramStatus }> {
    const program = this.programRepo.create({
      ...dto,
      createdById,
    });
    const saved = await this.programRepo.save(program);
    return { ...saved, status: this.computeStatus(saved) };
  }

  async update(
    id: string,
    dto: UpdateProgramDto,
  ): Promise<Program & { status: ProgramStatus }> {
    const program = await this.programRepo.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException('Program not found');
    }
    Object.assign(program, dto);
    const saved = await this.programRepo.save(program);
    return { ...saved, status: this.computeStatus(saved) };
  }

  async remove(id: string): Promise<void> {
    const program = await this.programRepo.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException('Program not found');
    }
    // Delete connected announcements first (no cascade in DB)
    await this.announcementRepo.delete({ programId: id });
    await this.programRepo.remove(program);
  }

  /**
   * Compute the auto participation status based on program activity dates.
   * Manual statuses (completed, dropped) take precedence.
   */
  computeParticipationStatus(
    program: Program,
    current: ParticipationStatus,
  ): ParticipationStatus {
    // Manual statuses are not overridden by auto-computation
    if (
      current === ParticipationStatus.COMPLETED ||
      current === ParticipationStatus.DROPPED
    ) {
      return current;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(program.activityStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(program.activityEndDate);
    end.setHours(0, 0, 0, 0);

    if (today < start) return ParticipationStatus.UPCOMING;
    if (today > end) return ParticipationStatus.PERIOD_ENDED;
    return ParticipationStatus.ACTIVE;
  }

  /**
   * GET /admin/programs/:id/participants
   * Returns participants (activities) for a program with auto-computed status.
   */
  async findParticipants(programId: string) {
    const program = await this.programRepo.findOne({
      where: { id: programId },
    });
    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const activities = await this.activityRepo.find({
      where: { programId },
      relations: ['user', 'announcement', 'evaluatedBy'],
      order: { createdAt: 'ASC' },
    });

    return activities.map((a) => {
      const computedStatus = this.computeParticipationStatus(
        program,
        a.participationStatus,
      );
      return {
        id: a.id,
        userId: a.userId,
        userName: a.user?.name ?? '-',
        announcementName: a.announcement?.name ?? '-',
        jobType: a.announcement?.jobType ?? '-',
        participationStatus: computedStatus,
        evalTotalScore: a.evalTotalScore,
        evalScores: a.evalScores,
        evalComment: a.evalComment,
        role: a.role,
        evaluatedByName: a.evaluatedBy?.name ?? null,
        evaluatedAt: a.evaluatedAt,
      };
    });
  }

  /**
   * PUT /admin/programs/:id/participants/:userId/evaluate
   * Evaluates a participant (overwrites previous evaluation).
   */
  async evaluateParticipant(
    programId: string,
    userId: string,
    dto: EvaluateParticipantDto,
    adminId: string,
  ) {
    const program = await this.programRepo.findOne({
      where: { id: programId },
    });
    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const activity = await this.activityRepo.findOne({
      where: { programId, userId },
      relations: ['user', 'announcement', 'evaluatedBy'],
    });
    if (!activity) {
      throw new NotFoundException('Participant activity not found');
    }

    activity.evalScores = dto.evalScores;
    activity.evalTotalScore = dto.evalTotalScore;
    activity.role = dto.role ?? null;
    activity.evalComment = dto.evalComment ?? null;
    activity.participationStatus = dto.participationStatus;
    activity.evaluatedById = adminId;
    activity.evaluatedAt = new Date();

    const saved = await this.activityRepo.save(activity);

    // Re-fetch with relations for response
    const updated = await this.activityRepo.findOne({
      where: { id: saved.id },
      relations: ['user', 'announcement', 'evaluatedBy'],
    });

    const computedStatus = this.computeParticipationStatus(
      program,
      updated!.participationStatus,
    );

    return {
      id: updated!.id,
      userId: updated!.userId,
      userName: updated!.user?.name ?? '-',
      announcementName: updated!.announcement?.name ?? '-',
      jobType: updated!.announcement?.jobType ?? '-',
      participationStatus: computedStatus,
      evalTotalScore: updated!.evalTotalScore,
      evalScores: updated!.evalScores,
      evalComment: updated!.evalComment,
      role: updated!.role,
      evaluatedByName: updated!.evaluatedBy?.name ?? null,
      evaluatedAt: updated!.evaluatedAt,
    };
  }
}
