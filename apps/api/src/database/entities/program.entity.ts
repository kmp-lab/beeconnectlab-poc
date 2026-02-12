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
import { Admin } from './admin.entity';
import { Announcement } from './announcement.entity';
import { Activity } from './activity.entity';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200 })
  host: string;

  @Column({ type: 'varchar', length: 200 })
  organizer: string;

  @Column({ name: 'activity_start_date', type: 'date' })
  activityStartDate: Date;

  @Column({ name: 'activity_end_date', type: 'date' })
  activityEndDate: Date;

  @Column({ name: 'region_sido', type: 'varchar', length: 50 })
  regionSido: string;

  @Column({
    name: 'region_sigungu',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  regionSigungu: string | null;

  @Column({ type: 'jsonb', nullable: true })
  benefits: string[] | null;

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: Admin;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Announcement, (announcement) => announcement.program)
  announcements: Announcement[];

  @OneToMany(() => Activity, (activity) => activity.program)
  activities: Activity[];
}
