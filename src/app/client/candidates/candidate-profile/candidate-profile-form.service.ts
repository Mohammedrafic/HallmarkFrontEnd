import { Injectable } from '@angular/core';
import { ProfileStatusesEnum } from '@client/candidates/candidate-profile/candidate-profile.constants';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { greaterThanValidator } from '@shared/validators/greater-than.validator';
import { CandidateModel } from '@client/candidates/candidate-profile/candidate.model';
import pick from 'lodash/fp/pick';
import { ListOfSkills } from '@shared/models/skill.model';
import { difference } from 'lodash';

@Injectable()
export class CandidateProfileFormService {
  public readonly candidateForm: FormGroup = this.createForm();
  public saveEvent$: Subject<void> = new Subject<void>();
  public tabUpdate$: Subject<number> = new Subject<number>();

  constructor(private formBuilder: FormBuilder) {}

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
        state: [null, [Validators.required]],
        city: [null, [Validators.required, Validators.maxLength(20)]],
        zipCode: [null],
        personalEmail: [
          null,
          [Validators.required, Validators.email, Validators.maxLength(200)],
        ],
        workEmail: [null, [Validators.email, Validators.maxLength(200)]],
        phone1: [null, [Validators.required]],
        phone2: [null],
        professionalSummary: [null],
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
    this.candidateForm.patchValue(this.getPartialFormValueByControls(candidate));
  }

  public removeValidators(): void {
    const controls = ['holdStartDate', 'terminationDate', 'terminationReasonId'];

    controls.forEach(() => {
      this.candidateForm.removeValidators(Validators.required);
    });

    this.candidateForm.updateValueAndValidity();
  }

  private getPartialFormValueByControls(value: CandidateModel): any {
    return pick(Object.keys(this.candidateForm.controls), value);
  }
}
