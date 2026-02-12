import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../database/entities/admin.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Admin | null> {
    return this.adminRepo.findOne({ where: { id } });
  }

  async create(data: Partial<Admin>): Promise<Admin> {
    const admin = this.adminRepo.create(data);
    return this.adminRepo.save(admin);
  }

  async findAll(): Promise<Admin[]> {
    return this.adminRepo.find({ order: { createdAt: 'DESC' } });
  }

  async approve(id: string, approvedById: string): Promise<Admin> {
    await this.adminRepo.update(id, {
      status: 'approved' as Admin['status'],
      approvedAt: new Date(),
      approvedById,
    });
    return this.adminRepo.findOneOrFail({ where: { id } });
  }

  async softDelete(id: string): Promise<void> {
    await this.adminRepo.softDelete(id);
  }

  async countActive(): Promise<number> {
    return this.adminRepo.count({
      where: { status: 'approved' as Admin['status'] },
    });
  }
}
