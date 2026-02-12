# 비커넥트랩 - 데이터베이스 스키마

## 1. ERD 개요

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Admin   │     │   Program    │────<│ Announcement │
└──────────┘     └──────────────┘     └──────┬───────┘
                        │                     │
                        │                     │
                 ┌──────┴───────┐     ┌───────┴──────┐
                 │  Activity    │     │ Application  │
                 │ (참여 활동)   │     │  (지원서)     │
                 └──────────────┘     └───────┬──────┘
                                              │
┌──────────┐                          ┌───────┴──────┐
│   User   │──────────────────────────│  AppEval     │
│ (청년)    │                          │ (지원서 평가)  │
└──────────┘                          └──────────────┘
      │
      │         ┌──────────────┐
      └────────<│  UserNote    │
                │  (메모)       │
                └──────────────┘

┌──────────────┐
│  Interview   │
│  (콘텐츠)     │
└──────────────┘
```

## 2. 테이블 상세

### 2.1 users (청년 사용자)

| 컬럼              | 타입                                  | 제약조건                   | 설명                      |
| ----------------- | ------------------------------------- | -------------------------- | ------------------------- |
| id                | UUID                                  | PK                         |                           |
| email             | VARCHAR(255)                          | UNIQUE, NOT NULL           |                           |
| password_hash     | VARCHAR(255)                          | NULLABLE                   | 소셜 가입 시 null         |
| provider          | ENUM('email','kakao','google')        | NOT NULL                   | 가입 경로                 |
| provider_id       | VARCHAR(255)                          | NULLABLE                   | 소셜 로그인 ID            |
| name              | VARCHAR(50)                           | NOT NULL                   | 실명                      |
| phone             | VARCHAR(20)                           | NOT NULL                   |                           |
| birth_date        | DATE                                  | NOT NULL                   |                           |
| gender            | ENUM('male','female')                 | NOT NULL                   |                           |
| profile_image_url | VARCHAR(500)                          | NULLABLE                   |                           |
| residence         | VARCHAR(200)                          | NULLABLE                   | 거주지                    |
| activity_status   | VARCHAR(50)                           | NOT NULL, DEFAULT          | 활동 상태                 |
| interest_regions  | JSONB                                 | NULLABLE                   | 관심 지역 (복수)          |
| desired_job       | VARCHAR(200)                          | NULLABLE                   | 희망 직무                 |
| skills            | TEXT                                  | NULLABLE                   | 보유 역량                 |
| account_status    | ENUM('active','inactive','withdrawn') | NOT NULL, DEFAULT 'active' |                           |
| marketing_consent | BOOLEAN                               | NOT NULL, DEFAULT false    |                           |
| special_history   | VARCHAR(100)                          | NULLABLE                   | 특정 이력 (관리자 설정)   |
| management_risk   | VARCHAR(100)                          | NULLABLE                   | 관리 리스크 (관리자 설정) |
| last_login_at     | TIMESTAMP                             | NULLABLE                   |                           |
| created_at        | TIMESTAMP                             | NOT NULL, DEFAULT NOW()    |                           |
| updated_at        | TIMESTAMP                             | NOT NULL, DEFAULT NOW()    |                           |
| deleted_at        | TIMESTAMP                             | NULLABLE                   | Soft delete               |

### 2.2 admins (관리자)

| 컬럼           | 타입                       | 제약조건                       | 설명 |
| -------------- | -------------------------- | ------------------------------ | ---- |
| id             | UUID                       | PK                             |      |
| email          | VARCHAR(255)               | UNIQUE, NOT NULL               |      |
| password_hash  | VARCHAR(255)               | NOT NULL                       |      |
| name           | VARCHAR(50)                | NOT NULL                       |      |
| phone          | VARCHAR(20)                | NOT NULL                       |      |
| organization   | VARCHAR(100)               | NOT NULL, DEFAULT '비커넥트랩' |      |
| status         | ENUM('pending','approved') | NOT NULL, DEFAULT 'pending'    |      |
| approved_at    | TIMESTAMP                  | NULLABLE                       |      |
| approved_by_id | UUID                       | FK → admins.id, NULLABLE       |      |
| created_at     | TIMESTAMP                  | NOT NULL, DEFAULT NOW()        |      |
| deleted_at     | TIMESTAMP                  | NULLABLE                       |      |

### 2.3 programs (프로그램)

| 컬럼                | 타입         | 제약조건                | 설명             |
| ------------------- | ------------ | ----------------------- | ---------------- |
| id                  | UUID         | PK                      |                  |
| name                | VARCHAR(200) | NOT NULL                | 프로그램명       |
| host                | VARCHAR(200) | NOT NULL                | 주최             |
| organizer           | VARCHAR(200) | NOT NULL                | 주관             |
| activity_start_date | DATE         | NOT NULL                | 활동 시작일      |
| activity_end_date   | DATE         | NOT NULL                | 활동 종료일      |
| region_sido         | VARCHAR(50)  | NOT NULL                | 시/도            |
| region_sigungu      | VARCHAR(50)  | NULLABLE                | 시/군/구         |
| benefits            | JSONB        | NULLABLE                | 혜택 정보 (배열) |
| created_by_id       | UUID         | FK → admins.id          | 작성자           |
| created_at          | TIMESTAMP    | NOT NULL, DEFAULT NOW() |                  |
| updated_at          | TIMESTAMP    | NOT NULL, DEFAULT NOW() |                  |

> **프로그램 상태**는 컬럼으로 저장하지 않고, `activity_start_date` / `activity_end_date` 기준으로 API에서 실시간 계산한다.
>
> - 현재 < 시작일 → `예정`
> - 시작일 ≤ 현재 ≤ 종료일 → `진행중`
> - 현재 > 종료일 → `종료`

### 2.4 announcements (공고)

| 컬럼               | 타입                                   | 제약조건                        | 설명              |
| ------------------ | -------------------------------------- | ------------------------------- | ----------------- |
| id                 | UUID                                   | PK                              |                   |
| program_id         | UUID                                   | FK → programs.id, NOT NULL      |                   |
| name               | VARCHAR(300)                           | NOT NULL                        | 공고명            |
| job_type           | VARCHAR(100)                           | NOT NULL                        | 직무 유형         |
| capacity           | INTEGER                                | NOT NULL                        | 모집 인원         |
| thumbnail_url      | VARCHAR(500)                           | NOT NULL                        | 썸네일 이미지 URL |
| detail_content     | TEXT                                   | NOT NULL                        | 공고 상세 (HTML)  |
| publish_status     | ENUM('published','unpublished')        | NOT NULL, DEFAULT 'unpublished' | 게시 상태         |
| recruit_status     | ENUM('upcoming','recruiting','closed') | NOT NULL, DEFAULT 'upcoming'    | 모집 상태         |
| recruit_start_date | DATE                                   | NOT NULL                        | 모집 시작일       |
| recruit_end_date   | DATE                                   | NOT NULL                        | 모집 종료일       |
| schedule_result    | VARCHAR(200)                           | NULLABLE                        | 결과 발표 일정    |
| schedule_training  | VARCHAR(200)                           | NULLABLE                        | 사전 교육 일정    |
| schedule_onsite    | VARCHAR(200)                           | NULLABLE                        | 현장 체류 일정    |
| view_count         | INTEGER                                | NOT NULL, DEFAULT 0             | 조회수            |
| created_by_id      | UUID                                   | FK → admins.id                  | 등록자            |
| created_at         | TIMESTAMP                              | NOT NULL, DEFAULT NOW()         |                   |
| updated_at         | TIMESTAMP                              | NOT NULL, DEFAULT NOW()         |                   |

### 2.5 applications (지원서)

| 컬럼            | 타입                                                   | 제약조건                        | 설명                 |
| --------------- | ------------------------------------------------------ | ------------------------------- | -------------------- |
| id              | UUID                                                   | PK                              |                      |
| announcement_id | UUID                                                   | FK → announcements.id, NOT NULL |                      |
| user_id         | UUID                                                   | FK → users.id, NOT NULL         |                      |
| applicant_name  | VARCHAR(50)                                            | NOT NULL                        | 지원 시점 이름       |
| applicant_email | VARCHAR(255)                                           | NOT NULL                        | 지원 시점 이메일     |
| applicant_phone | VARCHAR(20)                                            | NOT NULL                        | 지원 시점 연락처     |
| file_url_1      | VARCHAR(500)                                           | NOT NULL                        | 필수 첨부파일        |
| file_name_1     | VARCHAR(255)                                           | NOT NULL                        |                      |
| file_url_2      | VARCHAR(500)                                           | NULLABLE                        | 선택 첨부파일        |
| file_name_2     | VARCHAR(255)                                           | NULLABLE                        |                      |
| referral_source | VARCHAR(100)                                           | NULLABLE                        | 아웃바운더 인지 경로 |
| status          | ENUM('submitted','first_pass','final_pass','rejected') | NOT NULL, DEFAULT 'submitted'   |                      |
| created_at      | TIMESTAMP                                              | NOT NULL, DEFAULT NOW()         |                      |
| updated_at      | TIMESTAMP                                              | NOT NULL, DEFAULT NOW()         |                      |

### 2.6 application_status_logs (지원 상태 변경 이력)

| 컬럼           | 타입        | 제약조건                       | 설명 |
| -------------- | ----------- | ------------------------------ | ---- |
| id             | UUID        | PK                             |      |
| application_id | UUID        | FK → applications.id, NOT NULL |      |
| from_status    | VARCHAR(20) | NOT NULL                       |      |
| to_status      | VARCHAR(20) | NOT NULL                       |      |
| changed_by_id  | UUID        | FK → admins.id                 |      |
| created_at     | TIMESTAMP   | NOT NULL, DEFAULT NOW()        |      |

### 2.7 application_evaluations (지원서 평가)

| 컬럼             | 타입         | 제약조건                       | 설명             |
| ---------------- | ------------ | ------------------------------ | ---------------- |
| id               | UUID         | PK                             |                  |
| application_id   | UUID         | FK → applications.id, NOT NULL |                  |
| score_criteria_1 | INTEGER      | NOT NULL, DEFAULT 0            | 평가 기준 1 점수 |
| score_criteria_2 | INTEGER      | NOT NULL, DEFAULT 0            | 평가 기준 2 점수 |
| score_criteria_3 | INTEGER      | NOT NULL, DEFAULT 0            | 평가 기준 3 점수 |
| total_score      | INTEGER      | NOT NULL, DEFAULT 0            | 합산             |
| memo             | VARCHAR(200) | NULLABLE                       |                  |
| evaluated_by_id  | UUID         | FK → admins.id                 |                  |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW()        |                  |

### 2.8 activities (참여 활동)

| 컬럼                 | 타입                                                           | 제약조건                        | 설명           |
| -------------------- | -------------------------------------------------------------- | ------------------------------- | -------------- |
| id                   | UUID                                                           | PK                              |                |
| user_id              | UUID                                                           | FK → users.id, NOT NULL         |                |
| program_id           | UUID                                                           | FK → programs.id, NOT NULL      |                |
| announcement_id      | UUID                                                           | FK → announcements.id, NOT NULL |                |
| application_id       | UUID                                                           | FK → applications.id, NOT NULL  |                |
| participation_status | ENUM('upcoming','active','period_ended','completed','dropped') | NOT NULL                        |                |
| role                 | VARCHAR(200)                                                   | NULLABLE                        | 역할           |
| eval_comment         | TEXT                                                           | NULLABLE                        | 평가 코멘트    |
| eval_scores          | JSONB                                                          | NULLABLE                        | 평가 점수 상세 |
| eval_total_score     | INTEGER                                                        | NULLABLE                        | 평가 총점      |
| evaluated_by_id      | UUID                                                           | FK → admins.id, NULLABLE        |                |
| evaluated_at         | TIMESTAMP                                                      | NULLABLE                        |                |
| created_at           | TIMESTAMP                                                      | NOT NULL, DEFAULT NOW()         |                |
| updated_at           | TIMESTAMP                                                      | NOT NULL, DEFAULT NOW()         |                |

> **참여 상태** 자동 산정:
>
> - 활동 시작일 이전 → `upcoming` (활동 예정)
> - 활동 시작일 이후 → `active` (활동 중)
> - 활동 종료일 이후 → `period_ended` (활동 기간 종료)
> - 운영자 수동 → `completed` (수료), `dropped` (중도 이탈)

### 2.9 interviews (콘텐츠/인터뷰)

| 컬럼          | 타입         | 제약조건                | 설명              |
| ------------- | ------------ | ----------------------- | ----------------- |
| id            | UUID         | PK                      |                   |
| thumbnail_url | VARCHAR(500) | NOT NULL                |                   |
| title         | VARCHAR(300) | NOT NULL                |                   |
| description   | TEXT         | NOT NULL                |                   |
| link          | VARCHAR(500) | NOT NULL                | 브런치 게시글 URL |
| created_by_id | UUID         | FK → admins.id          |                   |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW() |                   |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW() |                   |

### 2.10 user_notes (인재 메모)

| 컬럼          | 타입      | 제약조건                | 설명 |
| ------------- | --------- | ----------------------- | ---- |
| id            | UUID      | PK                      |      |
| user_id       | UUID      | FK → users.id, NOT NULL |      |
| content       | TEXT      | NOT NULL                |      |
| created_by_id | UUID      | FK → admins.id          |      |
| created_at    | TIMESTAMP | NOT NULL, DEFAULT NOW() |      |

## 3. 인덱스 전략

```sql
-- 자주 조회되는 필터/정렬 컬럼
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_name ON users(name);

CREATE INDEX idx_announcements_program_id ON announcements(program_id);
CREATE INDEX idx_announcements_publish_status ON announcements(publish_status);
CREATE INDEX idx_announcements_recruit_status ON announcements(recruit_status);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);

CREATE INDEX idx_applications_announcement_id ON applications(announcement_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_program_id ON activities(program_id);

CREATE INDEX idx_programs_created_at ON programs(created_at DESC);
```

## 4. TypeORM 엔티티 관계 요약

```
User (1) ──── (N) Application
User (1) ──── (N) Activity
User (1) ──── (N) UserNote

Program (1) ──── (N) Announcement
Program (1) ──── (N) Activity

Announcement (1) ──── (N) Application
Announcement (1) ──── (N) Activity

Application (1) ──── (N) ApplicationEvaluation
Application (1) ──── (N) ApplicationStatusLog
Application (1) ──── (0..1) Activity

Admin (1) ──── (N) Program (created_by)
Admin (1) ──── (N) Announcement (created_by)
Admin (1) ──── (N) Interview (created_by)
```
