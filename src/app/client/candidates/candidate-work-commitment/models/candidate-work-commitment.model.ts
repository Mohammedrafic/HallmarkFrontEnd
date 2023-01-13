import { PageOfCollections } from "@shared/models/page.model";

export type WorkCommitmentDataSource = {
  id: number;
  name: string;
}

export type CandidateWorkCommitment = {
  id?: number;
  employeeId?: number;
  workCommitmentId?: number;
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
}

export type CandidateWorkCommitmentsPage = PageOfCollections<CandidateWorkCommitment>;
