import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { Admin } from '../entities/admin.entity';
import { User } from '../entities/user.entity';
import { Program } from '../entities/program.entity';
import { Announcement } from '../entities/announcement.entity';
import { Application } from '../entities/application.entity';
import { Activity } from '../entities/activity.entity';
import { ApplicationEvaluation } from '../entities/application-evaluation.entity';
import { ApplicationStatusLog } from '../entities/application-status-log.entity';
import { UserNote } from '../entities/user-note.entity';
import { Interview } from '../entities/interview.entity';
import {
  AdminStatus,
  AuthProvider,
  Gender,
  AccountStatus,
  PublishStatus,
  RecruitStatus,
  ApplicationStatus,
  ParticipationStatus,
} from '@beeconnectlab/shared-types';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function demoSeed() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const adminRepo = AppDataSource.getRepository(Admin);
  const userRepo = AppDataSource.getRepository(User);
  const programRepo = AppDataSource.getRepository(Program);
  const announcementRepo = AppDataSource.getRepository(Announcement);
  const applicationRepo = AppDataSource.getRepository(Application);
  const activityRepo = AppDataSource.getRepository(Activity);
  const evaluationRepo = AppDataSource.getRepository(ApplicationEvaluation);
  const statusLogRepo = AppDataSource.getRepository(ApplicationStatusLog);
  const userNoteRepo = AppDataSource.getRepository(UserNote);
  const interviewRepo = AppDataSource.getRepository(Interview);

  // ── 1. Admin (관리자 1명) ──
  let admin = await adminRepo.findOne({
    where: { email: 'admin@beeconnectlab.com' },
  });

  if (!admin) {
    admin = adminRepo.create({
      email: 'admin@beeconnectlab.com',
      passwordHash: await hashPassword('Admin1234!'),
      name: '관리자',
      phone: '010-0000-0000',
      organization: '비커넥트랩',
      status: AdminStatus.APPROVED,
      approvedAt: new Date(),
    });
    admin = await adminRepo.save(admin);
    console.log('Admin created: admin@beeconnectlab.com');
  } else {
    console.log('Admin already exists, reusing');
  }

  // ── 2. Programs (프로그램 3개) ──
  const programsData = [
    {
      name: '2025 청년 로컬크리에이터 양성과정',
      host: '충청남도',
      organizer: '비커넥트랩',
      activityStartDate: new Date('2025-04-01'),
      activityEndDate: new Date('2025-09-30'),
      regionSido: '충청남도',
      regionSigungu: '홍성군',
      benefits: ['활동비 월 200만원', '숙소 지원', '멘토링'],
      createdById: admin.id,
    },
    {
      name: '청년 귀농귀촌 탐색 프로그램',
      host: '전라남도',
      organizer: '전남청년센터',
      activityStartDate: new Date('2025-01-15'),
      activityEndDate: new Date('2025-06-30'),
      regionSido: '전라남도',
      regionSigungu: '순천시',
      benefits: ['활동비 월 150만원', '교통비 지원'],
      createdById: admin.id,
    },
    {
      name: '지역 문화콘텐츠 기획단',
      host: '강원특별자치도',
      organizer: '강원문화재단',
      activityStartDate: new Date('2024-07-01'),
      activityEndDate: new Date('2024-12-31'),
      regionSido: '강원특별자치도',
      regionSigungu: '춘천시',
      benefits: ['활동비 월 180만원', '장비 대여'],
      createdById: admin.id,
    },
  ];

  const programs: Program[] = [];
  for (const data of programsData) {
    const program = programRepo.create(data);
    programs.push(await programRepo.save(program));
  }
  console.log(`Programs created: ${programs.length}`);

  // ── 3. Announcements (공고 5개) ──
  const announcementsData = [
    {
      programId: programs[0].id,
      name: '2025 로컬크리에이터 1기 모집',
      jobType: '로컬크리에이터',
      capacity: 20,
      thumbnailUrl: 'https://placehold.co/600x400/0a1432/e1fb36?text=Creator',
      detailContent:
        '<p>충남 홍성에서 활동할 로컬크리에이터를 모집합니다.</p><p>지역의 자원을 활용한 콘텐츠를 기획하고 제작하는 활동입니다.</p>',
      publishStatus: PublishStatus.PUBLISHED,
      recruitStatus: RecruitStatus.RECRUITING,
      recruitStartDate: new Date('2025-02-01'),
      recruitEndDate: new Date('2025-03-15'),
      scheduleResult: '2025년 3월 25일',
      scheduleTraining: '2025년 4월 1일 ~ 4월 5일',
      scheduleOnsite: '2025년 4월 7일 ~',
      createdById: admin.id,
    },
    {
      programId: programs[0].id,
      name: '2025 로컬크리에이터 2기 모집',
      jobType: '로컬크리에이터',
      capacity: 15,
      thumbnailUrl: 'https://placehold.co/600x400/0a1432/e1fb36?text=Creator2',
      detailContent:
        '<p>충남 홍성 로컬크리에이터 2기를 모집합니다.</p><p>영상 및 SNS 콘텐츠 제작에 관심 있는 청년을 찾습니다.</p>',
      publishStatus: PublishStatus.PUBLISHED,
      recruitStatus: RecruitStatus.UPCOMING,
      recruitStartDate: new Date('2025-05-01'),
      recruitEndDate: new Date('2025-06-15'),
      scheduleResult: '2025년 6월 25일',
      scheduleTraining: null,
      scheduleOnsite: null,
      createdById: admin.id,
    },
    {
      programId: programs[1].id,
      name: '전남 귀농귀촌 탐색단 모집',
      jobType: '귀농귀촌',
      capacity: 30,
      thumbnailUrl: 'https://placehold.co/600x400/0a1432/e1fb36?text=Farm',
      detailContent:
        '<p>전남 순천에서 귀농귀촌 체험 활동을 할 청년을 모집합니다.</p><p>농촌 생활과 지역 커뮤니티를 경험해보세요.</p>',
      publishStatus: PublishStatus.PUBLISHED,
      recruitStatus: RecruitStatus.RECRUITING,
      recruitStartDate: new Date('2024-12-01'),
      recruitEndDate: new Date('2025-01-31'),
      scheduleResult: '2025년 2월 10일',
      scheduleTraining: '2025년 2월 15일 ~ 2월 20일',
      scheduleOnsite: '2025년 2월 22일 ~',
      createdById: admin.id,
    },
    {
      programId: programs[1].id,
      name: '귀농귀촌 심화과정 참가자 모집',
      jobType: '귀농귀촌',
      capacity: 10,
      thumbnailUrl: 'https://placehold.co/600x400/0a1432/e1fb36?text=Advanced',
      detailContent:
        '<p>귀농귀촌 탐색을 마친 청년 대상 심화과정입니다.</p><p>실제 영농 체험과 정착 지원 프로그램을 제공합니다.</p>',
      publishStatus: PublishStatus.UNPUBLISHED,
      recruitStatus: RecruitStatus.UPCOMING,
      recruitStartDate: new Date('2025-04-01'),
      recruitEndDate: new Date('2025-05-31'),
      scheduleResult: null,
      scheduleTraining: null,
      scheduleOnsite: null,
      createdById: admin.id,
    },
    {
      programId: programs[2].id,
      name: '강원 문화콘텐츠 기획단 모집',
      jobType: '문화기획',
      capacity: 25,
      thumbnailUrl: 'https://placehold.co/600x400/0a1432/e1fb36?text=Culture',
      detailContent:
        '<p>강원 춘천의 문화콘텐츠를 기획할 청년을 모집합니다.</p><p>지역 축제, 전시, 공연 기획에 참여합니다.</p>',
      publishStatus: PublishStatus.PUBLISHED,
      recruitStatus: RecruitStatus.CLOSED,
      recruitStartDate: new Date('2024-05-01'),
      recruitEndDate: new Date('2024-06-30'),
      scheduleResult: '2024년 7월 10일',
      scheduleTraining: '2024년 7월 15일 ~ 7월 20일',
      scheduleOnsite: '2024년 7월 22일 ~',
      createdById: admin.id,
    },
  ];

  const announcements: Announcement[] = [];
  for (const data of announcementsData) {
    const announcement = announcementRepo.create(data);
    announcements.push(await announcementRepo.save(announcement));
  }
  console.log(`Announcements created: ${announcements.length}`);

  // ── 4. Users (청년 사용자 10명) ──
  const passwordHash = await hashPassword('User1234!');
  const usersData = [
    {
      email: 'user1@example.com',
      passwordHash,
      provider: AuthProvider.EMAIL,
      name: '김지훈',
      phone: '010-1111-1001',
      birthDate: new Date('1998-03-15'),
      gender: Gender.MALE,
      residence: '서울특별시 마포구',
      interestRegions: ['충청남도', '전라남도'],
      desiredJob: '콘텐츠 크리에이터',
      skills: 'Photoshop, Premiere Pro, SNS 마케팅',
      accountStatus: AccountStatus.ACTIVE,
      marketingConsent: true,
    },
    {
      email: 'user2@example.com',
      passwordHash,
      provider: AuthProvider.EMAIL,
      name: '이수진',
      phone: '010-1111-1002',
      birthDate: new Date('1997-07-22'),
      gender: Gender.FEMALE,
      residence: '서울특별시 강남구',
      interestRegions: ['충청남도'],
      desiredJob: '영상 제작',
      skills: 'After Effects, Final Cut Pro',
      accountStatus: AccountStatus.ACTIVE,
      marketingConsent: false,
    },
    {
      email: 'user3@example.com',
      passwordHash,
      provider: AuthProvider.EMAIL,
      name: '박민수',
      phone: '010-1111-1003',
      birthDate: new Date('1999-01-10'),
      gender: Gender.MALE,
      residence: '경기도 수원시',
      interestRegions: ['전라남도', '강원특별자치도'],
      desiredJob: '귀농귀촌',
      skills: '농업 기초, 요리',
      accountStatus: AccountStatus.ACTIVE,
      marketingConsent: true,
    },
    {
      email: 'user4@example.com',
      passwordHash,
      provider: AuthProvider.EMAIL,
      name: '최영희',
      phone: '010-1111-1004',
      birthDate: new Date('1996-11-05'),
      gender: Gender.FEMALE,
      residence: '부산광역시 해운대구',
      interestRegions: ['강원특별자치도'],
      desiredJob: '문화기획',
      skills: '행사 기획, 디자인',
      accountStatus: AccountStatus.ACTIVE,
      marketingConsent: true,
    },
    {
      email: 'user5@example.com',
      passwordHash,
      provider: AuthProvider.EMAIL,
      name: '정우진',
      phone: '010-1111-1005',
      birthDate: new Date('2000-05-20'),
      gender: Gender.MALE,
      residence: '대전광역시 유성구',
      interestRegions: ['충청남도', '전라남도'],
      desiredJob: '웹 개발',
      skills: 'React, Node.js, TypeScript',
      accountStatus: AccountStatus.ACTIVE,
      marketingConsent: false,
    },
    {
      email: 'user6@example.com',
      passwordHash,
      provider: AuthProvider.EMAIL,
      name: '한소윤',
      phone: '010-1111-1006',
      birthDate: new Date('1998-09-12'),
      gender: Gender.FEMALE,
      residence: '인천광역시 남동구',
      interestRegions: ['충청남도'],
      desiredJob: '마케팅',
      skills: 'Google Analytics, SNS 운영',
      accountStatus: AccountStatus.ACTIVE,
      marketingConsent: true,
    },
    {
      email: 'user7@example.com',
      passwordHash,
      provider: AuthProvider.EMAIL,
      name: '윤태호',
      phone: '010-1111-1007',
      birthDate: new Date('1997-04-30'),
      gender: Gender.MALE,
      residence: '광주광역시 북구',
      interestRegions: ['전라남도', '강원특별자치도'],
      desiredJob: '사진 작가',
      skills: 'Lightroom, 풍경사진, 인물사진',
      accountStatus: AccountStatus.ACTIVE,
      marketingConsent: false,
    },
    {
      email: 'user8@example.com',
      passwordHash,
      provider: AuthProvider.EMAIL,
      name: '서예린',
      phone: '010-1111-1008',
      birthDate: new Date('1999-12-25'),
      gender: Gender.FEMALE,
      residence: '대구광역시 중구',
      interestRegions: ['강원특별자치도'],
      desiredJob: '공연 기획',
      skills: '무대 연출, 공연 기획서 작성',
      accountStatus: AccountStatus.ACTIVE,
      marketingConsent: true,
    },
    {
      email: 'user9@example.com',
      passwordHash,
      provider: AuthProvider.EMAIL,
      name: '오현우',
      phone: '010-1111-1009',
      birthDate: new Date('2001-02-14'),
      gender: Gender.MALE,
      residence: '세종특별자치시',
      interestRegions: ['충청남도', '전라남도'],
      desiredJob: '지역 활성화 기획',
      skills: '기획서 작성, 프레젠테이션',
      accountStatus: AccountStatus.ACTIVE,
      marketingConsent: true,
    },
    {
      email: 'user10@example.com',
      passwordHash,
      provider: AuthProvider.EMAIL,
      name: '강민지',
      phone: '010-1111-1010',
      birthDate: new Date('1998-08-08'),
      gender: Gender.FEMALE,
      residence: '울산광역시 남구',
      interestRegions: ['전라남도', '강원특별자치도'],
      desiredJob: '커뮤니티 매니저',
      skills: '커뮤니티 운영, 글쓰기, 번역(영어)',
      accountStatus: AccountStatus.ACTIVE,
      marketingConsent: false,
    },
  ];

  const users: User[] = [];
  for (const data of usersData) {
    const existing = await userRepo.findOne({ where: { email: data.email } });
    if (existing) {
      users.push(existing);
    } else {
      const user = userRepo.create(data);
      users.push(await userRepo.save(user));
    }
  }
  console.log(`Users created/found: ${users.length}`);

  // ── 5. Applications (지원서 20건) ──
  // Spread across announcements with varied statuses
  const applicationEntries: {
    announcementIndex: number;
    userIndex: number;
    status: ApplicationStatus;
  }[] = [
    // Announcement 0 (로컬크리에이터 1기 - RECRUITING): 6 applications
    {
      announcementIndex: 0,
      userIndex: 0,
      status: ApplicationStatus.FINAL_PASS,
    },
    {
      announcementIndex: 0,
      userIndex: 1,
      status: ApplicationStatus.FINAL_PASS,
    },
    {
      announcementIndex: 0,
      userIndex: 2,
      status: ApplicationStatus.FIRST_PASS,
    },
    {
      announcementIndex: 0,
      userIndex: 4,
      status: ApplicationStatus.FIRST_PASS,
    },
    { announcementIndex: 0, userIndex: 5, status: ApplicationStatus.SUBMITTED },
    { announcementIndex: 0, userIndex: 8, status: ApplicationStatus.REJECTED },
    // Announcement 2 (전남 귀농귀촌 - RECRUITING): 6 applications
    {
      announcementIndex: 2,
      userIndex: 2,
      status: ApplicationStatus.FINAL_PASS,
    },
    {
      announcementIndex: 2,
      userIndex: 3,
      status: ApplicationStatus.FIRST_PASS,
    },
    { announcementIndex: 2, userIndex: 6, status: ApplicationStatus.SUBMITTED },
    { announcementIndex: 2, userIndex: 7, status: ApplicationStatus.SUBMITTED },
    { announcementIndex: 2, userIndex: 9, status: ApplicationStatus.REJECTED },
    { announcementIndex: 2, userIndex: 0, status: ApplicationStatus.SUBMITTED },
    // Announcement 4 (강원 문화콘텐츠 - CLOSED): 5 applications
    {
      announcementIndex: 4,
      userIndex: 3,
      status: ApplicationStatus.FINAL_PASS,
    },
    {
      announcementIndex: 4,
      userIndex: 7,
      status: ApplicationStatus.FINAL_PASS,
    },
    {
      announcementIndex: 4,
      userIndex: 4,
      status: ApplicationStatus.FIRST_PASS,
    },
    { announcementIndex: 4, userIndex: 6, status: ApplicationStatus.REJECTED },
    { announcementIndex: 4, userIndex: 9, status: ApplicationStatus.REJECTED },
    // Announcement 1 (로컬크리에이터 2기 - UPCOMING): 2 applications
    { announcementIndex: 1, userIndex: 1, status: ApplicationStatus.SUBMITTED },
    { announcementIndex: 1, userIndex: 5, status: ApplicationStatus.SUBMITTED },
    // Announcement 3 (심화과정 - UNPUBLISHED): 1 application
    { announcementIndex: 3, userIndex: 8, status: ApplicationStatus.SUBMITTED },
  ];

  const applications: Application[] = [];
  for (const entry of applicationEntries) {
    const user = users[entry.userIndex];
    const announcement = announcements[entry.announcementIndex];
    const application = applicationRepo.create({
      announcementId: announcement.id,
      userId: user.id,
      applicantName: user.name,
      applicantEmail: user.email,
      applicantPhone: user.phone,
      fileUrl1: `/uploads/demo/resume_${user.name}.pdf`,
      fileName1: `이력서_${user.name}.pdf`,
      fileUrl2:
        entry.status !== ApplicationStatus.SUBMITTED
          ? `/uploads/demo/portfolio_${user.name}.pdf`
          : null,
      fileName2:
        entry.status !== ApplicationStatus.SUBMITTED
          ? `포트폴리오_${user.name}.pdf`
          : null,
      referralSource: ['SNS', '지인추천', '검색', '뉴스레터', null][
        entry.userIndex % 5
      ],
      status: entry.status,
    });
    applications.push(await applicationRepo.save(application));
  }
  console.log(`Applications created: ${applications.length}`);

  // ── 6. Application Status Logs ──
  for (let i = 0; i < applications.length; i++) {
    const app = applications[i];
    const entry = applicationEntries[i];

    if (entry.status === ApplicationStatus.FIRST_PASS) {
      await statusLogRepo.save(
        statusLogRepo.create({
          applicationId: app.id,
          fromStatus: ApplicationStatus.SUBMITTED,
          toStatus: ApplicationStatus.FIRST_PASS,
          changedById: admin.id,
        }),
      );
    } else if (entry.status === ApplicationStatus.FINAL_PASS) {
      await statusLogRepo.save(
        statusLogRepo.create({
          applicationId: app.id,
          fromStatus: ApplicationStatus.SUBMITTED,
          toStatus: ApplicationStatus.FIRST_PASS,
          changedById: admin.id,
        }),
      );
      await statusLogRepo.save(
        statusLogRepo.create({
          applicationId: app.id,
          fromStatus: ApplicationStatus.FIRST_PASS,
          toStatus: ApplicationStatus.FINAL_PASS,
          changedById: admin.id,
        }),
      );
    } else if (entry.status === ApplicationStatus.REJECTED) {
      await statusLogRepo.save(
        statusLogRepo.create({
          applicationId: app.id,
          fromStatus: ApplicationStatus.SUBMITTED,
          toStatus: ApplicationStatus.REJECTED,
          changedById: admin.id,
        }),
      );
    }
  }
  console.log('Application status logs created');

  // ── 7. Activities (for FINAL_PASS applications) ──
  const finalPassApps = applications.filter(
    (_, i) => applicationEntries[i].status === ApplicationStatus.FINAL_PASS,
  );

  const activitiesCreated: Activity[] = [];
  for (const app of finalPassApps) {
    const entry = applicationEntries[applications.indexOf(app)];
    const announcement = announcements[entry.announcementIndex];

    const activity = activityRepo.create({
      userId: app.userId,
      programId: announcement.programId,
      announcementId: announcement.id,
      applicationId: app.id,
      participationStatus:
        entry.announcementIndex === 4
          ? ParticipationStatus.COMPLETED
          : ParticipationStatus.ACTIVE,
      role: [
        '콘텐츠 제작',
        '영상 편집',
        '농업 체험',
        '문화기획 보조',
        '공연 연출',
      ][entry.userIndex % 5],
    });
    activitiesCreated.push(await activityRepo.save(activity));
  }
  console.log(`Activities created: ${activitiesCreated.length}`);

  // ── 8. Evaluations (for some applications) ──
  const appsToEvaluate = applications.filter(
    (_, i) =>
      applicationEntries[i].status === ApplicationStatus.FINAL_PASS ||
      applicationEntries[i].status === ApplicationStatus.FIRST_PASS,
  );

  for (const app of appsToEvaluate) {
    const s1 = Math.floor(Math.random() * 5) + 6; // 6-10
    const s2 = Math.floor(Math.random() * 5) + 6;
    const s3 = Math.floor(Math.random() * 5) + 6;

    await evaluationRepo.save(
      evaluationRepo.create({
        applicationId: app.id,
        scoreCriteria1: s1,
        scoreCriteria2: s2,
        scoreCriteria3: s3,
        totalScore: s1 + s2 + s3,
        memo:
          s1 + s2 + s3 >= 25
            ? '우수한 지원자입니다.'
            : '보완이 필요한 부분이 있습니다.',
        evaluatedById: admin.id,
      }),
    );
  }
  console.log(`Evaluations created: ${appsToEvaluate.length}`);

  // ── 9. Activity evaluations (for completed activities) ──
  const completedActivities = activitiesCreated.filter(
    (a) => a.participationStatus === ParticipationStatus.COMPLETED,
  );
  for (const activity of completedActivities) {
    const scores = {
      participation: Math.floor(Math.random() * 3) + 8, // 8-10
      communication: Math.floor(Math.random() * 3) + 7,
      output: Math.floor(Math.random() * 3) + 7,
    };
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    activity.evalScores = scores;
    activity.evalTotalScore = total;
    activity.evalComment = '활동 기간 동안 성실하게 참여하였습니다.';
    activity.evaluatedById = admin.id;
    activity.evaluatedAt = new Date();
    await activityRepo.save(activity);
  }
  console.log(`Activity evaluations created: ${completedActivities.length}`);

  // ── 10. User Notes ──
  const notesData = [
    {
      userId: users[0].id,
      content:
        '로컬크리에이터 활동에 매우 적극적이며, SNS 운영 경험이 풍부합니다.',
      createdById: admin.id,
    },
    {
      userId: users[2].id,
      content: '귀농귀촌에 대한 의지가 강하며, 실제 농업 경험을 쌓고 있습니다.',
      createdById: admin.id,
    },
    {
      userId: users[3].id,
      content:
        '문화기획 분야에서 뛰어난 역량을 보이고 있습니다. 차기 프로그램에도 추천.',
      createdById: admin.id,
    },
  ];

  for (const data of notesData) {
    await userNoteRepo.save(userNoteRepo.create(data));
  }
  console.log(`User notes created: ${notesData.length}`);

  // ── 11. Interviews/Contents ──
  const interviewsData = [
    {
      thumbnailUrl:
        'https://placehold.co/600x400/0a1432/e1fb36?text=Interview1',
      title: '홍성에서 찾은 나의 길 - 로컬크리에이터 김지훈',
      description:
        '서울에서 충남 홍성으로 내려와 로컬크리에이터로 활동하며 지역과 함께 성장하는 이야기',
      link: 'https://example.com/interview/1',
      createdById: admin.id,
    },
    {
      thumbnailUrl:
        'https://placehold.co/600x400/0a1432/e1fb36?text=Interview2',
      title: '춘천의 문화를 기획하다 - 문화기획자 최영희',
      description:
        '강원도 춘천에서 지역 축제와 문화행사를 기획하며 청년의 시각으로 지역을 바꿔나가는 이야기',
      link: 'https://example.com/interview/2',
      createdById: admin.id,
    },
  ];

  for (const data of interviewsData) {
    await interviewRepo.save(interviewRepo.create(data));
  }
  console.log(`Interviews created: ${interviewsData.length}`);

  // ── Summary ──
  console.log('\n=== Demo Seed Summary ===');
  console.log(`Admin: 1 (admin@beeconnectlab.com / Admin1234!)`);
  console.log(`Programs: ${programs.length}`);
  console.log(`Announcements: ${announcements.length}`);
  console.log(`Users: ${users.length} (password: User1234!)`);
  console.log(`Applications: ${applications.length}`);
  console.log(`Activities: ${activitiesCreated.length}`);
  console.log(`Evaluations: ${appsToEvaluate.length}`);
  console.log(`User Notes: ${notesData.length}`);
  console.log(`Interviews: ${interviewsData.length}`);
  console.log('=========================\n');

  await AppDataSource.destroy();
  console.log('Demo seed completed successfully');
}

demoSeed().catch((error) => {
  console.error('Demo seed failed:', error);
  process.exit(1);
});
