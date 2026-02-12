import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1770923033259 implements MigrationInterface {
  name = 'Init1770923033259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."admins_status_enum" AS ENUM('pending', 'approved')
        `);
    await queryRunner.query(`
            CREATE TABLE "admins" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(255) NOT NULL,
                "password_hash" character varying(255) NOT NULL,
                "name" character varying(50) NOT NULL,
                "phone" character varying(20) NOT NULL,
                "organization" character varying(100) NOT NULL DEFAULT '비커넥트랩',
                "status" "public"."admins_status_enum" NOT NULL DEFAULT 'pending',
                "approved_at" TIMESTAMP WITH TIME ZONE,
                "approved_by_id" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_051db7d37d478a69a7432df1479" UNIQUE ("email"),
                CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."activities_participation_status_enum" AS ENUM(
                'upcoming',
                'active',
                'period_ended',
                'completed',
                'dropped'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "activities" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "program_id" uuid NOT NULL,
                "announcement_id" uuid NOT NULL,
                "application_id" uuid NOT NULL,
                "participation_status" "public"."activities_participation_status_enum" NOT NULL,
                "role" character varying(200),
                "eval_comment" text,
                "eval_scores" jsonb,
                "eval_total_score" integer,
                "evaluated_by_id" uuid,
                "evaluated_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "programs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(200) NOT NULL,
                "host" character varying(200) NOT NULL,
                "organizer" character varying(200) NOT NULL,
                "activity_start_date" date NOT NULL,
                "activity_end_date" date NOT NULL,
                "region_sido" character varying(50) NOT NULL,
                "region_sigungu" character varying(50),
                "benefits" jsonb,
                "created_by_id" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_d43c664bcaafc0e8a06dfd34e05" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."announcements_publish_status_enum" AS ENUM('published', 'unpublished')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."announcements_recruit_status_enum" AS ENUM('upcoming', 'recruiting', 'closed')
        `);
    await queryRunner.query(`
            CREATE TABLE "announcements" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "program_id" uuid NOT NULL,
                "name" character varying(300) NOT NULL,
                "job_type" character varying(100) NOT NULL,
                "capacity" integer NOT NULL,
                "thumbnail_url" character varying(500) NOT NULL,
                "detail_content" text NOT NULL,
                "publish_status" "public"."announcements_publish_status_enum" NOT NULL DEFAULT 'unpublished',
                "recruit_status" "public"."announcements_recruit_status_enum" NOT NULL DEFAULT 'upcoming',
                "recruit_start_date" date NOT NULL,
                "recruit_end_date" date NOT NULL,
                "schedule_result" character varying(200),
                "schedule_training" character varying(200),
                "schedule_onsite" character varying(200),
                "view_count" integer NOT NULL DEFAULT '0',
                "created_by_id" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b3ad760876ff2e19d58e05dc8b0" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "application_status_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "application_id" uuid NOT NULL,
                "from_status" character varying(20) NOT NULL,
                "to_status" character varying(20) NOT NULL,
                "changed_by_id" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_cfaa99fbacd60caa6ffcfd2ea25" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "application_evaluations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "application_id" uuid NOT NULL,
                "score_criteria_1" integer NOT NULL DEFAULT '0',
                "score_criteria_2" integer NOT NULL DEFAULT '0',
                "score_criteria_3" integer NOT NULL DEFAULT '0',
                "total_score" integer NOT NULL DEFAULT '0',
                "memo" character varying(200),
                "evaluated_by_id" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_702ca0a01a485c7d2cb874e9cdb" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."applications_status_enum" AS ENUM(
                'submitted',
                'first_pass',
                'final_pass',
                'rejected'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "applications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "announcement_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "applicant_name" character varying(50) NOT NULL,
                "applicant_email" character varying(255) NOT NULL,
                "applicant_phone" character varying(20) NOT NULL,
                "file_url_1" character varying(500) NOT NULL,
                "file_name_1" character varying(255) NOT NULL,
                "file_url_2" character varying(500),
                "file_name_2" character varying(255),
                "referral_source" character varying(100),
                "status" "public"."applications_status_enum" NOT NULL DEFAULT 'submitted',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_938c0a27255637bde919591888f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "user_notes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "content" text NOT NULL,
                "created_by_id" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e6cd579b582af97475256da96fb" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."users_provider_enum" AS ENUM('email', 'kakao', 'google')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."users_account_status_enum" AS ENUM('active', 'inactive', 'withdrawn')
        `);
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(255) NOT NULL,
                "password_hash" character varying(255),
                "provider" "public"."users_provider_enum" NOT NULL,
                "provider_id" character varying(255),
                "name" character varying(50) NOT NULL,
                "phone" character varying(20) NOT NULL,
                "birth_date" date NOT NULL,
                "gender" "public"."users_gender_enum" NOT NULL,
                "profile_image_url" character varying(500),
                "residence" character varying(200),
                "activity_status" character varying(50) NOT NULL DEFAULT '',
                "interest_regions" jsonb,
                "desired_job" character varying(200),
                "skills" text,
                "account_status" "public"."users_account_status_enum" NOT NULL DEFAULT 'active',
                "marketing_consent" boolean NOT NULL DEFAULT false,
                "special_history" character varying(100),
                "management_risk" character varying(100),
                "last_login_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "interviews" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "thumbnail_url" character varying(500) NOT NULL,
                "title" character varying(300) NOT NULL,
                "description" text NOT NULL,
                "link" character varying(500) NOT NULL,
                "created_by_id" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_fd41af1f96d698fa33c2f070f47" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "admins"
            ADD CONSTRAINT "FK_244d40194d7d87b7c30d8bc7003" FOREIGN KEY ("approved_by_id") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "activities"
            ADD CONSTRAINT "FK_b82f1d8368dd5305ae7e7e664c2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "activities"
            ADD CONSTRAINT "FK_b2f5f4234f9ee55a8e64c79d69f" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "activities"
            ADD CONSTRAINT "FK_a4db440d6b722f5eae24fd3308f" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "activities"
            ADD CONSTRAINT "FK_56d1e9b55491b561cc75e7a5665" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "activities"
            ADD CONSTRAINT "FK_30e44cb383ec1db14e97aca1710" FOREIGN KEY ("evaluated_by_id") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "programs"
            ADD CONSTRAINT "FK_b44b72ef368c7a57f4777d81b0f" FOREIGN KEY ("created_by_id") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "announcements"
            ADD CONSTRAINT "FK_ac1993558eb48b5a9b4d3b1a764" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "announcements"
            ADD CONSTRAINT "FK_4a7663c7be336b96d81d876e16e" FOREIGN KEY ("created_by_id") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "application_status_logs"
            ADD CONSTRAINT "FK_e456a9bee61b079dce9bfff3b76" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "application_status_logs"
            ADD CONSTRAINT "FK_5b12853ccc2135b9e4f8da59683" FOREIGN KEY ("changed_by_id") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "application_evaluations"
            ADD CONSTRAINT "FK_d3df9e87358e242f9f607c9aa31" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "application_evaluations"
            ADD CONSTRAINT "FK_9888303965f5f40a9ec3004d2ef" FOREIGN KEY ("evaluated_by_id") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "applications"
            ADD CONSTRAINT "FK_3f312fa236d901b362302404635" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "applications"
            ADD CONSTRAINT "FK_9e7594d5b474d9cbebba15c1ae7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_notes"
            ADD CONSTRAINT "FK_d2a9cb672e3701a1f2692c034a4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_notes"
            ADD CONSTRAINT "FK_575e43f4865c9cfb375b93be9ae" FOREIGN KEY ("created_by_id") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "interviews"
            ADD CONSTRAINT "FK_6e55570fd5f35141174ef9587c6" FOREIGN KEY ("created_by_id") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "interviews" DROP CONSTRAINT "FK_6e55570fd5f35141174ef9587c6"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_notes" DROP CONSTRAINT "FK_575e43f4865c9cfb375b93be9ae"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_notes" DROP CONSTRAINT "FK_d2a9cb672e3701a1f2692c034a4"
        `);
    await queryRunner.query(`
            ALTER TABLE "applications" DROP CONSTRAINT "FK_9e7594d5b474d9cbebba15c1ae7"
        `);
    await queryRunner.query(`
            ALTER TABLE "applications" DROP CONSTRAINT "FK_3f312fa236d901b362302404635"
        `);
    await queryRunner.query(`
            ALTER TABLE "application_evaluations" DROP CONSTRAINT "FK_9888303965f5f40a9ec3004d2ef"
        `);
    await queryRunner.query(`
            ALTER TABLE "application_evaluations" DROP CONSTRAINT "FK_d3df9e87358e242f9f607c9aa31"
        `);
    await queryRunner.query(`
            ALTER TABLE "application_status_logs" DROP CONSTRAINT "FK_5b12853ccc2135b9e4f8da59683"
        `);
    await queryRunner.query(`
            ALTER TABLE "application_status_logs" DROP CONSTRAINT "FK_e456a9bee61b079dce9bfff3b76"
        `);
    await queryRunner.query(`
            ALTER TABLE "announcements" DROP CONSTRAINT "FK_4a7663c7be336b96d81d876e16e"
        `);
    await queryRunner.query(`
            ALTER TABLE "announcements" DROP CONSTRAINT "FK_ac1993558eb48b5a9b4d3b1a764"
        `);
    await queryRunner.query(`
            ALTER TABLE "programs" DROP CONSTRAINT "FK_b44b72ef368c7a57f4777d81b0f"
        `);
    await queryRunner.query(`
            ALTER TABLE "activities" DROP CONSTRAINT "FK_30e44cb383ec1db14e97aca1710"
        `);
    await queryRunner.query(`
            ALTER TABLE "activities" DROP CONSTRAINT "FK_56d1e9b55491b561cc75e7a5665"
        `);
    await queryRunner.query(`
            ALTER TABLE "activities" DROP CONSTRAINT "FK_a4db440d6b722f5eae24fd3308f"
        `);
    await queryRunner.query(`
            ALTER TABLE "activities" DROP CONSTRAINT "FK_b2f5f4234f9ee55a8e64c79d69f"
        `);
    await queryRunner.query(`
            ALTER TABLE "activities" DROP CONSTRAINT "FK_b82f1d8368dd5305ae7e7e664c2"
        `);
    await queryRunner.query(`
            ALTER TABLE "admins" DROP CONSTRAINT "FK_244d40194d7d87b7c30d8bc7003"
        `);
    await queryRunner.query(`
            DROP TABLE "interviews"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."users_account_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."users_gender_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."users_provider_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "user_notes"
        `);
    await queryRunner.query(`
            DROP TABLE "applications"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."applications_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "application_evaluations"
        `);
    await queryRunner.query(`
            DROP TABLE "application_status_logs"
        `);
    await queryRunner.query(`
            DROP TABLE "announcements"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."announcements_recruit_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."announcements_publish_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "programs"
        `);
    await queryRunner.query(`
            DROP TABLE "activities"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."activities_participation_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "admins"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."admins_status_enum"
        `);
  }
}
