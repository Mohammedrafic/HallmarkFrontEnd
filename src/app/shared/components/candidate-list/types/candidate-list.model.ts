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
  region: string | null;
  candidateProfileSkills: string[];
  photoId: string | null;
  candidateStatus: ApplicantStatus;
};

export interface CandidateListRequest {
  orderBy: string;
  pageNumber: number;
  pageSize: number;
  profileStatuses: CandidateStatus[];
  skillsIds: number[];
  regionsIds: number[];
  includeDeployedCandidates: boolean;
}

export type CandidateListFilters = {
  profileStatuses?: CandidateStatus[];
  skillsIds?: number[];
  regionsIds?: number[];
};

export interface FilterColumn {
  dataSource: Array<any>;
  type: number;
  valueField: string;
  valueId: string;
  valueType: number;
}

export interface CandidateListFiltersColumn {
  profileStatuses: FilterColumn;
  skillsIds: FilterColumn;
  regionsIds: FilterColumn;
}

export type CandidateListExport = {
  filterQuery: {
    orderBy: string;
    profileStatuses: CandidateStatus[];
    skillsIds: number[];
    regionsIds: number[];
    includeDeployedCandidates: boolean;
    candidateProfileIds: any[] | null;
  };
  exportFileType: ExportedFileType;
  properties: string[];
  filename: string;
};

export type CandidateList = PageOfCollections<CandidateRow>;
