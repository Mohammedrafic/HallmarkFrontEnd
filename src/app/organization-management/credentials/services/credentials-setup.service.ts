import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { distinctUntilChanged, Observable } from 'rxjs';

import { BaseObservable, isObjectsEqual } from '@core/helpers';
import {
  CredentialSetupDetails,
  CredentialSetupFilterDto,
  CredentialSetupFilterGet,
  CredentialSetupGet,
  CredentialSetupMappingPost,
} from '@shared/models/credential-setup.model';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';

@Injectable()
export class CredentialsSetupService {
  private readonly filterGridState: BaseObservable<CredentialSetupFilterDto> =
    new BaseObservable<CredentialSetupFilterDto>({});
  private readonly selectedEditedCredential: BaseObservable<CredentialSetupGet | CredentialSetupDetails> =
    new BaseObservable<CredentialSetupGet | CredentialSetupDetails>({} as CredentialSetupGet);

  constructor(private fb: FormBuilder) {}

  setSelectedCredential(value: CredentialSetupGet | CredentialSetupDetails): void {
    this.selectedEditedCredential.set(value);
  }

  getSelectedCredentialStream(): Observable<CredentialSetupGet | CredentialSetupDetails> {
    return this.selectedEditedCredential.getStream();
  }

  setFilterGridState(value: CredentialSetupFilterDto): void {
    this.filterGridState.set(value);
  }

  getFiltersGridState(): CredentialSetupFilterDto {
    return this.filterGridState.get();
  }

  getFiltersGridStateStream(): Observable<CredentialSetupFilterDto> {
    return this.filterGridState.getStream().pipe(
      distinctUntilChanged((previous, current) => {
        return isObjectsEqual(previous as Record<string, unknown>, current as Record<string, unknown>);
      })
    );
  }

  createCredentialsSetupForm(): FormGroup {
    return this.fb.group({
      mappingId: [null],
      masterCredentialId: [null],
      credentialType: [{ value: '', disabled: true }],
      description: [{ value: '', disabled: true }],
      comments: [{ value: '' }, Validators.maxLength(500)],
      inactiveDate: [null],
      isActive: [false],
      reqSubmission: [false],
      reqOnboard: [false],
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
    checkboxName = '',
    isChecked= false
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
      form.addControl('includeInIRP', this.fb.control(false),{ emitEvent: false } );
      form.addControl('includeInVMS', this.fb.control(false), { emitEvent: false });
    } else {
      form.removeControl('includeInIRP', { emitEvent: false });
      form.removeControl('includeInVMS', { emitEvent: false });
    }
  }

  irpCommentFieldSettings(form: FormGroup, isAdd: boolean): void {
    if (isAdd) {
      form.addControl(
        'irpComments',
        this.fb.control({ value: '' }, [Validators.maxLength(500)])
      );
    } else {
      form.removeControl('irpComments');
    }
  }

  prepareSelectedCredentialMapping(
    data: CredentialSetupFilterGet,
    credentials: CredentialSetupGet[]
  ): CredentialSetupMappingPost {
    const credentialIds = this.getCredentialIds(credentials);

    return {
      credentionSetupMappingId: data.mappingId,
      regionIds: data.regionId ? [data.regionId] : data.regionId,
      locationIds: data.locationId ? [data.locationId] : data.locationId,
      departmentIds: data.departmentId ? [data.departmentId] : data.departmentId,
      skillGroupIds: data.skillGroups ? this.getSkillGroupsIds(data.skillGroups) : data.skillGroups,
      ...data,
      credentialType: credentialIds,
      credentials,
    };
  }

  private getSkillGroupsIds(skillGroups: CredentialSkillGroup[]): number[] {
    return skillGroups.map((skillGroup: CredentialSkillGroup) => {
      return skillGroup.id as number;
    });
  }

  private getCredentialIds(credentials: CredentialSetupGet[]): number[] {
    return credentials.map((credential: CredentialSetupGet) => {
      return credential.masterCredentialId;
    });
  }
}
