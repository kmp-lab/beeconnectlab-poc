import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Application } from '../database/entities/application.entity';
import { Activity } from '../database/entities/activity.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.userRepo.update(id, { passwordHash });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepo.update(id, { lastLoginAt: new Date() });
  }

  async getProfile(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    await this.userRepo.update(id, dto);
    return this.userRepo.findOneOrFail({ where: { id } });
  }

  async getApplications(userId: string): Promise<Application[]> {
    return this.applicationRepo.find({
      where: { userId },
      relations: ['announcement', 'announcement.program'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActivities(userId: string): Promise<Activity[]> {
    return this.activityRepo.find({
      where: { userId },
      relations: ['program'],
      order: { createdAt: 'DESC' },
    });
  }
}
