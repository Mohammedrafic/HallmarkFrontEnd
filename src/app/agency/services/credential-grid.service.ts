import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { FilesPropModel } from '@syncfusion/ej2-angular-inputs';

import { AddCredentialForm, SearchCredentialForm } from '@shared/components/credentials-grid/credentials-grid.interface';
import { CustomFormGroup } from '@core/interface';
import { CredentialStatus } from '@shared/enums/status';
import { CandidateCredential, CredentialFile, CredentialRequestParams } from '@shared/models/candidate-credential.model';

@Injectable()
export class CredentialGridService {
  constructor(private fb: FormBuilder) {}

  public getCandidateCredentialFileIds(credentials: CandidateCredential[]): number[] {
    return credentials
      .map((item: CandidateCredential) => (item.credentialFiles as CredentialFile[])[0].candidateCredentialId);
  }

  public getCredentialRowsWithFiles(credentialRows: CandidateCredential[]): CandidateCredential[] {
    return credentialRows.filter((item: CandidateCredential) => item.credentialFiles?.length);
  }

  public getCredentialStatusOptions(statuses: CredentialStatus[]): FieldSettingsModel[] {
    return statuses.map((item: CredentialStatus) => {
      return {
        text: CredentialStatus[item],
        id: item,
      };
    });
  }

  public getExistingFile(credentialFile: CredentialFile): FilesPropModel {
    const [name, type] = credentialFile.name.split(/\./);

    return {
      name,
      type,
      size: 0,
    };
  }

  public getCredentialRequestParams(
    pageNumber: number,
    pageSize: number,
    orderId: number | null,
    organizationId: number | null,
    candidateProfileId: number | undefined,
  ): CredentialRequestParams {
    const params: CredentialRequestParams = { pageNumber, pageSize, candidateProfileId };

    if (orderId) {
      params.orderId = orderId;
    }

    if (organizationId) {
      params.organizationId = organizationId;
    }

    return params;
  }

  public createAddCredentialForm(): CustomFormGroup<AddCredentialForm> {
    return this.fb.group({
      status: new FormControl(null, [Validators.required]),
      insitute: new FormControl(null, [Validators.maxLength(100)]),
      createdOn: new FormControl(null, [Validators.required]),
      number: new FormControl(null, [Validators.maxLength(100)]),
      experience: new FormControl(null, [Validators.maxLength(20)]),
      createdUntil: new FormControl(null, [Validators.required]),
      completedDate: new FormControl(null),
      rejectReason: new FormControl(null),
    }) as CustomFormGroup<AddCredentialForm>;
  }

  public createSearchCredentialForm(): CustomFormGroup<SearchCredentialForm> {
    return this.fb.group({
      searchTerm: new FormControl(''),
      credentialTypeId: new FormControl(''),
    }) as CustomFormGroup<SearchCredentialForm>;
  }
}
