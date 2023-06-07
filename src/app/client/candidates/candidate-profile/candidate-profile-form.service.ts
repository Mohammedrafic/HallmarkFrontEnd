import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import pick from 'lodash/fp/pick';
import { difference } from 'lodash';

import { greaterThanValidator } from '@shared/validators/greater-than.validator';
import { CandidateModel } from '@client/candidates/candidate-profile/candidate.model';
import { ProfileStatusesEnum } from '@client/candidates/candidate-profile/candidate-profile.constants';
import { ListOfSkills } from '@shared/models/skill.model';
import { DateTimeHelper } from '@core/helpers';
import { candidateDateFields } from '../constants';
import { CandidatesService } from '../services/candidates.service';

@Injectable()
export class CandidateProfileFormService {
  public readonly candidateForm: FormGroup = this.createForm();
  public saveEvent$: Subject<void> = new Subject<void>();
  public tabUpdate$: Subject<number> = new Subject<number>();

  constructor(
    private formBuilder: FormBuilder,
    private candidateService: CandidatesService,
    ) { }

  public triggerSaveEvent(): void {
    this.saveEvent$.next();
  }

  public resetCandidateForm(): void {
    this.candidateForm.controls['secondarySkills'].disable();
    this.candidateForm.reset({
      profileStatus: ProfileStatusesEnum.Active,
      isContract: false,
    });
    this.removeValidators();
  }

  public markCandidateFormAsTouched(): void {
    this.candidateForm.markAllAsTouched();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group(
      {
        employeeId: [null, [Validators.required, Validators.maxLength(25)]],
        firstName: [null, [Validators.required, Validators.maxLength(50)]],
        middleName: [null, [Validators.maxLength(10)]],
        lastName: [null, [Validators.required, Validators.maxLength(50)]],
        dob: [null],
        primarySkillId: [null, [Validators.required]],
        secondarySkills: [{ value: null, disabled: true }],
        classification: [null],
        hireDate: [null, [Validators.required]],
        fte: [null, [Validators.required, Validators.min(0.0), Validators.max(1)]],
        profileStatus: [ProfileStatusesEnum.Active],
        hrCompanyCodeId: [null],
        internalTransferId: [null],
        orientationConfigurationId: [null],
        organizationOrientationDate: [null],
        isContract: [false],
        holdStartDate: [null],
        holdEndDate: [null],
        terminationDate: [null],
        terminationReasonId: [null],
        contractStartDate: [null, [Validators.required]],
        contractEndDate: [null, [Validators.required]],
        address1: [null, [Validators.maxLength(100)]],
        country: [null, [Validators.required]],
        state: [null],
        city: [null],
        zipCode: [null],
        personalEmail: [
          null,
          [Validators.required, Validators.email, Validators.maxLength(200)],
        ],
        workEmail: [null, [Validators.email, Validators.maxLength(200)]],
        phone1: [null, [Validators.required]],
        phone2: [null],
        professionalSummary: [null, Validators.maxLength(500)],
        generalNotes: [],
      },
      { validators: greaterThanValidator('contractStartDate', 'contractEndDate') }
    );
  }

  public getSecondarySkillsDataSource(primarySkills: ListOfSkills[], value: number): ListOfSkills[] {
    const diff = difference(primarySkills.map(({ masterSkillId }: ListOfSkills) => masterSkillId), [value]);
    return [...primarySkills.filter(({ masterSkillId }: ListOfSkills) => diff.includes(masterSkillId))];
  }

  public primarySkillHandler(secondarySkillField: AbstractControl, value: number): void {
    secondarySkillField[value ? 'enable' : 'disable']();
    secondarySkillField.reset();
  }

  public populateCandidateForm(candidate: CandidateModel): void {
    const candidateWithUTCDates = this.convertDateFildsToUtc(candidate);
    this.candidateForm.patchValue(this.getPartialFormValueByControls(candidateWithUTCDates));
  }

  public populateHoldEndDate(candidate: CandidateModel): void {
    if (candidate && candidate.profileStatus === ProfileStatusesEnum.OnHold) {
      const holdEndDate = candidate.holdEndDate ? DateTimeHelper.convertDateToUtc(candidate.holdEndDate as string) : null;
      this.candidateForm.get('holdEndDate')?.setValue(holdEndDate);
    }
  }

  public removeValidators(): void {
    const controls = ['holdStartDate', 'terminationDate', 'terminationReasonId'];

    controls.forEach(() => {
      this.candidateForm.removeValidators(Validators.required);
    });

    this.candidateForm.updateValueAndValidity();
  }

  public isOnHoldDateSetManually(): boolean {
    const isOnHoldSetManually = this.candidateService.getProfileData()?.isOnHoldSetManually;
    return isOnHoldSetManually || !!this.candidateForm.get('holdEndDate')?.dirty;
  }

  private getPartialFormValueByControls(value: CandidateModel): Partial<CandidateModel> {
    return pick(Object.keys(this.candidateForm.controls), value);
  }

  private convertDateFildsToUtc(candidate: CandidateModel): CandidateModel {
    const datesWithUtc = Object.fromEntries(candidateDateFields.map((dateName) => {
      const date = candidate[dateName as keyof CandidateModel];
      const dateUtc = date ? DateTimeHelper.convertDateToUtc(date as string) : null;

      return [dateName, dateUtc];
    }));

    return { ...candidate, ...datesWithUtc };
  }
}
