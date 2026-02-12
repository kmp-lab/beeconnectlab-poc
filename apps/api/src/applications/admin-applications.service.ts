import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApplicationStatus,
  ParticipationStatus,
} from '@beeconnectlab/shared-types';
import { Application } from '../database/entities/application.entity';
import { ApplicationEvaluation } from '../database/entities/application-evaluation.entity';
import { ApplicationStatusLog } from '../database/entities/application-status-log.entity';
import { Activity } from '../database/entities/activity.entity';
import { Announcement } from '../database/entities/announcement.entity';
import { ListApplicationsQueryDto } from './dto/list-applications-query.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import * as ExcelJS from 'exceljs';

const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.SUBMITTED]: [
    ApplicationStatus.FIRST_PASS,
    ApplicationStatus.FINAL_PASS,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.FIRST_PASS]: [
    ApplicationStatus.FINAL_PASS,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.FINAL_PASS]: [ApplicationStatus.REJECTED],
  [ApplicationStatus.REJECTED]: [
    ApplicationStatus.FIRST_PASS,
    ApplicationStatus.FINAL_PASS,
  ],
};

@Injectable()
export class AdminApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(ApplicationEvaluation)
    private readonly evaluationRepo: Repository<ApplicationEvaluation>,
    @InjectRepository(ApplicationStatusLog)
    private readonly statusLogRepo: Repository<ApplicationStatusLog>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
  ) {}

  async findAll(query: ListApplicationsQueryDto) {
    const page = query.page ?? 1;
    const take = 10;
    const skip = (page - 1) * take;

    const qb = this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.announcement', 'announcement')
      .leftJoinAndSelect('announcement.program', 'program')
      .leftJoinAndSelect('app.user', 'user')
      .leftJoinAndSelect('app.evaluations', 'evaluations');

    if (query.status) {
      const statuses = query.status.split(',');
      qb.andWhere('app.status IN (:...statuses)', { statuses });
    }

    if (query.announcementId) {
      const announcementIds = query.announcementId.split(',');
      qb.andWhere('app.announcementId IN (:...announcementIds)', {
        announcementIds,
      });
    }

    qb.orderBy('app.createdAt', 'DESC');
    qb.skip(skip).take(take);

    const [applications, total] = await qb.getManyAndCount();

    return {
      data: applications.map((app) => this.toListItem(app)),
      total,
      page,
      totalPages: Math.ceil(total / take),
    };
  }

  async findById(id: string) {
    const app = await this.applicationRepo.findOne({
      where: { id },
      relations: [
        'announcement',
        'announcement.program',
        'user',
        'evaluations',
        'evaluations.evaluatedBy',
        'statusLogs',
        'statusLogs.changedBy',
      ],
    });
    if (!app) throw new NotFoundException('Application not found');
    return this.toDetail(app);
  }

  async updateStatus(
    id: string,
    newStatus: ApplicationStatus,
    adminId: string,
  ) {
    const app = await this.applicationRepo.findOne({
      where: { id },
      relations: ['announcement'],
    });
    if (!app) throw new NotFoundException('Application not found');

    const allowed = STATUS_TRANSITIONS[app.status];
    if (!allowed?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${app.status} to ${newStatus}`,
      );
    }

    const fromStatus = app.status;
    app.status = newStatus;
    await this.applicationRepo.save(app);

    const log = this.statusLogRepo.create({
      applicationId: id,
      fromStatus,
      toStatus: newStatus,
      changedById: adminId,
    });
    await this.statusLogRepo.save(log);

    // Auto-create Activity on final_pass
    if (newStatus === ApplicationStatus.FINAL_PASS) {
      await this.createActivity(app);
    }

    // If reverting from final_pass, remove activity
    if (
      fromStatus === ApplicationStatus.FINAL_PASS &&
      newStatus === ApplicationStatus.REJECTED
    ) {
      await this.activityRepo.delete({ applicationId: id });
    }

    return { id: app.id, status: app.status };
  }

  async createEvaluation(
    applicationId: string,
    dto: CreateEvaluationDto,
    adminId: string,
  ) {
    const app = await this.applicationRepo.findOne({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('Application not found');

    const totalScore =
      dto.scoreCriteria1 + dto.scoreCriteria2 + dto.scoreCriteria3;

    const evaluation = this.evaluationRepo.create({
      applicationId,
      scoreCriteria1: dto.scoreCriteria1,
      scoreCriteria2: dto.scoreCriteria2,
      scoreCriteria3: dto.scoreCriteria3,
      totalScore,
      memo: dto.memo ?? null,
      evaluatedById: adminId,
    });

    return this.evaluationRepo.save(evaluation);
  }

  async findEvaluations(applicationId: string) {
    const app = await this.applicationRepo.findOne({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('Application not found');

    const evaluations = await this.evaluationRepo.find({
      where: { applicationId },
      relations: ['evaluatedBy'],
      order: { createdAt: 'DESC' },
    });

    return evaluations.map((e) => ({
      id: e.id,
      scoreCriteria1: e.scoreCriteria1,
      scoreCriteria2: e.scoreCriteria2,
      scoreCriteria3: e.scoreCriteria3,
      totalScore: e.totalScore,
      memo: e.memo,
      evaluatedById: e.evaluatedById,
      evaluatedByName: e.evaluatedBy?.name ?? '',
      createdAt: e.createdAt,
    }));
  }

  async deleteEvaluation(evalId: string) {
    const evaluation = await this.evaluationRepo.findOne({
      where: { id: evalId },
    });
    if (!evaluation) throw new NotFoundException('Evaluation not found');
    await this.evaluationRepo.remove(evaluation);
    return { message: 'Evaluation deleted' };
  }

  async exportExcel(query: ListApplicationsQueryDto): Promise<Buffer> {
    const qb = this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.announcement', 'announcement')
      .leftJoinAndSelect('announcement.program', 'program')
      .leftJoinAndSelect('app.user', 'user')
      .leftJoinAndSelect('app.evaluations', 'evaluations');

    if (query.status) {
      const statuses = query.status.split(',');
      qb.andWhere('app.status IN (:...statuses)', { statuses });
    }

    if (query.announcementId) {
      const announcementIds = query.announcementId.split(',');
      qb.andWhere('app.announcementId IN (:...announcementIds)', {
        announcementIds,
      });
    }

    qb.orderBy('app.createdAt', 'DESC');

    const applications = await qb.getMany();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('지원서 목록');

    sheet.columns = [
      { header: '공고명', key: 'announcementName', width: 30 },
      { header: '지원일자', key: 'createdAt', width: 20 },
      { header: '이름', key: 'name', width: 15 },
      { header: '성별', key: 'gender', width: 8 },
      { header: '나이', key: 'age', width: 8 },
      { header: '연락처', key: 'phone', width: 15 },
      { header: '이메일', key: 'email', width: 25 },
      { header: '지원상태', key: 'status', width: 12 },
      { header: '유입경로', key: 'referralSource', width: 15 },
      { header: '평가점수', key: 'evalScore', width: 10 },
    ];

    for (const app of applications) {
      const latestEval =
        app.evaluations?.length > 0
          ? app.evaluations.reduce((a, b) =>
              new Date(a.createdAt) > new Date(b.createdAt) ? a : b,
            )
          : null;

      sheet.addRow({
        announcementName: app.announcement?.name ?? '',
        createdAt: app.createdAt,
        name: app.applicantName,
        gender: app.user?.gender === 'male' ? '남성' : '여성',
        age: app.user?.birthDate ? this.calcAge(app.user.birthDate) : '',
        phone: app.applicantPhone,
        email: app.applicantEmail,
        status: this.statusLabel(app.status),
        referralSource: app.referralSource ?? '',
        evalScore: latestEval?.totalScore ?? '',
      });
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  async getDistinctAnnouncements() {
    const results = await this.applicationRepo
      .createQueryBuilder('app')
      .leftJoin('app.announcement', 'announcement')
      .select('DISTINCT announcement.id', 'id')
      .addSelect('announcement.name', 'name')
      .where('announcement.id IS NOT NULL')
      .orderBy('announcement.name', 'ASC')
      .getRawMany();
    return results.map((r: { id: string; name: string }) => ({
      id: r.id,
      name: r.name,
    }));
  }

  async getAdjacentIds(id: string, query: ListApplicationsQueryDto) {
    const qb = this.applicationRepo
      .createQueryBuilder('app')
      .select('app.id')
      .addSelect('app.createdAt');

    if (query.status) {
      const statuses = query.status.split(',');
      qb.andWhere('app.status IN (:...statuses)', { statuses });
    }

    if (query.announcementId) {
      const announcementIds = query.announcementId.split(',');
      qb.andWhere('app.announcementId IN (:...announcementIds)', {
        announcementIds,
      });
    }

    qb.orderBy('app.createdAt', 'DESC');

    const all = await qb.getMany();
    const idx = all.findIndex((a) => a.id === id);

    return {
      prevId: idx > 0 ? all[idx - 1]!.id : null,
      nextId: idx < all.length - 1 ? all[idx + 1]!.id : null,
    };
  }

  private async createActivity(app: Application) {
    const announcement = app.announcement
      ? app.announcement
      : await this.announcementRepo.findOne({
          where: { id: app.announcementId },
        });

    if (!announcement) return;

    const existing = await this.activityRepo.findOne({
      where: { applicationId: app.id },
    });
    if (existing) return;

    const activity = this.activityRepo.create({
      userId: app.userId,
      programId: announcement.programId,
      announcementId: app.announcementId,
      applicationId: app.id,
      participationStatus: ParticipationStatus.UPCOMING,
    });
    await this.activityRepo.save(activity);
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

  private statusLabel(s: ApplicationStatus): string {
    switch (s) {
      case ApplicationStatus.SUBMITTED:
        return '지원완료';
      case ApplicationStatus.FIRST_PASS:
        return '1차 합격';
      case ApplicationStatus.FINAL_PASS:
        return '최종 합격';
      case ApplicationStatus.REJECTED:
        return '불합격';
      default:
        return s;
    }
  }

  private toListItem(app: Application) {
    const latestEval =
      app.evaluations?.length > 0
        ? app.evaluations.reduce((a, b) =>
            new Date(a.createdAt) > new Date(b.createdAt) ? a : b,
          )
        : null;

    return {
      id: app.id,
      announcementId: app.announcementId,
      announcementName: app.announcement?.name ?? '',
      programName: app.announcement?.program?.name ?? '',
      applicantName: app.applicantName,
      applicantEmail: app.applicantEmail,
      applicantPhone: app.applicantPhone,
      gender: app.user?.gender ?? null,
      age: app.user?.birthDate ? this.calcAge(app.user.birthDate) : null,
      status: app.status,
      referralSource: app.referralSource,
      evalScore: latestEval?.totalScore ?? null,
      createdAt: app.createdAt,
    };
  }

  private toDetail(app: Application) {
    return {
      id: app.id,
      announcementId: app.announcementId,
      announcementName: app.announcement?.name ?? '',
      programName: app.announcement?.program?.name ?? '',
      userId: app.userId,
      applicantName: app.applicantName,
      applicantEmail: app.applicantEmail,
      applicantPhone: app.applicantPhone,
      fileUrl1: app.fileUrl1,
      fileName1: app.fileName1,
      fileUrl2: app.fileUrl2,
      fileName2: app.fileName2,
      referralSource: app.referralSource,
      status: app.status,
      createdAt: app.createdAt,
      user: app.user
        ? {
            id: app.user.id,
            name: app.user.name,
            email: app.user.email,
            phone: app.user.phone,
            gender: app.user.gender,
            age: this.calcAge(app.user.birthDate),
            profileImageUrl: app.user.profileImageUrl,
            residence: app.user.residence,
            activityStatus: app.user.activityStatus,
          }
        : null,
      evaluations: (app.evaluations ?? [])
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map((e) => ({
          id: e.id,
          scoreCriteria1: e.scoreCriteria1,
          scoreCriteria2: e.scoreCriteria2,
          scoreCriteria3: e.scoreCriteria3,
          totalScore: e.totalScore,
          memo: e.memo,
          evaluatedById: e.evaluatedById,
          evaluatedByName: e.evaluatedBy?.name ?? '',
          createdAt: e.createdAt,
        })),
      statusLogs: (app.statusLogs ?? [])
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map((l) => ({
          id: l.id,
          fromStatus: l.fromStatus,
          toStatus: l.toStatus,
          changedById: l.changedById,
          changedByName: l.changedBy?.name ?? '',
          createdAt: l.createdAt,
        })),
    };
  }
}
