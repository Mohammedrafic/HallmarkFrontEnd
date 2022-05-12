export class CredentialSetup {
  id?: number;
  description: string;
  comments?: string;
  inactiveDate?: string;
  include?: boolean;
  reqForSubmission?: boolean;
  reqForOnboard?: boolean;

  constructor(credentialSetup: CredentialSetup){
    if (credentialSetup.id) {
      this.id = credentialSetup.id;
    } else {
      this.description = credentialSetup.description;
    }

    this.comments = credentialSetup.comments;
    this.inactiveDate = credentialSetup.inactiveDate;
    this.include = credentialSetup.include;
    this.reqForSubmission = credentialSetup.reqForSubmission;
    this.reqForOnboard = credentialSetup.reqForOnboard;
  }
}
