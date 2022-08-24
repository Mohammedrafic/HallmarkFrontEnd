import { Agency, AgencyListFilters } from 'src/app/shared/models/agency.model';
import {
  AssociateOrganizationsAgency,
  FeeExceptionsDTO,
  FeeExceptionsPage,
  FeeSettings,
  PartnershipSettings,
} from 'src/app/shared/models/associate-organizations.model';
import { ExportPayload } from '@shared/models/export.model';

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
  constructor(public pageNumber: number, public pageSize: number) {}
}

export class InvateOrganizations {
  static readonly type = '[agency] Invate Organizations';
  constructor(public organizationIds: number[]) {}
}

export class InvateOrganizationsSucceeded {
  static readonly type = '[agency] Invate Organizations Succeeded';
  constructor(public payload: AssociateOrganizationsAgency[]) {}
}

export class GetAssociateOrganizationsById {
  static readonly type = '[agency] Get Associate Organizations Pages By ID ';
  constructor(public pageNumber: number, public pageSize: number) {}
}

export class DeleteAssociateOrganizationsById {
  static readonly type = '[agency] Delete Associate Organizations By ID ';
  constructor(public id: number) {}
}

export class DeleteAssociateOrganizationsByIdSucceeded {
  static readonly type = '[agency] Delete Associate Organizations By ID Succeeded';
  constructor() {}
}

export class GetAgencyByPage {
  static readonly type = '[agency] Get Agency by Page';
  constructor(public pageNumber: number, public pageSize: number, public filters: AgencyListFilters) {}
}

export class GetAgencyById {
  static readonly type = '[agency] Get Agency by ID';
  constructor(public payload: number) {}
}

export class GetAgencyByIdSucceeded {
  static readonly type = '[agency] Get Agency by ID Succeeded';
  constructor(public payload: Agency) {}
}

export class GetFeeSettingByOrganizationId {
  static readonly type = '[agency] Get Fee Setting By Organization Id';
  constructor(public organizationId: number, public pageNumber: number, public pageSize: number) {}
}

export class GetFeeSettingByOrganizationIdSucceeded {
  static readonly type = '[agency] Get Fee Setting By Organization Id Succeeded';
  constructor(public payload: FeeSettings) {}
}
export class UploadAgencyLogo {
  static readonly type = '[agency] Upload Agency Logo';
  constructor(public file: Blob, public businessUnitId: number) {}
}

export class GetAgencyLogo {
  static readonly type = '[agency] Get Agency Logo';
  constructor(public payload: number) {}
}

export class RemoveAgencyLogo {
  static readonly type = '[agency] Remove Agency Logo ';
  constructor(public payload: number) {}
}

export class GetAgencyLogoSucceeded {
  static readonly type = '[agency] Get Agency Logo Succeeded';
  constructor(public payload: Blob) {}
}

export class ClearAgencyEditStore {
  static readonly type = '[agency] Clear Agency Edit Store';
  constructor() {}
}

export class GetFeeExceptionsInitialData {
  static readonly type = '[agency] Get Fee Exceptions Initial Data';
  constructor(public organizationId: number) {}
}

export class GetJobDistributionInitialData {
  static readonly type = '[agency] Get Job Distribution Initial Data';
  constructor(public organizationId: number) {}
}

export class SavePartnershipSettings {
  static readonly type = '[agency] Save Partnership Settings';
  constructor(public payload: PartnershipSettings) {}
}

export class SavePartnershipSettingsSucceeded {
  static readonly type = '[agency] Save Partnership Settings Succeeded';
  constructor(public payload: PartnershipSettings) {}
}

export class GetPartnershipSettings {
  static readonly type = '[agency] Get Partnership Settings By Organization Id';
  constructor(public organizationId: number) {}
}

export class SaveFeeExceptions {
  static readonly type = '[agency] Save Fee Exceptions';
  constructor(public feeExceptionsDTO: FeeExceptionsDTO) {}
}

export class RemoveFeeExceptionsById {
  static readonly type = '[agency] Remove Fee Exceptions By Id';
  constructor(public id: number) {}
}

export class SaveFeeExceptionsSucceeded {
  static readonly type = '[agency] Save Fee Exceptions Succeeded';
  constructor(public feeExceptionsDTO: FeeExceptionsPage) {}
}

export class SaveBaseFee {
  static readonly type = '[agency] Save Base Fee';
  constructor(public associateOrganizationId: number, public baseFee: number) {}
}

export class UpdateAssociateOrganizationsPage {
  static readonly type = '[agency] Update Associate Organizations Page';
  constructor() {}
}

export class GetBusinessUnitList {
  static readonly type = '[agency] Get The List Of Business Units';
  constructor() {}
}

export class ExportAgencyList {
  static readonly type = '[agency] Export Agency List';
  constructor(public payload: ExportPayload) {}
}

export class GetAgencyFilteringOptions {
  static readonly type = '[agency] Get Agency Filtering Options';
  constructor() {}
}
