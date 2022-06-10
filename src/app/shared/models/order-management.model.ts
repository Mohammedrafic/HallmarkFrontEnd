import { PageOfCollections } from '@shared/models/page.model';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderType } from '@shared/enums/order-type';

export class OrderManagement {
  id: number;
  organizationId: number;
  status: number;
  statusText: string;
  jobTitle: string;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  skillId: number;
  skillName: string;
  orderType: number;
  billRate: number;
  openPositions: number;
  candidates: number;
  startDate: string;
  isLocked?: boolean;
  isMoreMenuWithDeleteButton?: boolean; // used only in UI to show correct options in context menu
}

export class OrderManagementFilter {
  orderBy: string;
  pageNumber: number;
  pageSize: number;
  regionIds: number[];
  locationIds: number[];
  departmentsIds: number[];
  orderId: number;
  skillIds: number[];
  orderTypes: number[];
}

export type OrderManagementPage = PageOfCollections<OrderManagement>;

export type AgencyOrderManagement = {
  orderId: number;
  statusText: string;
  status: OrderStatus;
  jobTitle: string;
  skill: string;
  location: string;
  numberOfPositions: number;
  department: string;
  orderType: OrderType;
  billRate: number;
  candidates: number;
  isLocked: boolean;
  jobStartDate: string;
  organizationId: number;
  organizationName: string;
};

export type AgencyOrderCandidates = {
  candidateId: number;
  firstName: string;
  hourlyBillRate: number;
  lastName: string;
  middleName?: string;
  onboardedPercentage: number;
  skill: string;
  status: number;
  statusName: string;
  submissionsPercentage: number;
};

export type AgencyOrderManagementPage = PageOfCollections<AgencyOrderManagement>;

export type OrderCandidatesListPage = PageOfCollections<AgencyOrderCandidates>;

export type AgencyOrder = {
  orderId: number;
  organizationId: number;
};


