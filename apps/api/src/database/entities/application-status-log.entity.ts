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

@Entity('application_status_logs')
export class ApplicationStatusLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => Application, (application) => application.statusLogs)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'from_status', type: 'varchar', length: 20 })
  fromStatus: string;

  @Column({ name: 'to_status', type: 'varchar', length: 20 })
  toStatus: string;

  @Column({ name: 'changed_by_id', type: 'uuid' })
  changedById: string;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: Admin;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
