import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ParticipationStatus } from '@beeconnectlab/shared-types';
import { User } from './user.entity';
import { Program } from './program.entity';
import { Announcement } from './announcement.entity';
import { Application } from './application.entity';
import { Admin } from './admin.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.activities)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'program_id', type: 'uuid' })
  programId: string;

  @ManyToOne(() => Program, (program) => program.activities)
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({ name: 'announcement_id', type: 'uuid' })
  announcementId: string;

  @ManyToOne(() => Announcement, (announcement) => announcement.activities)
  @JoinColumn({ name: 'announcement_id' })
  announcement: Announcement;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => Application, (application) => application.activities)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({
    name: 'participation_status',
    type: 'enum',
    enum: ParticipationStatus,
  })
  participationStatus: ParticipationStatus;

  @Column({ type: 'varchar', length: 200, nullable: true })
  role: string | null;

  @Column({ name: 'eval_comment', type: 'text', nullable: true })
  evalComment: string | null;

  @Column({ name: 'eval_scores', type: 'jsonb', nullable: true })
  evalScores: Record<string, number> | null;

  @Column({ name: 'eval_total_score', type: 'int', nullable: true })
  evalTotalScore: number | null;

  @Column({ name: 'evaluated_by_id', type: 'uuid', nullable: true })
  evaluatedById: string | null;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'evaluated_by_id' })
  evaluatedBy: Admin | null;

  @Column({ name: 'evaluated_at', type: 'timestamptz', nullable: true })
  evaluatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
