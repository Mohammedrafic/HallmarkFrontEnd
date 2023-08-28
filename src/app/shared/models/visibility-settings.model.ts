import { PageOfCollections } from '@shared/models/page.model';

export type UserVisibilitySetting = {
  id: number;
  organizationId: number;
  organizationName: string;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  uniqRegionId: string | null;
  uniqLocationId: string | null;
  uniqDepartmentId: string | null;
};

export type UserVisibilitySettingsPage = PageOfCollections<UserVisibilitySetting>;

export type UserVisibilitySettingBody = {
  userId: string;
  organisationIds: number[];
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
  id?: number | null;
};

export type Organisation = {
  organizationId: number;
  name: string;
  regions: Region[];
  id?: number;
};

export type Department = {
  id: number;
  name: string;
  locationName?: string;
  locationId:number;
  organizationId: number;
  uniqId?: string | number;
  inactiveDate?:string;
  reactivateDate?:string;
};

export type Location = {
  id: number;
  name: string;
  regionId:number;
  regionName?: string;
  departments: Department[];
  organizationId: number;
  uniqId?: string | number;
  inactiveDate?:string;
  reactivateDate?:string;
};

export type Region = {
  id: number;
  name: string;
  locations: Location[];
  organisationName?: string;
  organizationId: number;
};

export class UserVisibilityFilter {
  userId: string;
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
}

export type VisibilitySettingControls = Region | Location | Department | Organisation;
