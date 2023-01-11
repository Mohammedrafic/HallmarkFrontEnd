import { PageOfCollections } from "@shared/models/page.model";

export type CandidateWorkCommitment = {
  id?: number;
  name: string;
  regions: string[];
  locations: string[];
  startDate: Date;
  endDate: Date;
  jobCode: string;
  payRate: number;
  minWorkExperience: number;
  availRequirement: number;
  schedulePeriod: number;
  holiday: number;
  isCriticalOrder: boolean;
  comment: string;
}

export type CandidateWorkCommitmentsPage = PageOfCollections<CandidateWorkCommitment>;
