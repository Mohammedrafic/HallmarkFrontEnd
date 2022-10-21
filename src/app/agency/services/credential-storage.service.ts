import { Inject, Injectable } from '@angular/core';

import { GlobalWindow } from "@core/tokens";
import { CREDENTIALS_STORAGE_KEY } from "@shared/constants";
import { CredentialParams } from "@shared/models/candidate-credential.model";

@Injectable({
  providedIn: 'root'
})
export class CredentialStorageService {

  constructor(@Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis) {}

  public saveCredentialParamsToStorage({ isNavigatedFromOrganizationArea, candidateStatus, orderId }: CredentialParams): void {
    this.globalWindow.localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify({
      isNavigatedFromOrganizationArea,
      candidateStatus,
      orderId
    }));
  }

  public getCredentialParamsFromStorage(): CredentialParams {
    return JSON.parse(this.globalWindow.localStorage.getItem(CREDENTIALS_STORAGE_KEY) || '{}');
  }

  public removeCredentialParamsFromStorage(): void {
    this.globalWindow.localStorage.removeItem(CREDENTIALS_STORAGE_KEY);
  }
}
