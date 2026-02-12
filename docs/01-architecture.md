# 비커넥트랩 - 시스템 아키텍처

## 1. 기술 스택 요약

| 영역                | 기술                           | 비고                         |
| ------------------- | ------------------------------ | ---------------------------- |
| 모노레포            | pnpm workspace + Turborepo     | 빌드 캐싱, 태스크 파이프라인 |
| 프론트엔드 (청년)   | Next.js 15 (App Router)        | `apps/web`                   |
| 프론트엔드 (관리자) | Next.js 15 (App Router)        | `apps/admin`                 |
| 백엔드 API          | NestJS 11                      | `apps/api`                   |
| DB                  | PostgreSQL 16                  | TypeORM                      |
| ORM                 | TypeORM                        | Entity 기반, Migration 지원  |
| 인증                | JWT + OAuth 2.0 (카카오, 구글) | Passport.js                  |
| 파일 스토리지       | AWS S3 (또는 MinIO 로컬)       | 첨부파일, 썸네일             |
| 이메일              | Nodemailer + AWS SES           | 비밀번호 재설정              |
| 엑셀                | exceljs                        | 지원서/인재 목록 다운로드    |
| 공유 패키지         | TypeScript 타입, 유틸리티      | `packages/*`                 |

## 2. 모노레포 디렉토리 구조

```
beeconnectlab-poc/
├── apps/
│   ├── web/                    # 청년 사용자 프론트엔드
│   │   ├── app/
│   │   │   ├── (auth)/         # 로그인, 회원가입, 비밀번호 재설정
│   │   │   ├── (public)/       # 소개, 인터뷰
│   │   │   ├── announcements/  # 공고 목록, 상세
│   │   │   ├── apply/          # 지원서 작성, 완료
│   │   │   ├── mypage/         # 마이페이지
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── admin/                  # 관리자 프론트엔드
│   │   ├── app/
│   │   │   ├── (auth)/         # 관리자 로그인, 가입
│   │   │   ├── accounts/       # 관리자 계정 관리
│   │   │   ├── programs/       # 프로그램 관리
│   │   │   ├── announcements/  # 공고 관리
│   │   │   ├── applications/   # 지원서 관리
│   │   │   ├── talents/        # 청년 인재 관리
│   │   │   ├── contents/       # 콘텐츠(인터뷰) 관리
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                    # NestJS 백엔드
│       ├── src/
│       │   ├── auth/           # 인증 모듈 (JWT, OAuth, Guard)
│       │   ├── users/          # 청년 사용자 모듈
│       │   ├── admins/         # 관리자 모듈
│       │   ├── programs/       # 프로그램 모듈
│       │   ├── announcements/  # 공고 모듈
│       │   ├── applications/   # 지원서 모듈
│       │   ├── evaluations/    # 평가 모듈
│       │   ├── activities/     # 참여 활동 모듈
│       │   ├── contents/       # 콘텐츠(인터뷰) 모듈
│       │   ├── files/          # 파일 업로드 모듈
│       │   ├── common/         # 공통 (데코레이터, 필터, 파이프 등)
│       │   ├── database/       # TypeORM 설정, Migration
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── test/
│       ├── nest-cli.json
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared-types/           # 공유 TypeScript 타입/인터페이스
│   │   ├── src/
│   │   │   ├── user.ts
│   │   │   ├── program.ts
│   │   │   ├── announcement.ts
│   │   │   ├── application.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                     # 공유 UI 컴포넌트 (선택)
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── eslint-config/          # 공유 ESLint 설정
│       ├── index.js
│       └── package.json
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .env.example
├── docker-compose.yml          # PostgreSQL, (MinIO)
└── docs/
```

## 3. 시스템 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                      클라이언트                           │
│                                                         │
│   ┌──────────────┐          ┌──────────────┐            │
│   │  apps/web    │          │  apps/admin  │            │
│   │  (Next.js)   │          │  (Next.js)   │            │
│   │  청년 사용자   │          │  관리자       │            │
│   │  :3000       │          │  :3001       │            │
│   └──────┬───────┘          └──────┬───────┘            │
│          │                         │                    │
└──────────┼─────────────────────────┼────────────────────┘
           │         API 요청         │
           └────────────┬────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    apps/api (NestJS)                     │
│                        :4000                             │
│                                                         │
│   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│   │  Auth  │ │ Users  │ │Programs│ │Announce│          │
│   │ Module │ │ Module │ │ Module │ │ Module │          │
│   └────────┘ └────────┘ └────────┘ └────────┘          │
│   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│   │ Apply  │ │  Eval  │ │Activity│ │Content │          │
│   │ Module │ │ Module │ │ Module │ │ Module │          │
│   └────────┘ └────────┘ └────────┘ └────────┘          │
│   ┌────────┐ ┌────────┐                                 │
│   │ Files  │ │ Admins │                                 │
│   │ Module │ │ Module │                                 │
│   └────────┘ └────────┘                                 │
└──────────┬──────────────────────┬───────────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│   PostgreSQL 16  │   │    AWS S3        │
│   (TypeORM)      │   │    파일 스토리지    │
└──────────────────┘   └──────────────────┘
```

## 4. 인증 아키텍처

### 4.1 청년 사용자 인증 흐름

```
┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│  카카오    │    │   구글     │    │  이메일    │    │ 비밀번호   │
│  OAuth    │    │  OAuth    │    │ 로그인     │    │  재설정    │
└─────┬─────┘    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
      │                │                │                │
      └────────────────┼────────────────┘                │
                       ▼                                 ▼
              ┌─────────────────┐              ┌─────────────────┐
              │  POST /auth/    │              │  POST /auth/    │
              │  {provider}     │              │  reset-password │
              └────────┬────────┘              └─────────────────┘
                       ▼
              ┌─────────────────┐
              │ JWT 토큰 발급     │
              │ (Access+Refresh) │
              └─────────────────┘
```

### 4.2 관리자 인증 흐름

- 이메일 전용 가입/로그인
- 가입 후 `대기` 상태 → 기존 관리자가 `승인` → 로그인 가능
- 최초 관리자 1명은 시드 데이터로 생성

### 4.3 JWT 전략

| 토큰          | 만료 | 저장 위치       |
| ------------- | ---- | --------------- |
| Access Token  | 15분 | httpOnly Cookie |
| Refresh Token | 7일  | httpOnly Cookie |

## 5. API 설계 원칙

- RESTful 설계 (자원 중심 URL)
- NestJS `ValidationPipe` + `class-validator`로 요청 검증
- 역할 기반 접근 제어: `@Roles('admin')`, `@Roles('user')` Guard
- 페이지네이션: `?page=1&limit=10` 쿼리 파라미터
- 정렬: 등록일시 기준 내림차순 기본
- 에러 응답: `HttpException` 표준 포맷

## 6. 파일 업로드 전략

- 썸네일 이미지: 최대 5MB, jpg/png/webp
- 지원서 첨부파일: 최대 10MB, pdf/doc/docx/hwp
- S3 Pre-signed URL 방식 또는 Multer 직접 업로드
- 파일명: `{uuid}_{originalname}` 형식으로 저장

## 7. 배포 구조 (향후)

```
┌─────────────────────────────────────┐
│            Vercel / AWS             │
│                                     │
│  apps/web   → Vercel (또는 ECS)      │
│  apps/admin → Vercel (또는 ECS)      │
│  apps/api   → AWS ECS / EC2         │
│  PostgreSQL → AWS RDS               │
│  S3         → AWS S3                │
└─────────────────────────────────────┘
```
