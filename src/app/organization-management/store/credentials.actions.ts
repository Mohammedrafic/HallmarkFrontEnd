import { CredentialSetupFilter } from '@shared/models/credential-setup-filter.model';
import { CredentialGroupMapping } from '@shared/models/credential-group-mapping.model';

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
  constructor(public payload: CredentialGroupMapping) {}
}

export class DeleteCredentialGroupMappingById {
  static readonly type = '[credentials] Delete Credential Group Mapping By Id';
  constructor(public payload: number) {}
}
