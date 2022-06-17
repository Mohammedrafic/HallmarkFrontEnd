import { BusinessUnitType } from "../shared/enums/business-unit-type";
import { LasSelectedOrganizationAgency } from "@shared/models/user-agency-organization.model";
import { User } from "../shared/models/user.model";

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
  constructor(public payload: BusinessUnitType) { }
}

export class GetUserAgencies {
  static readonly type = '[user] Get User Agencies';
  constructor() { }
}

export class GetUserOrganizations {
  static readonly type = '[user] Get User Organizations';
  constructor() { }
}

export class SetLastSelectedOrganizationAgencyId {
  static readonly type = '[user] Set Last Selected Organization Or Agency Id';
  constructor(public payload: LasSelectedOrganizationAgency) { }
}

export class SaveLastSelectedOrganizationAgencyId {
  static readonly type = '[user] Save Last Selected Organization Or Agency Id';
  constructor(public payload: LasSelectedOrganizationAgency) { }
}

export class GetOrganizationStructure {
  static readonly type = '[user] Get Organization Structure Of Current User';
  constructor() { }
}

export class LastSelectedOrganisationAgency {
  static readonly type = '[user] Last Selected Organization Agency';
  constructor(public payload: string) { }
}
