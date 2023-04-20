import { PageOfCollections } from "@shared/models/page.model";

export type CandidateWorkCommitment = {
  id?: number;
  employeeId?: number;
  workCommitmentIds: number[];
  name?: string;
  regions?: string[];
  locations?: string[];
  regionIds?: number[];
  locationIds: number[];
  startDate: string | Date;
  endDate: string | Date;
  jobCode: string;
  payRate: number;
  minWorkExperience: number;
  availRequirement: number;
  schedulePeriod: number;
  holiday: number;
  criticalOrder: number;
  comment: string;
  created?: string | Date;
  isActive: boolean;
}

export type CandidateWorkCommitmentsPage = PageOfCollections<CandidateWorkCommitment>;
