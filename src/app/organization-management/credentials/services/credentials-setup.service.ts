import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CredentialSetupGet } from '@shared/models/credential-setup.model';

@Injectable()
export class CredentialsSetupService {
  constructor(private fb: FormBuilder) {
  }

  createCredentialsSetupForm(): FormGroup {
    return this.fb.group({
      mappingId: [null],
      masterCredentialId: [null],
      credentialType: [{ value: '', disabled: true }],
      description: [{ value: '', disabled: true }],
      comments: [{ value: '', disabled: true }, Validators.maxLength(500)],
      inactiveDate: [null],
      isActive: [false],
      reqSubmission: [false],
      reqOnboard: [false]
    });
  }

  createFilterGroup(): FormGroup {
    return this.fb.group({
      regionId: [null],
      locationId: [null],
      departmentId: [null],
      groupId: [null],
      skillId: [null],
    });
  }

  populateCredentialSetupForm(
    form: FormGroup,
    credentials: CredentialSetupGet,
    isCredentialIRPAndVMSEnabled: boolean,
    checkboxName: string = '',
    isChecked: boolean = false
  ): void {
    form.setValue({
      mappingId: credentials.mappingId,
      masterCredentialId: credentials.masterCredentialId,
      credentialType: credentials.credentialType,
      description: credentials.description,
      comments: credentials.comments,
      inactiveDate: credentials.inactiveDate,
      ...(isCredentialIRPAndVMSEnabled && { irpComments: credentials.irpComments }),
      isActive: checkboxName === 'isActive' ? isChecked : credentials.isActive,
      reqSubmission: checkboxName === 'reqSubmission' ? isChecked : credentials.reqSubmission,
      reqOnboard: checkboxName === 'reqOnboard' ? isChecked : credentials.reqOnboard,
    });
  }

  systemFieldSettings(form: FormGroup, isAdd: boolean): void {
    if (isAdd) {
      form.addControl('includeInIRP', this.fb.control(false));
      form.addControl('includeInVMS', this.fb.control(false));
    } else {
      form.removeControl('includeInIRP');
      form.removeControl('includeInVMS');
    }
  }

  irpCommentFieldSettings(form: FormGroup, isAdd: boolean): void {
    if (isAdd) {
      form.addControl(
        'irpComments',
        this.fb.control({ value: '', disabled: true }, [Validators.maxLength(500)])
      );
    } else {
      form.removeControl('irpComments');
    }
  }
}
