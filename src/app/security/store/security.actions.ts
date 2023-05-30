import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { Role, RoleDTO, RolesFilters } from '@shared/models/roles.model';
import { User, UserDTO } from '@shared/models/user-managment-page.model';
import { UserVisibilityFilter, UserVisibilitySettingBody } from '@shared/models/visibility-settings.model';
import { ExportPayload } from '@shared/models/export.model';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';

export class GetBusinessByUnitType {
  static readonly type = '[security] Get Business By Unit Type';
  constructor(public type: BusinessUnitType) {}
}

export class GetRolesPage {
  static readonly type = '[security] Get Roles Page';
  constructor(
    public businessUnitType: BusinessUnitType,
    public businessUnitIds: number[],
    public pageNumber: number,
    public pageSize: number,
    public sortModel: any,
    public filterModel: any,
    public filters: RolesFilters
  ) {}
}

export class GetRolePerUser {
  static readonly type = '[security] Get Roles Per User';
  constructor(public businessUnitType: BusinessUnitType, public businessUnitIds: number[]) {}
}

export class GetUsersPage {
  static readonly type = '[security] Get Users Page';
  constructor(
    public businessUnitType: BusinessUnitType,
    public businessUnitIds: number[] | null,
    public pageNumber: number,
    public pageSize: number,
    public sortModel: any,
    public filterModel: any
  ) {}
}
export class GetAllUsersPage {
  static readonly type = '[security] Get All Users Page';
  constructor(
    public businessUnitType: BusinessUnitType,
    public businessUnitIds: number[],
    public pageNumber: number,
    public pageSize: number,
    public sortModel: any,
    public filterModel: any,
    public getAll: boolean
  ) {}
}

export class GetPermissionsTree {
  static readonly type = '[security] Get Permissions Tree';
  constructor(public type: BusinessUnitType) {}
}
export class GetIRPPermissionsTree {
  static readonly type = '[security] Get IRP Permissions Tree';
  constructor(public type: BusinessUnitType) {}
}
export class GetNewRoleBusinessByUnitType {
  static readonly type = '[security] Get New Role Business By Unit Type';
  constructor(public type: BusinessUnitType) {}
}

export class GetNewRoleBusinessByUnitTypeSucceeded {
  static readonly type = '[security] Get New Role Business By Unit Type Succeeded';
  constructor(public type: BusinessUnitType) {}
}

export class SaveRole {
  static readonly type = '[security] Save role';
  constructor(public role: RoleDTO) {}
}

export class SaveUser {
  static readonly type = '[security] Save user';
  constructor(public user: UserDTO) {}
}

export class SaveUserSucceeded {
  static readonly type = '[security] Save role Succeeded';
  constructor(public user: User) {}
}

export class SaveRoleSucceeded {
  static readonly type = '[security] Save role Succeeded';
  constructor(public role: Role) {}
}

export class RemoveRole {
  static readonly type = '[security] Remove Role';
  constructor(public id: number) {}
}

export class GetRolesForCopy {
  static readonly type = '[security] Get Roles For Copy';
  constructor(public type: BusinessUnitType, public id: number) {}
}

export class GetUserVisibilitySettingsPage {
  static readonly type = '[security] Get User Visibility Settings Page';
  constructor(public filters: UserVisibilityFilter) {}
}

export class SaveUserVisibilitySettings {
  static readonly type = '[security] Save User Visibility Settings';
  constructor(public payload: UserVisibilitySettingBody) {}
}

export class SaveUserVisibilitySettingsSucceeded {
  static readonly type = '[security] Save User Visibility Settings Succeeded';
  constructor() {}
}

export class RemoveUserVisibilitySetting {
  static readonly type = '[security] Remove User Visibility Setting';
  constructor(public id: number, public userId: string) {}
}

export class RemoveUserVisibilitySettingSucceeded {
  static readonly type = '[security] Remove User Visibility Setting Succeeded';
  constructor() {}
}

export class GetOrganizationsStructureAll {
  static readonly type = '[security] Get Organizations Structure All';
  constructor(public userId: string) {}
}

export class ExportUserList {
  static readonly type = '[security] Export User List';
  constructor(public payload: ExportPayload) {}
}

export class ExportRoleList {
  static readonly type = '[security] Export Role List';
  constructor(public payload: ExportPayload) {}
}
export class GetUSCanadaTimeZoneIds {
  static readonly type = '[security] Get US Canada TimeZoneIds';
  constructor() {}
}

export class ChangeBusinessUnit {
  static readonly type = '[security] Change Business Unit';
  constructor(public isChangeUnit: boolean) {}
}

export class ResendWelcomeEmail {
  static readonly type = '[security] Resend Welcome Email';
  constructor(public userId: string) {}
}

export class ImportUsers {
  static readonly type = '[security] Import users file';

  constructor(public readonly file: FormData) {}
}


export class GetOrgInterfacePage {
  static readonly type = '[security] Get OrgInterface Page';
  constructor(
    public organizationId: number | null,
    public pageNumber: number,
    public pageSize: number,
  ) {}
}

export class GetLogInterfacePage {
  static readonly type = '[security] Get LogInterface Page';
  constructor(
    public organizationId: number | null,
    public pageNumber: number,
    public pageSize: number,
  ) {}
}

export class GetLogHistoryById {
  static readonly type = '[security log interface] Get History By Id';
  constructor(public runId: string, public organizationId: number, public pageNumber: number,public pageSize: number,public options?: DialogNextPreviousOption) {}
}

export class GetLogFileDownload {
  static readonly type = '[security log interface] Get History log file';
  constructor(public runId: string, public organizationId: number,) {}
}

export class GetLogFileDownloadSucceeded {
  static readonly type = '[security log interface] Get History log file download details Succeeded';
  constructor(public logFileDownloadDetail: any) { }
}

export class ExportTimeSheetList {
  static readonly type = '[security] Export TimeSheet List';
  constructor(public payload: ExportPayload) {}
}

export class GetBusinessForEmployeeType {
  static readonly type = '[security] Get Business for Employee type';
  constructor() {}
}

export class GetEmployeeUsers {
  static readonly type = '[security] Get Users with Employee role';
  constructor(
    public businessUnitId: number
  ) {}
}