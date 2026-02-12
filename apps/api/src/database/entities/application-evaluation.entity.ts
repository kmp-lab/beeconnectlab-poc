import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Application } from './application.entity';

@Entity('application_evaluations')
export class ApplicationEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => Application, (application) => application.evaluations)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'score_criteria_1', type: 'int', default: 0 })
  scoreCriteria1: number;

  @Column({ name: 'score_criteria_2', type: 'int', default: 0 })
  scoreCriteria2: number;

  @Column({ name: 'score_criteria_3', type: 'int', default: 0 })
  scoreCriteria3: number;

  @Column({ name: 'total_score', type: 'int', default: 0 })
  totalScore: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  memo: string | null;

  @Column({ name: 'evaluated_by_id', type: 'uuid' })
  evaluatedById: string;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'evaluated_by_id' })
  evaluatedBy: Admin;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
