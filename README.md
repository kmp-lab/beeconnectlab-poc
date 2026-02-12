# 비커넥트랩 POC

청년과 지역을 연결하는 플랫폼. 청년 사용자가 지역 활동 공고를 탐색하고 지원하며, 관리자가 프로그램/공고/지원서/인재를 관리합니다.

## 기술 스택

| 영역                | 기술                                      |
| ------------------- | ----------------------------------------- |
| 모노레포            | pnpm workspace + Turborepo                |
| 백엔드 API          | NestJS 11 + TypeORM + PostgreSQL 16       |
| 프론트엔드 (청년)   | Next.js 15 (App Router) + Tailwind CSS v4 |
| 프론트엔드 (관리자) | Next.js 15 (App Router) + Tailwind CSS v4 |
| 인증                | JWT (httpOnly Cookie) + Passport.js       |
| 공유 패키지         | shared-types, eslint-config               |

## 프로젝트 구조

```
beeconnectlab-poc/
├── apps/
│   ├── api/          # NestJS 백엔드 (port 4000)
│   ├── web/          # 청년 프론트엔드 (port 3000)
│   └── admin/        # 관리자 프론트엔드 (port 3001)
├── packages/
│   ├── shared-types/ # 공유 TypeScript 타입
│   └── eslint-config/# 공유 ESLint 설정
├── docker-compose.yml
└── docs/             # 기획 문서
```

## 로컬 개발 환경 세팅

### 사전 요구사항

- Node.js 20+
- pnpm 10+
- Docker (PostgreSQL용)

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 필요한 값을 수정합니다:

```env
DB_HOST=localhost
DB_PORT=5436
DB_USERNAME=beeconnect
DB_PASSWORD=beeconnect
DB_DATABASE=beeconnectlab

JWT_SECRET=your-jwt-secret-change-me
JWT_REFRESH_SECRET=your-refresh-secret-change-me
```

### 3. PostgreSQL 실행

```bash
docker compose up -d
```

### 4. DB 마이그레이션

```bash
pnpm --filter api db:migrate
```

### 5. 시드 데이터

**기본 시드** (관리자 계정 1개):

```bash
pnpm --filter api seed
```

- 관리자: `admin@beeconnectlab.com` / `Admin1234!`

**데모 시드** (전체 데모 데이터):

```bash
pnpm --filter api seed:demo
```

- 프로그램 3개, 공고 5개, 청년 사용자 10명, 지원서 20건, 활동/평가/메모/인터뷰
- 청년 사용자 비밀번호: 모두 `User1234!`

### 6. 개발 서버 실행

```bash
pnpm dev
```

3개 앱이 동시에 실행됩니다:

| 앱    | URL                   | 설명        |
| ----- | --------------------- | ----------- |
| web   | http://localhost:3000 | 청년 사용자 |
| admin | http://localhost:3001 | 관리자      |
| api   | http://localhost:4000 | 백엔드 API  |

### 7. 빌드

```bash
pnpm build
```

### 8. 린트

```bash
pnpm lint
```

## 주요 기능

### 청년 사용자 (web)

- 소셜 로그인 (카카오, 구글) + 이메일 로그인
- 회원가입 (계정정보 + 부가정보 + 약관동의)
- 공고 목록 (카드 그리드, 모집상태 배지, D-day)
- 공고 상세 + 지원서 제출
- 마이페이지 (프로필, 지원이력, 참여활동)
- 내 정보 수정
- 인터뷰 목록, 소개 페이지

### 관리자 (admin)

- 프로그램 관리 (CRUD, 상태 자동 산정)
- 공고 관리 (CRUD, 복제, 모집상태 자동/수동)
- 지원서 관리 (필터, 상태변경, 평가, 엑셀 다운로드)
- 참가자 평가 (5개 기준 슬라이더, 역할, 코멘트)
- 청년 인재 관리 (검색, 필터, 메모, 엑셀)
- 콘텐츠(인터뷰) 관리
- 관리자 계정 관리 (가입 승인/삭제)

## 무료 배포 (Render)

Render.com의 무료 티어를 활용하면 데모 배포가 가능합니다.

### 구성

| 서비스     | Render 유형                  | 비용           |
| ---------- | ---------------------------- | -------------- |
| PostgreSQL | Managed PostgreSQL           | 무료 (256MB)   |
| api        | Web Service                  | 무료 (750h/월) |
| web        | Static Site 또는 Web Service | 무료           |
| admin      | Static Site 또는 Web Service | 무료           |

### 배포 순서

#### 1. PostgreSQL 생성

1. [Render Dashboard](https://dashboard.render.com/) 접속
2. New → PostgreSQL → Free plan 선택
3. 생성 후 **External Database URL** 복사

#### 2. API 배포

1. New → Web Service → GitHub 레포 연결
2. 설정:
   - **Root Directory**: `apps/api`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter api build`
   - **Start Command**: `node dist/main.js`
   - **Environment**: Node
3. 환경변수 추가:
   ```
   DATABASE_URL=<PostgreSQL External URL>
   JWT_SECRET=<랜덤 문자열>
   JWT_REFRESH_SECRET=<랜덤 문자열>
   CORS_ORIGINS=https://your-web.onrender.com,https://your-admin.onrender.com
   NODE_ENV=production
   ```

#### 3. Web (청년) 배포

1. New → Web Service → GitHub 레포 연결
2. 설정:
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter web build`
   - **Start Command**: `npx next start -p $PORT`
3. 환경변수:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.onrender.com
   ```

#### 4. Admin (관리자) 배포

1. Web과 동일하게 설정
2. **Root Directory**: `apps/admin`
3. 환경변수:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.onrender.com
   ```

### 주의사항

- Render 무료 티어는 15분 비활동 시 슬립됩니다 (첫 요청 시 30초~1분 대기)
- PostgreSQL 무료는 90일 후 만료 — 데모용으로 충분
- 파일 업로드는 로컬 디스크 저장이므로 배포 시 S3 연동이 필요합니다 (데모에서는 제외 가능)
