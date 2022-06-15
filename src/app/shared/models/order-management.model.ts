import { PageOfCollections } from '@shared/models/page.model';
import { Document } from '@shared/models/document.model';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderType } from '@shared/enums/order-type';
import { Duration } from '@shared/enums/durations';
import { JobClassification } from '@shared/enums/job-classification';
import { ReasonForRequisition } from '@shared/enums/reason-for-requisition';
import { BillRate, OrderBillRateDto } from './bill-rate.model';
import { JobDistributionModel } from './job-distribution.model';

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
  candidateJobId: number;
};

export type AgencyOrderManagementPage = PageOfCollections<AgencyOrderManagement>;

export type OrderCandidatesListPage = PageOfCollections<AgencyOrderCandidates>;

export type AgencyOrder = {
  orderId: number;
  organizationId: number;
};

export class OrderContactDetails {
  id?: number;
  orderId?: number;
  name: string;
  title: string;
  email: string;
  mobilePhone: string;
}

export class OrderWorkLocation {
  id: number;
  address: string;
  state: string;
  city: string;
  zipCode: string;
}

export class Order {
  id: number;
  title: string;
  regionId: number;
  locationId: number;
  departmentId: number;
  skillId: number;
  orderType: OrderType;
  projectTypeId: number | null;
  projectType?: string;
  projectNameId: number | null;
  projectName?: string;
  hourlyRate: number | null;
  openPositions: number | null;
  minYrsRequired: number | null;
  joiningBonus: number | null;
  compBonus: number | null;
  duration: Duration;
  jobStartDate: Date;
  jobEndDate: Date;
  shiftRequirementId: number;
  shiftStartTime: Date;
  shiftEndTime: Date;
  classification: JobClassification;
  onCallRequired: boolean;
  asapStart: boolean;
  criticalOrder: boolean;
  nO_OT: boolean;
  jobDescription: string;
  unitDescription: string;
  reasonForRequisition: ReasonForRequisition;
  billRates: BillRate[];
  jobDistributions: JobDistributionModel[];
  contactDetails: OrderContactDetails[];
  workLocations: OrderWorkLocation[];
  credentials: any[]; // ToDo: Add interface
  workflowId?: number;
  statusText?: string;
  locationName?: string;
  departmentName?: string;
  orderOpenDate?: Date;
  isLocked?: boolean;
  groupedCredentials?: Object;
  isSubmit: boolean;
  status: OrderStatus;
  organizationId?: number;
  totalPositions?: number;
  documents: Document[] | null;
}

export interface CreateOrderDto extends Omit<Order, 'id' | 'billRates' | 'documents'> {
  billRates: OrderBillRateDto[];
}

export interface EditOrderDto extends Omit<Order, 'billRates' | 'status' | 'documents'> {
  billRates: OrderBillRateDto[];
  deleteDocumentsGuids: string[];
}

export type AcceptJobDTO = {
  actualEndDate: string;
  actualStartDate: string;
  allowDeplayWoCredentials: boolean;
  candidateBillRate: number;
  clockId: number;
  guaranteedWorkWeek: string;
  jobId: number;
  nextApplicantStatus: {
    applicantStatus: number;
    statusText: string;
  }
  offeredBillRate: number;
  organizationId: number;
  requestComment: number;
}

export type CandidateProfile = {
  agencyId: number;
  candidateAgencyStatus: number;
  candidateProfileContactDetail: string;
  candidateProfileSkills: Array<string>;
  classification: number;
  createdAt: string;
  createdBy: string;
  dob: number;
  email: string;
  firstName: string;
  id: number;
  lastModifiedAt: string;
  lastModifiedBy: string;
  lastName: string;
  middleName: string;
  professionalSummary: string;
  profileStatus: number;
  ssn: number;
}

export type OrderCandidateJob = {
  actualEndDate: string;
  actualStartDate: string;
  availableStartDate: string;
  billRatesGroupId: number;
  candidateBillRate: number;
  candidateProfile: CandidateProfile;
  candidateProfileId: number;
  clockId: number;
  expAsTravelers: string;
  guaranteedWorkWeek: string;
  jobId: number;
  offeredBillRate: number;
  order: Order;
  orderId: number;
  organizationId: number;
  rejectBy: string;
  rejectDate: string;
  rejectReason: string;
  requestComment: string;
  workflowStepId: number;
  yearsOfExperience: number;
}
