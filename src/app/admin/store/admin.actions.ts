import { Organization } from "src/app/shared/models/organization.model";
import { Department } from '../../shared/models/department.model';
import { SuccessErrorToast } from '../../shared/models/success-error-toast.model';

export class SetGeneralStatesByCountry {
  static readonly type = '[admin] Set General States By Country';
  constructor(public payload: string) { }
}

export class SetBillingStatesByCountry {
  static readonly type = '[admin] Set Billing States By Country';
  constructor(public payload: string) { }
}

export class CreateOrganization {
  static readonly type = '[admin] Create Organization';
  constructor(public payload: Organization) { }
}

export class SaveDepartment {
  static readonly type = '[admin] Create Department';
  constructor(public payload: Department) { }
}

export class GetDepartmentsByLocationId {
  static readonly type = '[admin] Get The List Of Departments by locationId';
  constructor(public locationId: number) { }
}

export class UpdateDepartment {
  static readonly type = '[admin] Update Department';
  constructor(public department: Department) { }
}

export class DeleteDepartmentById {
  static readonly type = '[admin] Delete Department by id';
  constructor(public departmentId: number) { }
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

export class SetSuccessErrorToastState {
  static readonly type = '[admin] Set Success Error Toast Shown state';
  constructor(public payload: SuccessErrorToast | null) { }
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
