import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs';

import { BaseObservable } from '@core/helpers';
import {
  CredentialSetupDetails,
  CredentialSetupGet,
  CredentialSetupMappingPost,
} from '@shared/models/credential-setup.model';
import { CredentialTypeSource } from '@organization-management/credentials/interfaces';

@Injectable()
export class MapCredentialsService {
  private readonly selectedMapping: BaseObservable<CredentialSetupMappingPost | null> =
    new BaseObservable<CredentialSetupMappingPost| null>(null);

  constructor(private fb: FormBuilder) {}

  setSelectedMapping(value: CredentialSetupMappingPost | null): void {
    this.selectedMapping.set(value);
  }

  getSelectedMappingStream(): Observable<CredentialSetupMappingPost | null> {
    return this.selectedMapping.getStream();
  }

  createForm(): FormGroup {
    return this.fb.group({
      mappingId: [null],
      regionIds: [null, Validators.required],
      locationIds: [null, Validators.required],
      departmentIds: [null, Validators.required],
      groupIds: [null, Validators.required],
      credentialType: [null, Validators.required],
    });
  }

  removeSelectedCredential(form: FormGroup, id: number): void {
    const credentialTypeControl = form.get('credentialType');
    const filteredCredentialTypeValues = this.getFilteredCredentialType(
      credentialTypeControl as AbstractControl,
      id
    );

    credentialTypeControl?.setValue(filteredCredentialTypeValues);
  }

  getSelectedCredential(credentialList: CredentialSetupDetails[], id: number): CredentialSetupDetails {
    return credentialList.find((credential: CredentialSetupDetails) => {
      return id === credential.masterCredentialId;
    }) as CredentialSetupDetails;
  }

  prepareCredentialTypeSources(credentialSetupList: CredentialSetupGet[]): CredentialTypeSource[] {
    return credentialSetupList.map((credential: CredentialSetupGet) => {
      return {
        name: `${credential.credentialType} / ${credential.description}`,
        id: credential.masterCredentialId,
      };
    });
  }

  getRowsPageWithNotSavedCredential(
    type: number[] = [],
    currentPage: number,
    credentialList: CredentialSetupGet[],
    selectedCredentialIds: number[],
    activeRowsPerPage: number,
  ): CredentialSetupGet[] {
    const updatedCredentialList = credentialList.filter((credential: CredentialSetupGet) => {
      return type.includes(credential.masterCredentialId);
    }).map((credential: CredentialSetupGet) => {
      if (!selectedCredentialIds.includes(credential.masterCredentialId)) {
        return {
          ...credential,
          hasToolTip: true,
        };
      }

      return credential;
    });

    return this.getRowsPerPage(updatedCredentialList,currentPage,activeRowsPerPage);
  }

  getSelectedCredentialListIds(selectedCredentialList: CredentialSetupDetails[]): number[] {
    return selectedCredentialList.map((selectedCredential: CredentialSetupDetails) => {
      return selectedCredential.masterCredentialId;
    });
  }

  getRowsPage(
    type: number[] = [],
    currentPage: number,
    credentialList: CredentialSetupGet[],
    activeRowsPerPage: number
  ): CredentialSetupGet[] {
    if(type.length) {
      const updatedCredentialList = credentialList.filter((credential: CredentialSetupGet) => {
        return type.includes(credential.masterCredentialId);
      });

      return this.getRowsPerPage(updatedCredentialList,currentPage,activeRowsPerPage);
    }

    return this.getRowsPerPage(credentialList,currentPage,activeRowsPerPage);
  }

  getUpdatedCredentialSetupList(
    credentialSetupList: CredentialSetupGet[],
    credentials: CredentialSetupGet[]
  ): CredentialSetupGet[] {
    return credentialSetupList.map((credentialSetup:CredentialSetupGet) => {
      const selectedCredential = credentials.find((credential: CredentialSetupGet) => {
        return credential.masterCredentialId === credentialSetup.masterCredentialId;
      });

      if (selectedCredential) {
        return selectedCredential;
      }

      return credentialSetup;
    });
  }

  private getRowsPerPage(
    credentialList: CredentialSetupGet[],
    currentPage: number,
    activeRowsPerPage: number
  ): CredentialSetupGet[] {
    return credentialList.slice((currentPage * activeRowsPerPage) - activeRowsPerPage,
      (currentPage * activeRowsPerPage));
  }

  private getFilteredCredentialType(control: AbstractControl, id: number): number[] {
    return control?.value.filter((value: number) => {
      return value !== id;
    });
  }
}
