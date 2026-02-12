import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserNote } from '../database/entities/user-note.entity';
import { Application } from '../database/entities/application.entity';
import { Activity } from '../database/entities/activity.entity';
import { ListTalentsQueryDto } from './dto/list-talents-query.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class TalentsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserNote)
    private readonly noteRepo: Repository<UserNote>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
  ) {}

  async findAll(query: ListTalentsQueryDto) {
    const page = query.page ?? 1;
    const take = 10;
    const skip = (page - 1) * take;

    const qb = this.userRepo.createQueryBuilder('user');

    this.applyFilters(qb, query);

    qb.orderBy('user.createdAt', 'DESC');
    qb.skip(skip).take(take);

    const [users, total] = await qb.getManyAndCount();

    // Get recent program for each user
    const usersWithProgram = await Promise.all(
      users.map(async (user) => {
        const recentActivity = await this.activityRepo.findOne({
          where: { userId: user.id },
          relations: ['program'],
          order: { createdAt: 'DESC' },
        });
        return {
          ...this.toListItem(user),
          recentProgram: recentActivity?.program?.name ?? null,
        };
      }),
    );

    return {
      data: usersWithProgram,
      total,
      page,
      totalPages: Math.ceil(total / take),
    };
  }

  async findById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Talent not found');

    const applications = await this.applicationRepo.find({
      where: { userId: id },
      relations: ['announcement', 'announcement.program'],
      order: { createdAt: 'DESC' },
    });

    const activities = await this.activityRepo.find({
      where: { userId: id },
      relations: ['program', 'announcement'],
      order: { createdAt: 'DESC' },
    });

    const recentProgram =
      activities.length > 0 ? (activities[0].program?.name ?? null) : null;

    return {
      ...this.toDetail(user),
      recentProgram,
      applications: applications.map((app) => ({
        id: app.id,
        announcementId: app.announcementId,
        announcementName: app.announcement?.name ?? '',
        programName: app.announcement?.program?.name ?? '',
        status: app.status,
        createdAt: app.createdAt,
      })),
      activities: activities.map((act) => ({
        id: act.id,
        programName: act.program?.name ?? '',
        announcementName: act.announcement?.name ?? '',
        participationStatus: act.participationStatus,
        role: act.role,
        evalTotalScore: act.evalTotalScore,
        createdAt: act.createdAt,
      })),
    };
  }

  async updateStatus(id: string, accountStatus: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Talent not found');
    user.accountStatus = accountStatus as User['accountStatus'];
    await this.userRepo.save(user);
    return { id: user.id, accountStatus: user.accountStatus };
  }

  async updateTags(
    id: string,
    specialHistory?: string | null,
    managementRisk?: string | null,
  ) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Talent not found');
    if (specialHistory !== undefined) user.specialHistory = specialHistory;
    if (managementRisk !== undefined) user.managementRisk = managementRisk;
    await this.userRepo.save(user);
    return {
      id: user.id,
      specialHistory: user.specialHistory,
      managementRisk: user.managementRisk,
    };
  }

  async createNote(userId: string, content: string, createdById: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Talent not found');

    const note = this.noteRepo.create({ userId, content, createdById });
    return this.noteRepo.save(note);
  }

  async findNotes(userId: string) {
    return this.noteRepo.find({
      where: { userId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteNote(noteId: string) {
    const note = await this.noteRepo.findOne({ where: { id: noteId } });
    if (!note) throw new NotFoundException('Note not found');
    await this.noteRepo.remove(note);
    return { message: 'Note deleted' };
  }

  async exportExcel(query: ListTalentsQueryDto): Promise<Buffer> {
    const qb = this.userRepo.createQueryBuilder('user');
    this.applyFilters(qb, query);
    qb.orderBy('user.createdAt', 'DESC');

    const users = await qb.getMany();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('인재 목록');

    sheet.columns = [
      { header: '이름', key: 'name', width: 15 },
      { header: '성별', key: 'gender', width: 8 },
      { header: '나이', key: 'age', width: 8 },
      { header: '연락처', key: 'phone', width: 15 },
      { header: '이메일', key: 'email', width: 25 },
      { header: '거주지', key: 'residence', width: 20 },
      { header: '관심지역', key: 'interestRegions', width: 20 },
      { header: '희망직무', key: 'desiredJob', width: 15 },
      { header: '보유역량', key: 'skills', width: 20 },
      { header: '활동상태', key: 'activityStatus', width: 12 },
      { header: '특정이력', key: 'specialHistory', width: 15 },
      { header: '관리리스크', key: 'managementRisk', width: 15 },
      { header: '계정상태', key: 'accountStatus', width: 10 },
      { header: '마케팅동의', key: 'marketingConsent', width: 10 },
      { header: '가입일시', key: 'createdAt', width: 20 },
      { header: '최근접속일시', key: 'lastLoginAt', width: 20 },
    ];

    for (const user of users) {
      sheet.addRow({
        name: user.name,
        gender: user.gender === 'male' ? '남성' : '여성',
        age: this.calcAge(user.birthDate),
        phone: user.phone,
        email: user.email,
        residence: user.residence ?? '',
        interestRegions: user.interestRegions?.join(', ') ?? '',
        desiredJob: user.desiredJob ?? '',
        skills: user.skills ?? '',
        activityStatus: user.activityStatus || '-',
        specialHistory: user.specialHistory ?? '-',
        managementRisk: user.managementRisk ?? '-',
        accountStatus: user.accountStatus,
        marketingConsent: user.marketingConsent ? 'Y' : 'N',
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt ?? '',
      });
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  async getDistinctPrograms(): Promise<string[]> {
    const result = await this.activityRepo
      .createQueryBuilder('activity')
      .leftJoin('activity.program', 'program')
      .select('DISTINCT program.name', 'name')
      .where('program.name IS NOT NULL')
      .orderBy('program.name', 'ASC')
      .getRawMany();
    return result.map((r: { name: string }) => r.name);
  }

  private applyFilters(
    qb: SelectQueryBuilder<User>,
    query: ListTalentsQueryDto,
  ) {
    if (query.search) {
      qb.andWhere('user.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    if (query.activityStatus) {
      qb.andWhere('user.activityStatus = :activityStatus', {
        activityStatus: query.activityStatus,
      });
    }

    if (query.specialHistory) {
      qb.andWhere('user.specialHistory = :specialHistory', {
        specialHistory: query.specialHistory,
      });
    }

    if (query.managementRisk) {
      qb.andWhere('user.managementRisk = :managementRisk', {
        managementRisk: query.managementRisk,
      });
    }

    if (query.accountStatus) {
      qb.andWhere('user.accountStatus = :accountStatus', {
        accountStatus: query.accountStatus,
      });
    }

    if (query.recentProgram) {
      qb.andWhere((subQb) => {
        const subQuery = subQb
          .subQuery()
          .select('a.userId')
          .from(Activity, 'a')
          .leftJoin('a.program', 'p')
          .where('p.name = :recentProgram')
          .andWhere(
            `a.createdAt = (
              SELECT MAX(a2."created_at")
              FROM activities a2
              WHERE a2.user_id = a.user_id
            )`,
          )
          .getQuery();
        return `user.id IN ${subQuery}`;
      });
      qb.setParameter('recentProgram', query.recentProgram);
    }
  }

  private calcAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  }

  private toListItem(user: User) {
    return {
      id: user.id,
      name: user.name,
      gender: user.gender,
      age: this.calcAge(user.birthDate),
      phone: user.phone,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      residence: user.residence,
      interestRegions: user.interestRegions,
      desiredJob: user.desiredJob,
      skills: user.skills,
      activityStatus: user.activityStatus,
      specialHistory: user.specialHistory,
      managementRisk: user.managementRisk,
      accountStatus: user.accountStatus,
      marketingConsent: user.marketingConsent,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  private toDetail(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      birthDate: user.birthDate,
      age: this.calcAge(user.birthDate),
      profileImageUrl: user.profileImageUrl,
      residence: user.residence,
      interestRegions: user.interestRegions,
      desiredJob: user.desiredJob,
      skills: user.skills,
      activityStatus: user.activityStatus,
      specialHistory: user.specialHistory,
      managementRisk: user.managementRisk,
      accountStatus: user.accountStatus,
      marketingConsent: user.marketingConsent,
      provider: user.provider,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
