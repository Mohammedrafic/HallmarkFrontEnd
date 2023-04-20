import { PageOfCollections } from '@shared/models/page.model';
import { ListOfSkills } from '@shared/models/skill.model';
import { ICellRendererParams } from '@ag-grid-community/core';

export interface WorkCommitmentFilters {
  pageNumber: number;
  pageSize: number;
}

export interface WorkCommitmentOrgHierarchies {
  id: number;
  workCommitmentId: number;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
}

export interface WorkCommitmentDetailsGroup {
  items: WorkCommitmentDetails[];
  id: string;
  name: string;
}

export interface WorkCommitmentDetails {
  availabilityRequirement: number;
  comments: string;
  criticalOrder: number;
  departmentId: number;
  departmentName: string;
  holiday: number;
  startDate: string | null;
  endDate: string | null;
  jobCode: string;
  masterWorkCommitmentId: number;
  masterWorkCommitmentName: string;
  minimumWorkExperience: number;
  schedulePeriod: number;
  skills: ListOfSkills[];
  workCommitmentId: number;
  workCommitmentOrgHierarchies: WorkCommitmentOrgHierarchies[];
}

export interface WorkCommitmentGrid {
  availabilityRequirement: number;
  comments: string;
  criticalOrder: number;
  departmentId: number;
  departmentName: string;
  holiday: number;
  startDate: string | null;
  endDate: string | null;
  jobCode: string;
  locationName: string[];
  locationIds: number[];
  masterWorkCommitmentId: number;
  masterWorkCommitmentName: string;
  minimumWorkExperience: number;
  regionName: string[];
  regionIds: string[];
  schedulePeriod: number;
  skillNames: string[];
  skillIds: number[];
  workCommitmentId: number;
}

export type WorkCommitmentsPage = PageOfCollections<WorkCommitmentDetails>;

export interface WorkCommitmentGridColumns extends ICellRendererParams {
  edit?: (commitment: WorkCommitmentGrid) => WorkCommitmentGrid;
}
