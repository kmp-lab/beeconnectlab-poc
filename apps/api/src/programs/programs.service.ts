import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from '../database/entities/program.entity';
import { Announcement } from '../database/entities/announcement.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

export type ProgramStatus = '예정' | '진행중' | '종료';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
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
}
