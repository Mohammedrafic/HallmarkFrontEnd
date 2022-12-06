import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CustomFormGroup } from '@core/interface';
import { CredentialFilter } from '@shared/models/credential.model';
import { CredentialDTO } from '@shared/components/credentials-list/interfaces';

@Injectable()
export class CredentialListService {
  constructor(private formBuilder: FormBuilder) {}

  public createFiltersForm(isIncludeIrp: boolean): CustomFormGroup<CredentialFilter> {
    let filtersForm = this.formBuilder.group({
      credentialIds: [[]],
      credentialTypeIds: [[]],
      expireDateApplicable: [false],
    });

    if(isIncludeIrp) {
      filtersForm = this.formBuilder.group({
        ...filtersForm.controls,
        includeInIRP: [true],
        includeInVMS: [true],
      });
    }

    return filtersForm as CustomFormGroup<CredentialFilter>;
  }

  public createCredentialForm(
    isIncludeIrp: boolean,
    isCredentialSettings: boolean
  ): CustomFormGroup<CredentialDTO> {
    let credentialForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      credentialTypeId: ['', Validators.required],
      expireDateApplicable: [false],
      comment: ['', Validators.maxLength(500)],
    });

    if(isIncludeIrp && isCredentialSettings) {
      credentialForm = this.formBuilder.group({
        ...credentialForm.controls,
        includeInIRP: [false],
        includeInVMS: [false, [Validators.required]],
      });
    }

    return credentialForm as CustomFormGroup<CredentialDTO>;
  }

  public addControlToForm(
    form: FormGroup,
    controlName: string,
    controlState: boolean | string | number | null
  ): void {
    form?.addControl(controlName, this.formBuilder.control(controlState));
  }

  public removeControlFromForm(form: FormGroup, controlName: string): void {
    form?.removeControl(controlName);
  }
}
