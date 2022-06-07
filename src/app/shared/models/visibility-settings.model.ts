import { PageOfCollections } from "@shared/models/page.model";

export type UserVisibilitySetting = {
  id: number;
  organizationId: number;
  organizationName: string;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string
  departmentId: number
  departmentName: string;
}

export type UserVisibilitySettingsPage = PageOfCollections<UserVisibilitySetting>;

export type UserVisibilitySettingBody = {
  userId: string;
  organisationIds: number[];
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
}

export type Organisation = {
  organizationId: number;
  name: string;
  regions: Region[];
}

export type Department = {
  id: number;
  name: string;
  locationName?: string
}

export type Location = {
  id: number;
  name: string;
  regionName?: string;
  departments: Department[];
}

export type Region = {
  id: number;
  name: string;
  locations: Location[];
  organisationName?: string;
}
