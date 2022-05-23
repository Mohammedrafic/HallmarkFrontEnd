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
