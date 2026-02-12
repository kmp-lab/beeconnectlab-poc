import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { Admin } from '../entities/admin.entity';
import { AdminStatus } from '@beeconnectlab/shared-types';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const adminRepo = AppDataSource.getRepository(Admin);

  const existingAdmin = await adminRepo.findOne({
    where: { email: 'admin@beeconnectlab.com' },
  });

  if (existingAdmin) {
    console.log('Admin account already exists, skipping seed');
  } else {
    const admin = adminRepo.create({
      email: 'admin@beeconnectlab.com',
      passwordHash: await hashPassword('Admin1234!'),
      name: '관리자',
      phone: '010-0000-0000',
      organization: '비커넥트랩',
      status: AdminStatus.APPROVED,
      approvedAt: new Date(),
    });

    await adminRepo.save(admin);
    console.log('Admin account created: admin@beeconnectlab.com');
  }

  await AppDataSource.destroy();
  console.log('Seed completed');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
