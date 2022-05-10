export class Credential {
  id?: number;
  credentialTypeId: number;
  credentialTypeName?: string;
  name: string;
  businessUnitId?: number;
  expireDateApplicable: boolean;
  description?: string; // TODO: remove after BE fix

  constructor(credential: Credential) {
    if (credential.id) {
      this.id = credential.id;
    }

    if (credential.businessUnitId) {
      this.businessUnitId = credential.businessUnitId;
    }

    this.credentialTypeId = credential.credentialTypeId;
    this.description = this.name = credential.name;
    this.expireDateApplicable = credential.expireDateApplicable;
  }
}
