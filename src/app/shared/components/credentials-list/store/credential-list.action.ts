import { CredentialListAction } from '@shared/components/credentials-list/enums';
import { ExportPayload } from '@shared/models/export.model';

export namespace CredentialList {
  export class GetCredentialsDataSources {
    static readonly type = CredentialListAction.GetCredentialDataSources;
    constructor() { }
  }

  export class ExportCredentialList {
    static readonly type = CredentialListAction.ExportCredentialList;
    constructor(
      public payload: ExportPayload,
      public isCredentialSettings: boolean
    ) { }
  }
}
