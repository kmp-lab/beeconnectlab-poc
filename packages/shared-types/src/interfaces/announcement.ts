import { PublishStatus, RecruitStatus } from '../enums';

export interface IAnnouncement {
  id: string;
  programId: string;
  name: string;
  jobType: string;
  capacity: number;
  thumbnailUrl: string;
  detailContent: string;
  publishStatus: PublishStatus;
  recruitStatus: RecruitStatus;
  recruitStartDate: Date;
  recruitEndDate: Date;
  scheduleResult: string | null;
  scheduleTraining: string | null;
  scheduleOnsite: string | null;
  viewCount: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
