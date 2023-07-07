import { CandidateModel } from '@client/order-management/components/add-edit-reorder/models/candidate.model';
import { ApplicantStatus as CandidateStatus, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { Duration } from '@shared/enums/durations';
import { JobClassification } from '@shared/enums/job-classification';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderType } from '@shared/enums/order-type';
import { FilterOrderStatusText } from '@shared/enums/status';
import { JobCancellation } from '@shared/models/candidate-cancellation.model';
import { Document } from '@shared/models/document.model';
import { PageOfCollections } from '@shared/models/page.model';
import { BillRate, OrderBillRateDto } from './bill-rate.model';
import { JobDistributionModel } from './job-distribution.model';
import { IrpPrimarySkill } from './skill.model';
import { CandidateProfileContactDetail } from './candidate.model';
/**
 * TODO: rework classes with interfaces.
 */
export class OrderManagement {
  id: number;
  publicId?: number;
  reOrderFromId?: number;
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
  shiftStartTime?: string;
  shiftEndTime?: string;
  shift?: string; // used only in UI to group and show shiftStartTime - shiftEndTime range
  skillId: number;
  skillName: string;
  orderType: number;
  billRate: number;
  numberOfOpenPositions: number;
  openPositions: number;
  candidates: number;
  startDate: string;
  isLocked?: boolean;
  isTemplate?: boolean;
  reOrderCount?: number;
  isMoreMenuWithDeleteButton?: boolean; // used only in UI to show correct options in context menu
  children: OrderManagementChild[];
  reOrders?: OrderManagement[];
  shiftsNext90Days?: number;
  positions?: number;
  agencies?: string[] | null;
  allAgencies?: boolean;
  jobStartDate?: Date;
  jobEndDate?: Date;
  orderCloseDate?: string;
  orderClosureReason?: string;
  orderClosureReasonId?: string;
  organizationPrefix: string;
  commentContainerId?: number;
  extensionFromId?: number | null;
  irpOrderMetadata?: IRPMetaData;
  irpCandidatesCount?: number;
  activeCandidatesCount?: number;
  isLockedIRP: boolean;
}

export interface IRPOrderManagement {
  criticalOrder: boolean;
  shiftStartDateTime: string;
  shiftEndDateTime: string;
  id: number;
  organizationId: number;
  organizationPrefix: string;
  publicId: number;
  status: number;
  statusText: string;
  isCritical: boolean;
  orderType: number;
  skillId: number;
  skillName: string;
  numberOfPositions: number;
  numberOfOpenPositions: number;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  startDate: string;
  endDate: string;
  jobDate: string;
  shiftStartTime: string;
  shiftEndTime: string;
  irpCandidatesCount: number;
  vmsCandidatesCount: number;
  creationDate: string;
  isLocked: boolean;
  acceptedCandidates: null;
  acceptedEmployees: null;
  isMoreMenuWithDeleteButton?: boolean;
  children: OrderManagementChild[];
  isLockedIRP: boolean;
}

export interface GetOrdersJourney{
  id: number;
  orderId: string;
  status:  string;
  system:  string;
  type:  string;
  jobTitle:  string;
  skill:  string;
  creationDate: Date,
  publishedInIRP: Date|null,
  publishedInVMS: Date|null,
  noOfDaysInIRP?: number,
  noOfDaysInVMS?: number,
  revokedInVMS: Date|null
}

export interface IRPCandidateForPosition {
  system: string;
  rowsSource: IRPOrderPosition[]
}

export interface IRPOrderPosition {
  orderId: number;
  organizationId: number;
  candidateStatus: number | string;
  orderPublicId: number | string;
  orderStatus: number | string;
  employeeId: number;
  firstName: string;
  businessUnitName: string;
  middleName: string;
  lastName: string;
  primarySkillId: number;
  primarySkillName: string;
  option: string;
  contract: boolean;
  lastShiftScheduledStartTime: string;
  lastShiftScheduledEndTime: string;
  nextShiftScheduledStartTime: string;
  nextShiftScheduledEndTime: string;
  scheduledWeeklyHours: number;
  overtime: number;
  skillToolTip: boolean;
  fullSkillName: string;
  system: number | string;
  positionId: string;
  organizationPrefix: string;
  publicId: number;
  billRate?: number | string | null;
  actualStartDate?: Date | string | null;
  actualEndDate?: Date | string | null;
}

export interface IrpPositionSkillName {
  skillToolTip: boolean;
  skill: string;
  fullSkillName: string,
}

export interface IRPOrderPositionDisplay {
  orderId: number;
  organizationId: number;
  candidateStatus: string;
  employeeId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  primarySkillId: number;
  primarySkillName: string;
  option: string;
  contract: string;
  lastShiftScheduledStartTime: string;
  lastShiftScheduledEndTime: string;
  nextShiftScheduledStartTime: string;
  nextShiftScheduledEndTime: string;
  scheduledWeeklyHours: number;
  overtime: number;
  name: string;
}

export interface IRPOrderPositionMain {
  orderId: number;
  candidates: IRPOrderPosition[];
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
export type IRPOrderManagementPage = PageOfCollections<IRPOrderManagement>;
export type OrdersJourneyPage = PageOfCollections<GetOrdersJourney>;

export type AgencyOrderManagement = {
  orderId: number;
  id?: number;
  publicId?: number;
  reOrderId?: number;
  reOrderFromId?: number;
  statusText: string;
  status: OrderStatus;
  jobTitle: string;
  skill: string;
  location: string;
  numberOfPositions: number;
  numberOfOpenPositions: number;
  department: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  orderType: OrderType;
  billRate: number;
  candidatesCount: number;
  isLocked: boolean;
  jobStartDate: string;
  reOrderCount?: number;
  organizationId: number;
  organizationName: string;
  children: OrderManagementChild[];
  reOrders?: OrderManagement[];
  shiftsNext90Days?: number;
  positions?: number;
  agencies?: string[] | null;
  allAgencies?: boolean;
  orderCloseDate?: string;
  orderClosureReason?: string;
  orderClosureReasonId?: string;
  organizationPrefix: string;
  extensionFromId?: number;
  candidates?: CandidateModel[];
  irpOrderMetadata?: IRPMetaData;
};

export interface OrderManagementChild  {
  organizationPrefix: string;
  actualEndDate?: string;
  actualStartDate?: string;
  system: string | number;
  orderId: number;
  orderPublicId?: number;
  candidateBillRate: number;
  candidateId: number;
  candidateMasterCredentialIds: number[];
  candidateStatus: CandidateStatus;
  firstName: string;
  jobId: number;
  lastName: string;
  middleName: string;
  onboardedPercentage: number;
  orderStatus: OrderStatus;
  organizationId: number;
  positionId: number;
  statusName: string;
  submissionsPercentage: number;
  agencyName: string;
  deployedCandidateInfo: null | {
    jobId: number;
    organizationId: number;
  };
  selected: any;
  closeDate?: string;
  positionClosureReason?: string;
  positionClosureReasonId?: number;
  commentContainerId?: number;
};

export type OrderCandidatesList = {
  candidateId: number;
  firstName: string;
  hourlyBillRate: number;
  lastName: string;
  middleName?: string;
  candidateProfileId: number;
  onboardedPercentage: number;
  skill: string;
  status: number;
  statusName: string;
  submissionsPercentage: number;
  orderStatus: OrderStatus;
  candidateJobId: number;
  deployedCandidateInfo: null | {
    jobId: number;
    organizationId: number;
  };
  candidateStatus?: CandidateStatus;
  agencyName?: string;
  organizationId?: number;
  workflowStepType: WorkflowStepType;
  availabilityOverlap?: OrderAvailabilityOverlap;
};

export interface WorkflowStepType {
  closeDate: string;
  rejectDate: string;
  status: string;
  type: number;
  withdrawDate: string;
  workflowStepId: number;
}

export type AgencyOrderManagementPage = PageOfCollections<AgencyOrderManagement>;

export type AgencyOrderFilters = {
  orderBy?: string;
  pageNumber?: number;
  pageSize?: number;
  regionIds?: number[];
  locationIds?: number[];
  departmentsIds?: number[];
  orderPublicId?: string | null;
  reOrderId?: number;
  skillIds?: number[];
  candidateStatuses?: number[];
  candidatesCountFrom?: number | null;
  candidatesCountTo?: number | null;
  organizationIds?: number[];
  orderTypes?: number[];
  orderStatuses?: (string | number)[];
  jobTitle?: string;
  billRateFrom?: number | null;
  billRateTo?: number | null;
  openPositions?: number | null;
  jobStartDate?: Date | null;
  jobEndDate?: Date | null;
  includeReOrders?: boolean;
  annualSalaryRangeFrom?: string | null;
  annualSalaryRangeTo?: string | null;
  creationDateFrom?: Date | null;
  creationDateTo?: Date | null;
  distributedOnFrom?: Date | null;
  distributedOnTo?: Date | null;
  candidateName?: string | null;
  projectTypeIds?: number | null;
  projectNameIds?: number | null;
  poNumberIds?: number | null;
  shift?: string | string[];
};

export type OrderCandidatesListPage = PageOfCollections<OrderCandidatesList>;

export type AgencyOrder = {
  orderId: number;
  organizationId: number;
  isLocked: boolean;
  isClosed?: boolean;
};

export class SuggestedDetails {
  workLocation: {
    address: string;
    state: string;
    city: string;
    zipCode: string;
  };
  contactDetails: {
    name: string;
    email: string;
    mobilePhone: string;
  };
}

export class OrderContactDetails {
  id?: number;
  orderId?: number;
  name: string;
  title: string;
  email: string;
  mobilePhone: string;
  isPrimaryContact: boolean;
}

export class OrderWorkLocation {
  id: number;
  address: string;
  state: string;
  city: string;
  zipCode: string;
}

export class GetPredefinedBillRatesData {
  orderType: OrderType;
  departmentId: number;
  skillId: number;
  jobStartDate?: string;
  jobEndDate?: string;
  ignoreUpdateBillRate?: boolean;
}

export interface IRPMetaData {
  orderId: number;
  contact: boolean;
  weekend: boolean;
  holiday: boolean;
  statusText: string;
  status: OrderStatus;
  skillName: string;
  skillId: number;
  orderOpenDate: Date;
}

export class Order {
  id: number;
  publicId?: number;
  reOrderFromId?: number;
  title: string;
  regionId: number;
  locationId: number;
  departmentId: number;
  skillId: number;
  skillName?: string;
  orderType: OrderType;
  poNumberId: number | null;
  projectTypeId: number | null;
  projectNameId: number | null;
  hourlyRate: number | null;
  openPositions: number | null;
  minYrsRequired: string | null;
  joiningBonus: number | null;
  compBonus: number | null;
  duration: Duration;
  jobStartDate: Date;
  jobEndDate: Date;
  shift: number;
  shiftStartTime: Date;
  shiftEndTime: Date;
  classifications: JobClassification;
  onCallRequired: boolean;
  asapStart: boolean;
  criticalOrder: boolean;
  jobDescription: string;
  unitDescription: string;
  orderRequisitionReasonId: number;
  orderRequisitionReasonName: string;
  billRates: BillRate[];
  jobDistributions: JobDistributionModel[];
  contactDetails: OrderContactDetails[];
  workLocations: OrderWorkLocation[];
  credentials: any[]; // ToDo: Add interface
  workflowId?: number;
  statusText: string;
  locationName?: string;
  departmentName?: string;
  jobDistributionValue?: number[];
  isIRPOnly?: boolean;
  jobDates?: Date | string;
  orderOpenDate?: Date;
  irpOrderMetadata?: IRPMetaData;
  isLocked?: boolean;
  groupedCredentials?: Object;
  isSubmit: boolean;
  status: OrderStatus;
  organizationId?: number;
  totalPositions?: number;
  acceptedPositions?: number;
  documents: Document[] | null;
  canApprove: boolean;
  reOrders?: ReOrder[] | null;
  reOrderFrom?: Order;
  reOrderId?: number;
  orderId?: number;
  contract?: boolean;
  candidates?: CandidateModel[];
  orderCloseDate?: string;
  orderClosureReason?: string;
  orderClosureReasonId?: string;
  isTemplate?: boolean;
  isQuickOrder?: boolean;
  organizationPrefix?: string;
  orderPlacementFee?: number;
  annualSalaryRangeFrom?: number;
  annualSalaryRangeTo?: number;
  commentContainerId?: number;
  extensionFromId?: number | null;
  extensionInitialOrderId?: number | null;
  extensionPublicId?: number | null;
  hasParentExtension?: boolean;
  hasExtensions?: boolean;
  allAgencies?: boolean;
  extensionInitialOrderPublicId?: number;
  regionName?: string;
  isIrpPerDiemOrderEditable?: boolean;
  /**
   * Mispelling on BE, should be - contract.
   */
  contact?: boolean;
  weekend?: boolean;
  holiday?: boolean;
  distributedOn?: string;
  creationDate?: string;
  canRevoke?: boolean;
  canProceedRevoke?: boolean;
  externalCommentsConfiguration?:boolean | null;
  activeCandidatesCount?: number;
  isLockedIRP?: boolean;
}

export class ReOrder {
  id: number;
  reOrderFromId: number;
  organizationId: number;
  status: OrderStatus;
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
  orderOpenDate: string;
  orderFillDate: string;
  children: OrderManagementChild[];
  reOrderCount: number;
  reOrders: string[];
  isLocked: boolean;
  agency: string[];
  positions: number;
  allAgencies: boolean;
  agencies: string[];
  shiftStartTime: string;
  shiftEndTime: string;
}

export interface CreateOrderDto extends Omit<Order, 'id' | 'billRates' | 'status' | 'statusText' | 'documents'> {
  billRates: OrderBillRateDto[];
  jobDistribution?: number[];
  removeLinkedSchedulesFromLta?: boolean;
}

export interface EditOrderDto extends Omit<Order, 'billRates' | 'status' | 'statusText' | 'documents'> {
  billRates: OrderBillRateDto[];
  deleteDocumentsGuids: string[];
}

export type AcceptJobDTO = {
  actualEndDate?: string;
  actualStartDate?: string;
  allowDeployWoCredentials?: boolean;
  candidateBillRate?: number;
  clockId?: number;
  guaranteedWorkWeek?: string;
  jobId: number;
  orderId: number;
  nextApplicantStatus: ApplicantStatus | null;
  offeredBillRate?: number;
  organizationId: number;
  requestComment?: string;
  billRates?: BillRate[];
  offeredStartDate?: string;
  skillName?: string;
  expAsTravelers?: number;
  availableStartDate?: string | null;
  candidatePayRate: string | null;
  billRatesUpdated?: boolean;
};

export type CandidateProfile = {
  agencyId: number;
  candidateAgencyStatus: number;
  candidateProfileSkills: Array<string>;
  classification: number;
  createdAt: string;
  createdBy: string;
  dob: string;
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
};

export type OrderCandidateJob = {
  actualEndDate: string;
  actualStartDate: string;
  availableStartDate: string;
  billRatesGroupId: number;
  candidateBillRate: number;
  candidateProfile: CandidateProfile;
  candidateProfileId: number;
  candidateStatus: CandidateStatus;
  clockId: number;
  expAsTravelers: string;
  guaranteedWorkWeek: string;
  jobId: number;
  offeredBillRate: number;
  order: Order;
  orderId: number;
  orderStatus: OrderStatus;
  organizationId: number;
  rejectBy: string;
  rejectDate: string;
  rejectReason: string;
  requestComment: string;
  workflowStepId: number;
  yearsOfExperience: number;
  notEligibilityMessage: string | null;
  applicantStatus: {
    applicantStatus: number;
    statusText: string;
  };
  billRates: BillRate[];
  organizationName: string;
  positionId: number;
  allowDeployCredentials: boolean;
  hasAllRequiredOnboardedCredentials: boolean;
  offeredStartDate: string;
  organizationPrefix: string;
  orderPublicId: number;
  closeDate?: string;
  positionClosureReason?: string;
  positionClosureReasonId?: number;
  commentContainerId?: number;
  reOrderDate?: string;
  jobCancellation?: JobCancellation;
  candidateSSNRequired:boolean;
  candidateDOBRequired:boolean;
  candidatePayRate: string | null;
  candidatePhone1Required:any;
  candidateAddressRequired:any;
  candidateProfileContactDetails: CandidateProfileContactDetail;
  wasActualStartDateChanged?: boolean;
};

export type CandidatesBasicInfo = {
  jobId: number;
  organizationId: number;
  organizationName: string;
  orderId: number;
  orderPublicId: string;
  candidateProfileId: number;
  positionId: number;
  billRatesGroupId: number;
  workflowStepId: number;
  candidateBillRate: number;
  offeredBillRate: number;
  expAsTravelers: number;
  onBoardDate: string;
  availableStartDate: string;
  requestComment: string;
  rejectDate: string;
  rejectBy: string;
  rejectReasonId: number;
  allowDeployCredentials: boolean;
  actualStartDate: string;
  actualEndDate: string;
  clockId: string;
  guaranteedWorkWeek: string;
};

export type ApplicantStatus = {
  applicantStatus: number;
  statusText: string;
  isEnabled?: boolean;
};

export class OrderFilter {
  orderBy?: string;
  pageNumber?: number;
  pageSize?: number;
  regionIds?: number[];
  locationIds?: number[];
  departmentsIds?: number[];
  reOrderId?: number;
  orderPublicId?: string | null;
  skillIds?: number[];
  orderTypes?: number[];
  jobTitle?: string;
  billRateFrom?: number | null;
  billRateTo?: number | null;
  openPositions?: number | null;
  jobStartDate?: Date | null;
  jobEndDate?: Date | null;
  orderStatuses?: (string | number)[];
  candidateStatuses?: number[];
  candidatesCountFrom?: number | null;
  candidatesCountTo?: number | null;
  agencyIds?: number[];
  agencyType?: string | number | null;
  includeReOrders?: boolean;
  sortModel?: SortModel = {};
  filterModel?: FilterModel = {};
  isTemplate?: boolean;
  templateTitle?: string;
  annualSalaryRangeFrom?: string | null;
  annualSalaryRangeTo?: string | null;
  creationDateFrom?: Date | null;
  creationDateTo?: Date | null;
  distributedOnFrom?: Date | null;
  distributedOnTo?: Date | null;
  candidateName?: string | null;
  projectTypeIds?: number | null;
  projectNameIds?: number | null;
  poNumberIds?: number | null;
  orderType?: number | null;
  contactEmails?: string | null;
  irpOnly?: boolean | null;
  shiftIds?: number[];
  reorderStatuses?: (string | number)[];
  shift?: string[] | string;
  isQuickLinkWidgetLTA?: boolean | null;
}

export class SortModel {
  sort?: string;
  colId?: string;
}

export class FilterModel {
  condition1?: FilterModel;
  condition2?: FilterModel;
  filter?: any;
  filterType?: string;
  type?: string;
  values?: string[];
  logicalOperator?: string;
  filterTo?: any;
  dateFrom?: string;
  dateTo?: string;
}

export class OrderPartnerAgency {
  id: number;
  name: string;
}

export class FilterOrderStatus {
  status: FilterOrderStatusText;
  statusText: string;
}

export class FilterStatus {
  status: number;
  statusText: string;
}

export class OrderFilterDataSource {
  partneredAgencies: OrderPartnerAgency[];
  orderStatuses: FilterOrderStatus[];
  candidateStatuses: FilterStatus[];
  poNumbers: { id: number; poNumber: string }[];
  projectNames: { id: number; projectName: string }[];
  specialProjectCategories: { id: number; projectType: string }[];
  reorderStatuses: FilterOrderStatus[];
}

export type CandidateListEvent = {
  orderId: number;
  organizationId: number;
  currentPage: number;
  pageSize: number;
  excludeDeployed: boolean;
  isAvailable: boolean;
  searchTerm?: string;
};

interface IrpCandidateShiftTime {
  lastShiftTime: string;
  nextShiftTime: string;
}

export interface IrpOrderCandidateDto {
  id: number;
  candidateProfileId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  profileStatus: number;
  primarySkill: IrpPrimarySkill;
  option: string;
  status: CandidatStatus;
  isOriented: boolean;
  isContract: boolean;
  lastShiftFrom: string;
  lastShiftTo: string;
  nextShiftFrom: string;
  nextShiftTo: string;
  candidateJobId: number;
  weeklyHoursSchedule: number;
  weekOvertime: number;
  payRate: number;
  organizationOrientationDate: string | null;
  departmentOrientationDate: string | null;
  availabilityOverlap: OrderAvailabilityOverlap | null;
}

export interface OrderAvailabilityOverlap {
  end: string;
  isFullOverlap: boolean;
  overlapHours: number;
  start: string;
  tooltip: string;
}

export type IrpOrderCandidate = IrpOrderCandidateDto & IrpCandidateShiftTime;

export interface IrpCandidatesParams {
  PageSize: number;
  PageNumber: number;
  isAvailable: boolean;
  searchTerm?: string;
}

export class CandidateCancellationReason{
  id: number;
  name: string;
}

export class CandidateCancellationReasonFilter{
  regionId?:number;
  locationId?:number;
}


export class OrderJourneyFilter {
  orderBy?: string;
  pageNumber?: number;
  pageSize?: number;
  regionIds?: number[];
  locationIds?: number[];
  departmentsIds?: number[];
  orderPublicId?: string | null;
  skillIds?: number[];
  orderTypes?: number[];
  jobTitle?: string;
  jobStartDate?: Date | null;
  jobEndDate?: Date | null;
  orderStatuses?: (string | number)[];
  includeInIRP?:boolean;
  includeInVMS?:boolean;
}

export class OnboardCandidateEmail {
  subjectMail ?: string;
  bodyMail ?: string;
  toList ?: string;
  status ?: number;
  fromMail ?: string;
  stream ?: Blob | null;
  extension ?: string;
  documentName ?: string;
}
