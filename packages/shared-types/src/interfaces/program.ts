export interface IProgram {
  id: string;
  name: string;
  host: string;
  organizer: string;
  activityStartDate: Date;
  activityEndDate: Date;
  regionSido: string;
  regionSigungu: string | null;
  benefits: string[] | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
