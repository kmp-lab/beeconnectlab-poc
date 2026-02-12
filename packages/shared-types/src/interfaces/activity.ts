import { ParticipationStatus } from '../enums';

export interface IActivity {
  id: string;
  userId: string;
  programId: string;
  announcementId: string;
  applicationId: string;
  participationStatus: ParticipationStatus;
  role: string | null;
  evalComment: string | null;
  evalScores: Record<string, number> | null;
  evalTotalScore: number | null;
  evaluatedById: string | null;
  evaluatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
