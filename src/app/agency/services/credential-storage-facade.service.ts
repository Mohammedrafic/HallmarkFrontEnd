import { Location } from "@angular/common";
import { Injectable } from '@angular/core';

import { CredentialParams } from "@shared/models/candidate-credential.model";
import { CredentialStorageService } from "./credential-storage.service";

@Injectable()
export class CredentialStorageFacadeService {

  constructor(private credentialStorage: CredentialStorageService, private location: Location) { }

  public getCredentialParams(): CredentialParams {
    const location = this.location.getState() as CredentialParams;

    if (
      location.orderId !== undefined
      && location.candidateStatus !== undefined
      && location.isNavigatedFromOrganizationArea !== undefined
    ) {
      this.credentialStorage.saveCredentialParamsToStorage(location);

      return location;
    } else {
      return this.credentialStorage.getCredentialParamsFromStorage();
    }
  }

  public removeCredentialParams(): void {
    this.credentialStorage.removeCredentialParamsFromStorage();
  }
}
