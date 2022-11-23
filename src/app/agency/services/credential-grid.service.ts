import { Injectable } from '@angular/core';

import { CandidateCredential, CredentialFile } from "@shared/models/candidate-credential.model";

@Injectable()
export class CredentialGridService {
  public getCandidateCredentialFileIds(credentials: CandidateCredential[]): number[] {
    return credentials.map((item: CandidateCredential) => (item.credentialFiles as CredentialFile[])[0].candidateCredentialId);
  }

  public getCredentialRowsWithFiles(credentialRows: CandidateCredential[]): CandidateCredential[] {
    return credentialRows.filter((item: CandidateCredential) => item.credentialFiles?.length);
  }
}
