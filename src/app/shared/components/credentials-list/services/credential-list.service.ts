import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs';

import { CustomFormGroup } from '@core/interface';
import { CredentialFilter } from '@shared/models/credential.model';
import { CredentialDTO } from '@shared/components/credentials-list/interfaces';
import { BaseObservable } from '@core/helpers';

@Injectable()
export class CredentialListService {
  private readonly assignCredentialModalState: BaseObservable<boolean> = new BaseObservable<boolean>(false);

  constructor(private formBuilder: FormBuilder) {}

  setAssignCredentialModalState(state: boolean): void {
    this.assignCredentialModalState.set(state);
  }

  getAssignCredentialModalStateStream(): Observable<boolean> {
    return this.assignCredentialModalState.getStream();
  }

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
      comment: ['', Validators.maxLength(4000)],
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
