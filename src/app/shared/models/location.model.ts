export class Location {
  id?: number;
  regionId?: number;
  phoneType: number;
  externalId: string;
  invoiceId: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  contactPerson: string;
  contactEmail: string;
  phoneNumber: string;
  ext?: string;
  glNumber?: string;
  invoiceNote?: string;
  inactiveDate?: string;
}

export class LocationMapping {
  id: number;
  name?: string;
}

export class LocationFilter {
  regionId?: number;
  externalId?: string[];
  invoiceId?: string[];
  name?: string[];
  address1?: string[];
  city?: string[];
  state?: string[];
  zip?: string[];
  contactPerson?: string[];
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
}
