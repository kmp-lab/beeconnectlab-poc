import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from '../database/entities/interview.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
  ) {}

  async findAll(): Promise<Interview[]> {
    return this.interviewRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
  }

  async findById(id: string): Promise<Interview | null> {
    return this.interviewRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });
  }

  async findPublished(): Promise<Interview[]> {
    return this.interviewRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    dto: CreateInterviewDto,
    createdById: string,
  ): Promise<Interview> {
    const interview = this.interviewRepo.create({
      ...dto,
      createdById,
    });
    return this.interviewRepo.save(interview);
  }

  async update(id: string, dto: UpdateInterviewDto): Promise<Interview> {
    const interview = await this.interviewRepo.findOne({ where: { id } });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    Object.assign(interview, dto);
    return this.interviewRepo.save(interview);
  }

  async remove(id: string): Promise<void> {
    const interview = await this.interviewRepo.findOne({ where: { id } });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    await this.interviewRepo.remove(interview);
  }
}
