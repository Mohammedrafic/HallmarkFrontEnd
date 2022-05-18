import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { PermissionsTree } from '@shared/models/permission.model';
import { Role, RoleDTO } from '@shared/models/roles.model';

export class GetBusinessByUnitType {
  static readonly type = '[security] Get Business By Unit Type';
  constructor(public type: BusinessUnitType) {}
}

export class GetRolesPage {
  static readonly type = '[security] Get Roles Page';
  constructor(
    public businessUnitType: BusinessUnitType,
    public businessUnitId: number,
    public pageNumber: number,
    public pageSize: number
  ) {}
}

export class GetPermissionsTree {
  static readonly type = '[security] Get Permissions Tree';
  constructor(public type: BusinessUnitType) {}
}

export class GetNewRoleBusinessByUnitType {
  static readonly type = '[security] Get New Role Business By Unit Type';
  constructor(public type: BusinessUnitType) {}
}

export class SaveRole {
  static readonly type = '[security] Save role';
  constructor(public role: RoleDTO) {}
}

export class SaveRoleSucceeded {
  static readonly type = '[security] Save role Succeeded';
  constructor(public role: Role) {}
}

export class RemoveRole {
  static readonly type = '[security] Remove Role';
  constructor(public id: number) {}
}
