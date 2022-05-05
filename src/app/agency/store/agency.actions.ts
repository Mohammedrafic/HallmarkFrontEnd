import { Agency } from 'src/app/shared/models/agency.model';
import { AssociateOrganizations } from 'src/app/shared/models/associate-organizations.model';

export class SaveAgency {
  static readonly type = '[agency] Save Agency';
  constructor(public payload: Agency) {}
}

export class SaveAgencySucceeded {
  static readonly type = '[agency] Save Agency Succeeded';
  constructor(public payload: Agency) {}
}

export class GetOrganizationsByPage {
  static readonly type = '[agency] Get Organizations by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class InvateOrganizations {
  static readonly type = '[agency] Invate Organizations';
  constructor(public organizationIds: number[]) {}
}

export class InvateOrganizationsSucceeded {
  static readonly type = '[agency] Invate Organizations Succeeded';
  constructor(public payload: AssociateOrganizations[]) {}
}

export class GetAssociateOrganizationsById {
  static readonly type = '[agency] Get Associate Organizations Pages By ID ';
  constructor(public pageNumber: number, public pageSize: number) {}
}
export class GetAgencyByPage {
  static readonly type = '[agency] Get Agency by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class GetAgencyById {
  static readonly type = '[agency] Get Agency by ID';
  constructor(public payload: number) { }
}

export class GetAgencyByIdSucceeded {
  static readonly type = '[agency] Get Agency by ID Succeeded';
  constructor(public payload: Agency) { }
}
