import { AdminStatus } from '../enums';

export interface IAdmin {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  organization: string;
  status: AdminStatus;
  approvedAt: Date | null;
  approvedById: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}
