import { Country } from "src/app/shared/enums/states";
import { Organization } from "src/app/shared/models/organization.model";
import { Department } from '../../shared/models/department.model';
import { Location } from '../../shared/models/location.model';

export class SetGeneralStatesByCountry {
  static readonly type = '[admin] Set General States By Country';
  constructor(public payload: Country) { }
}

export class SetBillingStatesByCountry {
  static readonly type = '[admin] Set Billing States By Country';
  constructor(public payload: Country) { }
}

export class SaveOrganization {
  static readonly type = '[admin] Save Organization';
  constructor(public payload: Organization) { }
}

export class SaveOrganizationSucceeded {
  static readonly type = '[admin] Save Organization Succeeded';
  constructor(public payload: Organization) { }
}

export class UploadOrganizationLogo {
  static readonly type = '[admin] Upload Organization Logo';
  constructor(public file: Blob, public businessUnitId: number) { }
}

export class GetOrganizationById {
  static readonly type = '[admin] Get Organization by ID';
  constructor(public payload: number) { }
}

export class GetOrganizationByIdSucceeded {
  static readonly type = '[admin] Get Organization by ID Succeeded';
  constructor(public payload: Organization) { }
}

export class SaveDepartment {
  static readonly type = '[admin] Create Department';
  constructor(public payload: Department) { }
}

export class GetDepartmentsByLocationId {
  static readonly type = '[admin] Get The List Of Departments by locationId';
  constructor(public locationId?: number) { }
}

export class UpdateDepartment {
  static readonly type = '[admin] Update Department';
  constructor(public department: Department) { }
}

export class DeleteDepartmentById {
  static readonly type = '[admin] Delete Department by id';
  constructor(public department: Department) { }
}

export class GetRegionsByOrganizationId {
  static readonly type = '[admin] Get The List Of Regions';
  constructor(public organizationId: number) { }
}

export class GetLocationsByOrganizationId {
  static readonly type = '[admin] Get The List Of Locations by organizationId';
  constructor(public organizationId: number) { }
}

export class GetLocationsByRegionId {
  static readonly type = '[admin] Get The List Of Locations by regionId';
  constructor(public regionId: number) { }
}

export class GetLocationById {
  static readonly type = '[admin] Get The Location by id';
  constructor(public locationId: number) { }
}

export class SaveLocation {
  static readonly type = '[admin] Create Location';
  constructor(public location: Location) { }
}

export class UpdateLocation {
  static readonly type = '[admin] Update Location';
  constructor(public location: Location) { }
}

export class DeleteLocationById {
  static readonly type = '[admin] Delete Location by id';
  constructor(public locationId: number) { }
}

export class GetOrganizationsByPage {
  static readonly type = '[admin] Get Organizations by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class GetBusinessUnitList {
  static readonly type = '[admin] Get The List Of Business Units';
  constructor() { }
}

export class SetDirtyState {
  static readonly type = '[admin] Set Dirty State Of The Form';
  constructor(public payload: boolean) { }
}

export class SetImportFileDialogState {
  static readonly type = '[admin] Set Import file dialog State';
  constructor(public payload: boolean) { }
}
