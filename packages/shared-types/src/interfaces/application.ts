import { ApplicationStatus } from '../enums';

export interface IApplication {
  id: string;
  announcementId: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  fileUrl1: string;
  fileName1: string;
  fileUrl2: string | null;
  fileName2: string | null;
  referralSource: string | null;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApplicationStatusLog {
  id: string;
  applicationId: string;
  fromStatus: string;
  toStatus: string;
  changedById: string;
  createdAt: Date;
}

export interface IApplicationEvaluation {
  id: string;
  applicationId: string;
  scoreCriteria1: number;
  scoreCriteria2: number;
  scoreCriteria3: number;
  totalScore: number;
  memo: string | null;
  evaluatedById: string;
  createdAt: Date;
}
