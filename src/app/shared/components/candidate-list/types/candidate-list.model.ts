import { PageOfCollections } from '../../../models/page.model';
import { CandidateStatus } from '../../../enums/status';
import { ApplicantStatus } from '../../../enums/applicant-status.enum';
import { ExportedFileType } from '../../../enums/exported-file-type';

export type CandidateRow = {
  candidateProfileId: number;
  firstName: string;
  lastName: string;
  middleName: string | null;
  profileStatus: CandidateStatus;
  lastAssignmentEndDate: string | null;
  candidateProfileRegions: string[] | Array<string | { regionDescription: string }>;
  candidateProfileSkills: string[] | Array<string | { skillDescription: string }>;
  photoId: string | null;
  candidateStatus: ApplicantStatus;
};

export type IRPCandidate = {
  id?: number;
  hasRedFlag: boolean;
  redFlagDescription: string;
  employeeId: number
  firstName: string;
  middleName: string;
  lastName: string;
  employeeStatus: string;
  primarySkillName: string;
  employeeSkills: string[];
  hireDate: string;
  orgOrientation: string;
}

export interface CandidateListRequest {
  orderBy: string;
  pageNumber: number;
  pageSize: number;
  profileStatuses: CandidateStatus[];
  skillsIds: number[];
  regionsNames: string[];
  tab: number;
  candidateName: string | null;
  includeDeployedCandidates: boolean;
  candidateId?: string | null;
  locationIds?: number[];
  departmentIds?: number[];
  primarySkillIds?: number[];
  secondarySkillIds?: number[]; 
  hireDate?: string | null;
  credStartDate?: string | null;
  credEndDate?: string | null;
  credType? : number[];
  expiry? : {}
}

export type CandidateListFilters = {
  candidateName?: string | null;
  profileStatuses?: CandidateStatus[];
  skillsIds?: number[];
  regionsNames?: string[];
  tab?: number;
  candidateId?: string | null;
  locationIds?: number[];
  departmentIds?: number[];
  primarySkillIds?: number[];
  secondarySkillIds?: number[]; 
  hireDate?: string | null;
  credStartDate?: string | null;
  credEndDate?: string | null;
  credType? : number[];
  expiry? : any;
};

export interface FilterColumn {
  dataSource: Array<any>;
  type: number;
  valueField: string;
  valueId: string;
  valueType: number;
}

export interface CandidateNameFilterColumn {
  valueType: number;
  type: number;
}

export interface CandidateListFiltersColumn {
  profileStatuses?: FilterColumn;
  skillsIds?: FilterColumn;
  regionsNames?: FilterColumn;
  candidateName?: CandidateNameFilterColumn;
  candidateId?: CandidateNameFilterColumn;
  locationIds?: FilterColumn;
  departmentIds?: FilterColumn;
  primarySkillIds?: FilterColumn;
  secondarySkillIds?: FilterColumn;
  hireDate?: CandidateNameFilterColumn;
  credStartDate?: CandidateNameFilterColumn;
  credEndDate?: CandidateNameFilterColumn;
  credType? : FilterColumn;
  expiry : {};
}

export type CandidateListExport = {
  filterQuery: {
    orderBy: string;
    profileStatuses: CandidateStatus[];
    skillsIds: number[];
    regionsNames: string[];
    includeDeployedCandidates: boolean;
    candidateProfileIds: any[] | null;
  };
  exportFileType: ExportedFileType;
  properties: string[];
  filename: string;
};

export type CandidateList = PageOfCollections<CandidateRow>;

export type IRPCandidateList = PageOfCollections<IRPCandidate>;
