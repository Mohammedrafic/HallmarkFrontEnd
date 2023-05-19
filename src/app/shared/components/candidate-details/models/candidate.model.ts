import { CandidatesBasicInfo } from '@shared/models/order-management.model';
import { PageOfCollections } from '@shared/models/page.model';
import { FilterColumn } from '@shared/models/filter.model';

export type OrderTab = {
  orderId: number;
  candidateId: number | string;
  orderType: number | null;
  prefix: string;
};

export interface CandidatesDetailsModel extends CandidatesBasicInfo {
  agencyId: number | null;
  organizationPrefix: string;
  startDate: string;
  classifications: number[];
  endDate: string;
  scheduledDate: string;
  department: string;
  location: string;
  middleName: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  status: number;
  publicId: number;
  orderType: number;
}

export type CandidateDetailsPage = PageOfCollections<CandidatesDetailsModel>;

export type FilterColumnsModel = {
  orderTypes: FilterColumn;
  startDate: FilterColumn;
  endDate: FilterColumn;
  skillsIds: FilterColumn;
  regionsIds: FilterColumn;
  applicantStatuses : FilterColumn;
  locationIds:FilterColumn;
  departmentIds:FilterColumn;
};

export type FiltersModal = {
  regionsIds?: Array<number>;
  skillsIds?: Array<number>;
  startDate?: string;
  endDate?: string;
  orderTypes?: Array<number>;
  organizationIds?: number[];
  locationIds?: Array<number>;
  departmentIds?: Array<number>;
  applicantStatuses?: Array<number>;
};

export interface FiltersPageModal extends FiltersModal {
  pageNumber: number;
  pageSize: number;
  tab: number | null;
}

export type CandidatesDetailsRegions = {
  id: number;
  name: string;
  organizationId: number;
  organizationName: string;
};

export type CandidatesDetailsLocations = {
  id: number;
  name: string;
  organizationId: number;
  organizationName: string;
};

export type CandidatesDetailsDepartments = {
  id: number;
  name: string;
  organizationId: number;
  organizationName: string;
};

export type NavigationTabModel = {
  active: number | null;
  pending: number | null;
  isRedirect: boolean;
};
