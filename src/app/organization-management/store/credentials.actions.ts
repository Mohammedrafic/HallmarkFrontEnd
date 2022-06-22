import { CredentialSetupFilter } from '@shared/models/credential-setup-filter.model';
import { SkillGroupMapping } from '@shared/models/credential-group-mapping.model';
import { ExportPayload } from '@shared/models/export.model';
import { CredentialSetup, CredentialSetupFilterDto, CredentialSetupPost } from '@shared/models/credential-setup.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';

export class SetNavigationTab {
  static readonly type = '[credentials] Set Navigation Tab';
  constructor(public payload: number) {}
}

export class SetCredentialSetupFilter {
  static readonly type = '[credentials] Set Credential Setup Filter';
  constructor(public payload: CredentialSetupFilter | null) {}
}

export class GetCredentialGroupMapping {
  static readonly type = '[credentials] Get Credential Group Mapping';
  constructor() {}
}

export class SaveCredentialGroupMapping {
  static readonly type = '[credentials] Save Credential Group Mapping';
  constructor(public payload: SkillGroupMapping) {}
}

export class DeleteCredentialGroupMappingById {
  static readonly type = '[credentials] Delete Credential Group Mapping By Id';
  constructor(public payload: number) {}
}

export class ExportCredentialList {
  static readonly type = '[credentials] Export Credential list';
  constructor(public payload: ExportPayload) { }
}

export class ShowExportCredentialListDialog {
  static readonly type = '[credentials] Show Export Credential list dialog';
  constructor(public payload: ExportedFileType) { }
}

export class GetFilteredCredentialSetupData {
  static readonly type = '[credentials] Get Filtered Credential Setup Mapping Data';
  constructor(public payload: CredentialSetupFilterDto) {}
}

export class GetCredentialSetupByMappingId {
  static readonly type = '[credentials] Get Credential Setup by MappingId';
  constructor(public mappingId: number) {}
}

export class RemoveCredentialSetupByMappingId {
  static readonly type = '[credentials] Remove Credential Setup by Id';
  constructor(public mappingId: number, public filter: CredentialSetupFilterDto) {}
}

export class UpdateCredentialSetup {
  static readonly type = '[credentials] Update Credential Setup';
  constructor(public credentialSetup: CredentialSetupPost) { }
}

export class UpdateCredentialSetupSucceeded {
  static readonly type = '[credentials] Update Credential Setup Succeeded';
  constructor() { }
}
