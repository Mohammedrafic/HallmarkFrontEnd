import { OrganizationStatus } from '@shared/enums/status';

export class Organization {
  createUnder?: {
    id: number;
    businessUnitType: number;
    name: string;
    parentUnitId?: number;
    dbConnectionName: string;
  };
  parentBusinessUnitId?: number;
  organizationId?: number | null;
  generalInformation: GeneralInformation;
  billingDetails: BillingDetails;
  contactDetails: ContactDetails[];
  preferences: Preferences;
  dbConnectionStringName: string;
  isOrganizationUsed?: boolean;
  organizationPrefix: string;
  externalCommentsConfiguration?:boolean | null;
  
  constructor(
    organizationId: number,
    businessUnitId: number,
    generalInformation: GeneralInformation,
    billingDetails: BillingDetails,
    contactDetails: ContactDetails[],
    preferences: Preferences,
    isSameAsOrg: boolean,
    dataBaseConnection: string
  ) {
    if (organizationId) {
      this.organizationId = organizationId;
    }
    this.parentBusinessUnitId = businessUnitId;
    this.generalInformation = generalInformation;
    this.generalInformation.organizationId = organizationId || 0;
    this.generalInformation.organizationPrefix = this.generalInformation.organizationPrefix.toUpperCase();
    if (this.generalInformation.externalId === '') {
      this.generalInformation.externalId = null;
    }
    this.billingDetails = billingDetails;
    this.billingDetails.organizationId = organizationId || 0;
    this.billingDetails.sameAsOrganization = isSameAsOrg;
    this.contactDetails = contactDetails;
    this.contactDetails.forEach((contact: ContactDetails) => (contact.organizationId = organizationId || 0));
    this.preferences = preferences;
    this.preferences.paymentOptions = parseInt(this.preferences.paymentOptions as string, 10);
    this.preferences.organizationId = organizationId || 0;
    this.dbConnectionStringName = dataBaseConnection;
  }
}

export class GeneralInformation {
  id?: number;
  organizationId?: number;
  externalId?: number | string | null;
  taxId: string;
  name: string;
  organizationType: string;
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
  status: OrganizationStatus;
  organizationPrefix: string;
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
  weekStartsOn: number;
  considerLunch: boolean;
  isIRPEnabled?: boolean;
  isVMCEnabled?: boolean;
  shouldUpdateIRPInHierarchy?: boolean;
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
  organizationId?: number;
  regionId?: number | null;
  locationId?: number;
  includeInIRP?: boolean;
  isDeactivated?: boolean;
}

export class OrganizationLocation {
  id: number;
  name: string;
  regionName?: string;
  departments: OrganizationDepartment[];
  organizationId?: number;
  regionId?: number | null;
  locationId?: number;
  includeInIRP?: boolean;
  isDeactivated?: boolean;
}

export class OrganizationRegion {
  id: number | null;
  name?: string;
  orgName?: string;
  locations: OrganizationLocation[] | null;
  organizationId?: number;
  regionId?: number | null;
}

export class OrganizationStructure {
  organizationId: number;
  organizationName: string;
  regions: OrganizationRegion[];
}

export class OrganizationFilter {
  searchTerm?: string;
  businessUnitNames?: string[];
  statuses?: string[];
  cities?: string[];
  contacts?: string[];
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
}

export class OrganizationDataSource {
  businessUnitNames: string[];
  statuses: string[];
  cities: string[];
  contacts: string[];
}
