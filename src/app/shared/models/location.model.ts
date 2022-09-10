import { PageOfCollections } from "./page.model";

export class Location {
  id?: number;
  regionId?: number;
  phoneType: number;
  externalId: string;
  invoiceId: string;
  name: string;
  businessLineId: number | null;
  businessLine?: string | null;
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
  inactiveDate?: string;
  timeZone? : string;
  locationTypeId? :number;
  organizationId :number;
}

export type LocationsPage = PageOfCollections<Location>;

export class LocationMapping {
  id: number;
  name?: string;
}

export class LocationFilter {
  regionId?: number;
  externalIds?: string[];
  invoiceIds?: string[];
  names?: string[];
  addresses1?: string[];
  cities?: string[];
  states?: string[];
  zipCodes?: string[];
  contactPeople?: string[];
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
}

export class LocationFilterOptions {
  externalIds: string[];
  ivnoiceIds: string[];
  locationNames: string[];
  addresses1: string[];
  cities: string[];
  states: string[];
  zipCodes: string[];
  contactPersons: string[];
}

export class LocationType{
  LocationTypeId : number;
  Name: string;
}

export class TimeZoneModel {
  SystemTimeZoneName: string;
  TimeZoneId: string;
}

export type ImportedLocation = {
  orgName: string;
  regionName: string;
  locationName: string;
  externalId: string;
  invoiceId: string;
  businessLine: string;
  locationType: string;
  timeZone: string;
  address1: string;
  address2: string;
  state: string;
  city: string;
  zip: string;
  contactPerson: string;
  contactEmail: string;
  phoneNumber: string;
  phoneType: string;
  ext: string;
  glNumber: string;
  invoiceNote: string;
  inactiveDate: string;
  errorProperties: string[];
}
