import { AuthProvider, Gender, AccountStatus } from '../enums';

export interface IUser {
  id: string;
  email: string;
  passwordHash: string | null;
  provider: AuthProvider;
  providerId: string | null;
  name: string;
  phone: string;
  birthDate: Date;
  gender: Gender;
  profileImageUrl: string | null;
  residence: string | null;
  activityStatus: string;
  interestRegions: string[] | null;
  desiredJob: string | null;
  skills: string | null;
  accountStatus: AccountStatus;
  marketingConsent: boolean;
  specialHistory: string | null;
  managementRisk: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
