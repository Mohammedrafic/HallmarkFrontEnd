import { BusinessLines } from "./business-line.model";
import { PageOfCollections } from "./page.model";

export class Location {
  id?: number;
  regionId?: number;
  phoneType: number;
  externalId: string;
  invoiceId: string;
  name: string;
  businessLineId?: BusinessLines;
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
