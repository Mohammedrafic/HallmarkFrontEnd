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
  availabilityRequirement: number | null;
  comments: string;
  criticalOrder: number | null;
  departmentId: number;
  departmentName: string;
  holiday: number | null;
  startDate: string;
  endDate: string | null;
  jobCode: string;
  masterWorkCommitmentId: number;
  masterWorkCommitmentName: string;
  minimumWorkExperience: number | null;
  schedulePeriod: number | null;
  skills: ListOfSkills[];
  workCommitmentId: number;
  workCommitmentOrgHierarchies: WorkCommitmentOrgHierarchies[];
  allRegionsSelected :boolean;
  allLocationsSelected :boolean;
}

export interface WorkCommitmentGrid {
  availabilityRequirement: number | null;
  comments: string;
  criticalOrder: number | null;
  departmentId: number;
  departmentName: string;
  holiday: number | null;
  startDate: string | null;
  endDate: string | null;
  jobCode: string;
  locationName: string[];
  locationIds: string[];
  masterWorkCommitmentId: number;
  masterWorkCommitmentName: string;
  minimumWorkExperience: number | null;
  regionName: string[];
  regionIds: string[];
  schedulePeriod: number | null;
  skillNames: string[];
  skillIds: number[];
  workCommitmentId: number;
 allRegionsSelected :boolean;
  allLocationsSelected :boolean;
}

export type WorkCommitmentsPage = PageOfCollections<WorkCommitmentDetails>;

export interface WorkCommitmentGridColumns extends ICellRendererParams {
  edit?: (commitment: WorkCommitmentGrid) => WorkCommitmentGrid;
}
