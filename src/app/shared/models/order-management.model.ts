import { PageOfCollections } from '@shared/models/page.model';
import { BillRate } from '@shared/models/bill-rate.model';

// TODO: need to discuss with BE team as we have no in this returned model following fields:
//  "statusText": "string",
//  "jobTitle": "string",
//  "billRate": 0,
//  "startDate": "2022-06-06T14:44:02.412Z"
export class OrderManagement {
  id?: number;
  organizationId: number;
  status: number;
  title: string;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  skillId: number;
  skillName: string;
  orderType: number;
  projectTypeId: number;
  projectType: string;
  projectNameId: number;
  projectName: string;
  hourlyRate: number;
  openPositions: number;
  minYrsRequired: number;
  joiningBonus: number;
  compBonus: number;
  duration: number;
  jobStartDate: string;
  jobEndDate: string;
  shiftRequirementId: number;
  shiftRequirementName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  classification: number;
  onCallRequired: boolean;
  asapStart: boolean;
  criticalOrder: boolean;
  nO_OT: boolean;
  jobDescription: string;
  unitDescription: string;
  reasonForRequisition: number;
  jobDistributions: OrderManagementJobDistribution[];
  contactDetails: OrderManagementContactDetails[];
  workLocations: OrderManagementWorkLocation[];
  billRates: BillRate[];
  credentials: OrderManagementCredential[];
  billRatesGroupId: number;
  workflowId: number;
  workflowName: string;
}

export class OrderManagementJobDistribution {
  id: number;
  orderId: number;
  jobDistributionOption: number;
  agencyId: number;
}

export class OrderManagementContactDetails {
  id: number;
  orderId: number;
  name: string;
  title: string;
  email: string;
  mobilePhone: string;
}

export class OrderManagementWorkLocation {
  id: number;
  orderId: number;
  address: string;
  state: string;
  city: string;
  zipCode: string;
}

export class OrderManagementCredential {
  id: number;
  orderId: number;
  credentialId: number;
  credentialName: string;
  credentialTypeId: number;
  credentialType: string;
  reqForSubmission: boolean;
  reqForOnboard: boolean;
  optional: boolean;
  comment: string;
}

export type OrderManagementPage = PageOfCollections<OrderManagement>;
