import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PublishStatus, RecruitStatus } from '@beeconnectlab/shared-types';
import { Admin } from './admin.entity';
import { Program } from './program.entity';
import { Application } from './application.entity';
import { Activity } from './activity.entity';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'program_id', type: 'uuid' })
  programId: string;

  @ManyToOne(() => Program, (program) => program.announcements)
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ name: 'job_type', type: 'varchar', length: 100 })
  jobType: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500 })
  thumbnailUrl: string;

  @Column({ name: 'detail_content', type: 'text' })
  detailContent: string;

  @Column({
    name: 'publish_status',
    type: 'enum',
    enum: PublishStatus,
    default: PublishStatus.UNPUBLISHED,
  })
  publishStatus: PublishStatus;

  @Column({
    name: 'recruit_status',
    type: 'enum',
    enum: RecruitStatus,
    default: RecruitStatus.UPCOMING,
  })
  recruitStatus: RecruitStatus;

  @Column({ name: 'recruit_start_date', type: 'date' })
  recruitStartDate: Date;

  @Column({ name: 'recruit_end_date', type: 'date' })
  recruitEndDate: Date;

  @Column({
    name: 'schedule_result',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  scheduleResult: string | null;

  @Column({
    name: 'schedule_training',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  scheduleTraining: string | null;

  @Column({
    name: 'schedule_onsite',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  scheduleOnsite: string | null;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: Admin;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Application, (application) => application.announcement)
  applications: Application[];

  @OneToMany(() => Activity, (activity) => activity.announcement)
  activities: Activity[];
}
