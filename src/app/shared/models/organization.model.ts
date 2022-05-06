import { SendDocumentAgency } from '../enums/send-document-agency';

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
