export type Agency = {
  agencyId?: number;
  parentBusinessUnitId?: number;
  createUnder?: CreateUnder;
  agencyDetails: AgencyDetails;
  agencyBillingDetails: AgencyBillingDetails;
  agencyContactDetails: AgencyContactDetails[];
  agencyPaymentDetails: AgencyPaymentDetails[];
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
  zipCode: string;
  phone1Ext: string;
  phone2Ext: string;
  fax: string;
  website: string;
  status: number;
};

export type AgencyBillingDetails = {
  id?: number;
  sameAsAgency: boolean;
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
};

export type CreateUnder = {
  id?: number,
  businessUnitType?: number,
  name?: string,
  parentUnitId?: number
};

export class AgencyPage {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: Agency[];
  pageNumber: number;
  totalCount: number;
  totalPages: number;
}
