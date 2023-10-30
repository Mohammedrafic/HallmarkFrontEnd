import { PageOfCollections } from './page.model';
import {
  ElectronicPaymentDetails,
  PaymentDetails,
} from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/model/payment-details.model';
import { AgencyStatus, FilterOrderStatusText } from "@shared/enums/status";
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

export type Agency = {
  isMsp?: boolean,
  createUnder?: AgencyCreateUnder;
  parentBusinessUnitId: number | null;
  agencyId?: number;
  agencyDetails: AgencyDetails;
  agencyBillingDetails: AgencyBillingDetails;
  agencyContactDetails: AgencyContactDetails[];
  agencyPaymentDetails: PaymentDetails[] | ElectronicPaymentDetails[];
  agencyJobDistribution: AgencyRegionSkills;
  contactPerson?: string;
  netSuiteId?: number;
  menuItems?: ItemModel[]; // use only in UI for context menu datasource
};

export type AgencyCreateUnder = {
  id: number;
  businessUnitType: 1;
  name: string;
  parentUnitId: number;
  agencyStatus: number;
};

export type AgencyDetails = {
  id?: number;
  externalId: number | string | null;
  taxId: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  state: string;
  country: number;
  city: string;
  zipcode: string;
  phone1Ext: string;
  phone2Ext: string;
  fax: string;
  website: string;
  status: number;
  netSuiteId?: number;
};

export type AgencyBillingDetails = {
  id?: number;
  sameAsAgency: boolean;
  name: string;
  address: string;
  country: number;
  state: string;
  city: string;
  zipcode: string;
  phone1: string;
  phone2: string;
  ext: string;
  fax: string;
};

export type AgencyContactDetails = {
  id?: number;
  agencyId?: number;
  title: string;
  contactPerson: string;
  email: string;
  phone1: string;
};

export type AgencyPaymentDetails = {
  id?: number;
  agencyId?: number;
  mode: number;
  payee: string;
  address: string;
  city: string;
  zip: string;
  startDate: string;
  netSuitePaymentId: number;
};

export type AgencyPage = PageOfCollections<Agency>;

export type AgencyOrderFilteringOptions = {
  partneredOrganizations: {
    id: number;
    name: string;
  }[];
  orderStatuses: {
    status: FilterOrderStatusText;
    statusText: string;
  }[];
  candidateStatuses: {
    status: number;
    statusText: string;
    filterStatus?: string;
  }[];
  masterSkills: {
    id: number;
    name: string;
  }[];
  specialProjectCategories: {
    id: number;
    projectType: string;
  }[];
  projectNames: {
    id: number;
    projectName: string;
  }[];
  poNumbers: {
    id: number;
    poNumber: string;
  }[];
};

export type AgencyListFilters = {
  searchTerm?: string;
  businessUnitNames?: string[];
  statuses?: string[];
  cities?: string[];
  contacts?: string[];
};

export class AgencyFilteringOptions {
  businessUnitNames: string[];
  statuses: string[];
  cities: string[];
  contacts: string[];
}

export type AgencyRegionSkills = {
  regionNames: Array<string>;
  regions: string[];
  skillCategories: Array<{
    id: number;
    name: string;
  }>;
};

export interface AgencyStatusesModel {
  text: string | AgencyStatus;
  id: number;
}

export interface AgencyConfig {
  isAgencyUser: boolean;
  isHallmarkUser: boolean;
  agencyIsMsp: boolean;
  isEditMode: boolean;
}

export interface AgencyAuditHistory {
  changeType: string;
  modifiedOn: string;
  modifiedBy: string;
  businessUnitId: number;
  businessUnitType: number;
  businessUnitName: string;
  parentUnitId: number;
  logoId: string;
  businessUnitCreatedAt: string;
  businessUnitCreatedBy: string;
  businessUnitLastModifiedAt: string;
  businessUnitLastModifiedBy: string;
  dbConnectionName: string;
  organizationPrefix: string;
  netSuiteId: string;
  isIRPEnabled: boolean;
  isVMSEnabled: boolean;
  netSuiteEnabled: boolean;
  isMspSource: boolean;
}

export interface AgencyAuditPayload {
  entityTypeName: string;
  searchValue: string;
}
