import { OrderType } from '@shared/enums/order-type';

export interface QuickOrderConditions {
  isSpecialProjectFieldsRequired: boolean;
  isPermPlacementOrder: boolean;
  isContactToPermOrder: boolean;
  isEditContactTitle: boolean;
  isTravelerOrder: boolean;
  isOpenPerDiem: boolean;
  isRegionsDropDownEnabled: boolean;
  isLocationsDropDownEnabled: boolean;
  isDepartmentsDropDownEnabled: boolean;
  isJobEndDateControlEnabled: boolean;
  agencyControlEnabled: boolean;
  isShiftTimeRequired: boolean;
  isFormDirty: boolean;
}

export interface OrganizationDTO {
  organization: number;
  title: string;
}

export interface OrderTypeDTO {
  orderType: OrderType;
}

export interface OrderInformationDTO {
  regionId: number;
  locationId: number;
  departmentId: number;
  skillId: number;
  hourlyRate: string;
  openPositions: number;
  duration: number;
  jobStartDate: string;
  jobEndDate: string;
  shift: number;
  shiftStartTime: string;
  shiftEndTime: string;
  orderPlacementFee: string;
  annualSalaryRangeFrom: number;
  annualSalaryRangeTo: number;
}

export interface JobDistribution {
  agencyId: number;
  id: number;
  jobDistributionOption: number;
  orderId: number;
}

export interface JobDistributionDescriptionDTO {
  jobDistribution: string;
  agency: number;
  jobDistributions: JobDistribution[];
  jobDescription: string;
  orderRequisitionReasonId: number;
  orderRequisitionReasonName: string;
}

export interface ContactDetailsDTO {
  title: string;
  name: string;
  email: string;
  isPrimaryContact: true,
}

export interface SpecialProjectDTO {
  projectTypeId: number;
  projectNameId: number;
  poNumberId: number;
}
