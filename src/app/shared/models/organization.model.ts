import { Duration } from '@shared/enums/durations';
import { JobClassification } from '@shared/enums/job-classification';
import { OrderType } from '@shared/enums/order-type';
import { ReasonForRequisition } from '@shared/enums/reason-for-requisition';
import { SendDocumentAgency } from '../enums/send-document-agency';
import { BillRate, OrderBillRateDto } from './bill-rate.model';
import { JobDistributionModel } from './job-distribution.model';

export class Organization {
  createUnder?: {
    id: number,
    businessUnitType: number,
    name: string,
    parentUnitId?: number
  };
  parentBusinessUnitId?: number;
  organizationId?: number | null;
  generalInformation: GeneralInformation;
  billingDetails: BillingDetails;
  contactDetails: ContactDetails[];
  preferences: Preferences;

  constructor(organizationId: number, businessUnitId: number, generalInformation: GeneralInformation, billingDetails: BillingDetails, contactDetails: ContactDetails[], preferences: Preferences, isSameAsOrg: boolean) {
    if (organizationId) {
      this.organizationId = organizationId;
    }
    this.parentBusinessUnitId  = businessUnitId;
    this.generalInformation = generalInformation;
    this.generalInformation.organizationId = organizationId || 0;
    if (this.generalInformation.externalId === '') {
      this.generalInformation.externalId = null;
    }
    this.billingDetails = billingDetails;
    this.billingDetails.organizationId = organizationId || 0;
    this.billingDetails.sameAsOrganization = isSameAsOrg;
    this.contactDetails = contactDetails;
    this.contactDetails.forEach((contact: ContactDetails) => contact.organizationId = organizationId || 0);
    this.preferences = preferences;
    this.preferences.purchaseOrderBy = parseInt(this.preferences.purchaseOrderBy as string, 10);
    this.preferences.timesheetSubmittedBy = parseInt(this.preferences.timesheetSubmittedBy as string, 10);
    this.preferences.paymentOptions = parseInt(this.preferences.paymentOptions as string, 10);
    if (this.preferences.timePeriodInMins === '') {
      this.preferences.timePeriodInMins = null;
    }
    this.preferences.organizationId = organizationId || 0;
  }
}

export class GeneralInformation {
  id?: number;
  organizationId?: number;
  externalId?: number | string | null;
  taxId: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  state: string;
  country: number;
  city: string;
  zipCode: string;
  phone1Ext: string;
  phone2Ext: string;
  fax: string;
  website: string;
  status: number;
}

export class BillingDetails {
  id?: number;
  organizationId: number;
  adminUserId: number;
  sameAsOrganization: boolean;
  name: string;
  address: string;
  country: number;
  state: string;
  city: string;
  zipCode: string;
  phone1: string;
  phone2: string;
  ext: string;
  fax: string;
}

export class ContactDetails {
  id?: number;
  organizationId?: number;
  title: string;
  contactPerson: string;
  email: string;
  phoneNumberExt: string;
}

export class OrderContactDetails {
  id?: number;
  orderId?: number;
  name: string;
  title: string;
  email: string;
  mobilePhone: string;
}

export class Preferences {
  id?: number;
  organizationId?: number;
  paymentOptions: number | string;
  paymentDescription: string;
  timesheetSubmittedBy: number | string;
  weekStartsOn: number;
  considerLunch: boolean;
  purchaseOrderBy: number | string;
  sendDocumentToAgency: SendDocumentAgency;
  timePeriodInMins: number | string | null;
}

export class OrganizationPage {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: Organization[];
  pageNumber: number;
  totalCount: number;
  totalPages: number;
}

export class OrganizationDepartment {
  id: number;
  name: string;
}

export class OrganizationLocation {
  id: number;
  name: string;
  regionName?: string;
  departments: OrganizationDepartment[];
}

export class OrganizationRegion {
  id: number | null;
  name?: string;
  locations: any[] | null;
}

export class OrganizationStructure {
  organizationId: number;
  regions: OrganizationRegion[];
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
  hourlyRate: number;
  openPositions: number;
  minYrsRequired: number;
  joiningBonus: number;
  compBonus: number;
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
  status?: number;
  locationName?: string;
  departmentName?: string;
  orderOpenDate?: Date;
  isLocked?: boolean;
  isSubmit: boolean;
}

export interface CreateOrderDto extends Omit<Order, 'id' | 'billRates'> {
  billRates: OrderBillRateDto[];
}
