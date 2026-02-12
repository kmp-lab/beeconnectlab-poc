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
import { ApplicationStatus } from '@beeconnectlab/shared-types';
import { User } from './user.entity';
import { Announcement } from './announcement.entity';
import { ApplicationStatusLog } from './application-status-log.entity';
import { ApplicationEvaluation } from './application-evaluation.entity';
import { Activity } from './activity.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'announcement_id', type: 'uuid' })
  announcementId: string;

  @ManyToOne(() => Announcement, (announcement) => announcement.applications)
  @JoinColumn({ name: 'announcement_id' })
  announcement: Announcement;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'applicant_name', type: 'varchar', length: 50 })
  applicantName: string;

  @Column({ name: 'applicant_email', type: 'varchar', length: 255 })
  applicantEmail: string;

  @Column({ name: 'applicant_phone', type: 'varchar', length: 20 })
  applicantPhone: string;

  @Column({ name: 'file_url_1', type: 'varchar', length: 500 })
  fileUrl1: string;

  @Column({ name: 'file_name_1', type: 'varchar', length: 255 })
  fileName1: string;

  @Column({ name: 'file_url_2', type: 'varchar', length: 500, nullable: true })
  fileUrl2: string | null;

  @Column({ name: 'file_name_2', type: 'varchar', length: 255, nullable: true })
  fileName2: string | null;

  @Column({
    name: 'referral_source',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  referralSource: string | null;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
  })
  status: ApplicationStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ApplicationStatusLog, (log) => log.application)
  statusLogs: ApplicationStatusLog[];

  @OneToMany(
    () => ApplicationEvaluation,
    (evaluation) => evaluation.application,
  )
  evaluations: ApplicationEvaluation[];

  @OneToMany(() => Activity, (activity) => activity.application)
  activities: Activity[];
}
