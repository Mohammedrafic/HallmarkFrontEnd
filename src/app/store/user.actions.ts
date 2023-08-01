import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { LasSelectedOrganizationAgency } from "@shared/models/user-agency-organization.model";
import { User } from "@shared/models/user.model";

export class SetCurrentUser {
  static readonly type = '[user] Set Current User';
  constructor(public payload: User) { }
}

export class LogoutUser {
  static readonly type = '[user] Logout User';
  constructor() { }
}

export class GetUserMenuConfig {
  static readonly type = '[user] Get Users Menu Configuration';
  constructor(
    public payload: BusinessUnitType,
    public isEmployee?: boolean,
  ) { }
}

export class GetUserAgencies {
  static readonly type = '[user] Get User Agencies';
  constructor() { }
}

export class GetUserOrganizations {
  static readonly type = '[user] Get User Organizations';
  constructor() { }
}

export class UserOrganizationsAgenciesChanged {
  static readonly type = '[user] User Organizations/Agencies Changed';
  constructor() { }
}

export class SetLastSelectedOrganizationAgencyId {
  static readonly type = '[user] Set Last Selected Organization Or Agency Id';
  constructor(public payload: LasSelectedOrganizationAgency) { }
}

export class SaveLastSelectedOrganizationAgencyId {
  static readonly type = '[user] Save Last Selected Organization Or Agency Id';
  constructor(public payload: LasSelectedOrganizationAgency, public isOrganizationId: boolean) { }
}

export class GetOrganizationStructure {
  static readonly type = '[user] Get Organization Structure Of Current User';
  constructor() { }
}

export class ClearOrganizationStructure {
  static readonly type = '[user] Clear Organization Structure Of Current User';
}

export class LastSelectedOrganisationAgency {
  static readonly type = '[user] Last Selected Organization Agency';
  constructor(public payload: string) { }
}

export class GetUsersAssignedToRole {
  static readonly type = '[user] Get Users Assigned To Role';
  constructor(public payload: number) { }
}

export class GetCurrentUserPermissions {
  static readonly type = '[user] Get Current User Permissions';
  constructor() { }
}

export class GetOrderPermissions {
  static readonly type = '[user] Get Order Permissions';
  constructor(public payload: number) { }
}

export class SetAgencyActionsAllowed {
  static readonly type = '[user] Set agency actions allowed';
  constructor(public readonly allowed: boolean) {}
}

export class SetAgencyInvoicesActionsAllowed {
  static readonly type = '[user] Set agency invoices actions allowed';
  constructor(public readonly allowed: boolean) {}
}

export class SetUserPermissions {
  static readonly type = '[user] Set User Permissions';
  constructor() {}
}

export class GetOrgTierStructure {
  static readonly type = '[user] Get Org structure for Tier';
  constructor(
    public organizationId: number | null
  ) {}
}
