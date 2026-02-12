import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import {
  AuthProvider,
  Gender,
  AccountStatus,
} from '@beeconnectlab/shared-types';
import { Application } from './application.entity';
import { Activity } from './activity.entity';
import { UserNote } from './user-note.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash: string | null;

  @Column({ type: 'enum', enum: AuthProvider })
  provider: AuthProvider;

  @Column({ name: 'provider_id', type: 'varchar', length: 255, nullable: true })
  providerId: string | null;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({
    name: 'profile_image_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  profileImageUrl: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  residence: string | null;

  @Column({ name: 'activity_status', type: 'varchar', length: 50, default: '' })
  activityStatus: string;

  @Column({ name: 'interest_regions', type: 'jsonb', nullable: true })
  interestRegions: string[] | null;

  @Column({ name: 'desired_job', type: 'varchar', length: 200, nullable: true })
  desiredJob: string | null;

  @Column({ type: 'text', nullable: true })
  skills: string | null;

  @Column({
    name: 'account_status',
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  accountStatus: AccountStatus;

  @Column({ name: 'marketing_consent', type: 'boolean', default: false })
  marketingConsent: boolean;

  @Column({
    name: 'special_history',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  specialHistory: string | null;

  @Column({
    name: 'management_risk',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  managementRisk: string | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date | null;

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];

  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];

  @OneToMany(() => UserNote, (note) => note.user)
  userNotes: UserNote[];
}
