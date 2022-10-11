import {
  AssociateOrganizationsAgency,
  FeeExceptionsDTO,
  FeeExceptionsPage,
  PartnershipSettings,
} from '@shared/models/associate-organizations.model';

export class GetAssociateListPage {
  static readonly type = '[associate] Get Associate List by Page';
  constructor(public pageNumber: number, public pageSize: number) {}
}

export class DeleteAssociateOrganizationsAgencyById {
  static readonly type = '[associate] Delete Associate Organizations/Agency By ID ';
  constructor(public id: number) {}
}

export class SaveFeeExceptions {
  static readonly type = '[associate] Save Fee Exceptions';
  constructor(public feeExceptionsDTO: FeeExceptionsDTO) {}
}

export class GetAssociateAgencyOrg {
  static readonly type = '[associate] Get Associate Agency / Org';
  constructor() {}
}

export class InviteOrganizationsAgency {
  static readonly type = '[associate] Invite Organizations / Agency';
  constructor(public organizationIds: number[]) {}
}

export class InviteOrganizationsSucceeded {
  static readonly type = '[associate] Invate Organizations Succeeded';
  constructor(public payload: AssociateOrganizationsAgency[]) {}
}

export class SaveFeeExceptionsSucceeded {
  static readonly type = '[associate] Save Fee Exceptions Succeeded';
  constructor(public feeExceptionsDTO: FeeExceptionsPage) {}
}

export class GetFeeSettingByOrganizationId {
  static readonly type = '[associate] Get Fee Setting By Organization / Agency Id';
  constructor(public organizationAgencyId: number, public pageNumber: number, public pageSize: number) {}
}

export class SavePartnershipSettings {
  static readonly type = '[associate] Save Partnership Settings';
  constructor(public payload: PartnershipSettings) {}
}

export class UpdateAssociateOrganizationsAgencyPage {
  static readonly type = '[associate] Update Associate Organizations Page';
  constructor() {}
}

export class GetPartnershipSettings {
  static readonly type = '[associate] Get Partnership Settings By Organization Id';
  constructor(public organizationId: number) {}
}

export class SaveBaseFee {
  static readonly type = '[associate] Save Base Fee';
  constructor(public associateOrganizationId: number, public baseFee: number) {}
}

export class GetFeeExceptionsInitialData {
  static readonly type = '[associate] Get Fee Exceptions Initial Data';
  constructor(public organizationId: number) {}
}
export class GetJobDistributionInitialData {
  static readonly type = '[associate] Get Job Distribution Initial Data';
  constructor() {}
}

export class RemoveFeeExceptionsById {
  static readonly type = '[associate] Remove Fee Exceptions By Id';
  constructor(public id: number) {}
}
