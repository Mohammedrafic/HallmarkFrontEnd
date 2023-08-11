import { CredentialSetupFilter } from '@shared/models/credential-setup-filter.model';
import { SkillGroupMapping } from '@shared/models/credential-group-mapping.model';
import {
  CredentialSetupFilterDto,
  CredentialSetupMappingPost,
  CredentialSetupPost,
} from '@shared/models/credential-setup.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';

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

export class ShowExportCredentialListDialog {
  static readonly type = '[credentials] Show Export Credential list dialog';
  constructor(public payload: ExportedFileType) { }
}

export class GetFilteredCredentialSetupData {
  static readonly type = '[credentials] Get Filtered Credential Setup Mapping Data';
  constructor(public payload: CredentialSetupFilterDto) {}
}

export class SaveUpdateCredentialSetupMappingData {
  static readonly type = '[credentials] Save/Update Credential Setup Mapping';
  constructor(public credentialSetupMapping: CredentialSetupMappingPost) { }
}

export class SaveUpdateCredentialSetupMappingSucceeded {
  static readonly type = '[credentials] Save/Update Credential Setup Mapping Succeeded';
  constructor(public isSucceed: boolean) { }
}

export class GetCredentialSetupByMappingId {
  static readonly type = '[credentials] Get Credential Setup by MappingId';
  constructor(public mappingId: number) {}
}

export class ClearCredentialSetup {
  static readonly type = '[credentials] Clear Credential Setup';
  constructor() {}
}

export class ClearFilteredCredentialSetup {
  static readonly type = '[credentials] Clear Filtered Credential Setup';
  constructor() {}
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
  constructor(public mappingId: number) { }
}

export class SetCredentialsFilterCount {
  static readonly type = '[credentials] Set The Amount Of Applied Filters';
  constructor(public payload: number) { }
}

export class GetAssignedCredentialTree {
  static readonly type = '[credentials] Get Assigned Credential Tree';
  constructor() { }
}

export class SaveAssignedCredentialValue {
  static readonly type = '[credentials] Save Assigned Credential Value';
  constructor(public payload: string[]) { }
}
