import { CandidatesBasicInfo } from '@shared/models/order-management.model';
import { PageOfCollections } from '@shared/models/page.model';
import { FilterColumn } from '@shared/models/filter.model';

export type OrderTab = {
  orderId: number;
  candidateId: number;
};

export interface CandidatesDetailsModel extends CandidatesBasicInfo {
  agencyId: number | null;
  organizationPrefix: string;
  startDate: string;
  classification: number;
  endDate: string;
  scheduledDate: string;
  department: string;
  location: string;
  middleName: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
}

export type CandidateDetailsPage = PageOfCollections<CandidatesDetailsModel>;

export type FilterColumnsModel = {
  orderTypes: FilterColumn;
  startDate: FilterColumn;
  endDate: FilterColumn;
  skillsIds: FilterColumn;
  regionsIds: FilterColumn;
};

export type FiltersModal = {
  regionsIds?: Array<number>;
  skillsIds?: Array<number>;
  startDate?: string;
  endDate?: string;
  orderTypes?: Array<number>;
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

export type NavigationTabModel = {
  active: number | null;
  pending: number | null;
  isRedirect: boolean;
};

export type CandidateMessage = {
  title: string | null;
  position: number | null;
};
