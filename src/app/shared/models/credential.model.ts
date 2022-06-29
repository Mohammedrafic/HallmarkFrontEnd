import { CredentialType } from "./credential-type.model";
import { PageOfCollections } from "./page.model";

export class Credential {
  id?: number;
  credentialTypeId: number;
  credentialTypeName?: string;
  name: string;
  expireDateApplicable: boolean;
  comment?: string;

  constructor(credential: Credential) {
    if (credential.id) {
      this.id = credential.id;
    }

    this.credentialTypeId = credential.credentialTypeId;
    this.name = credential.name;
    this.comment = credential.comment;
    this.expireDateApplicable = credential.expireDateApplicable;
  }
}

export type CredentialPage = PageOfCollections<Credential>;

export class CredentialFilter {
  searchTerm?: string;
  credentialTypeIds?: number[];
  credentialIds?: number[];
  expireDateApplicable?: boolean;
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
}

export class CredentialDataSource {
  id: number;
  name: string;
  expireDateApplicable: boolean;
}

export class CredentialFilterDataSources {
  credentialTypes: CredentialType;
  credentials: CredentialDataSource[];
}
