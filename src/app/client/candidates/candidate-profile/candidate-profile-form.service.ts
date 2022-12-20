import { Injectable } from '@angular/core';
import { ProfileStatusesEnum } from '@client/candidates/candidate-profile/candidate-profile.constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidateProfileFormService {
  public readonly candidateForm: FormGroup = this.createForm();
  public saveEvent$: Subject<void> = new Subject<void>();

  constructor(private formBuilder: FormBuilder) {
  }

  public triggerSaveEvent(): void {
    this.saveEvent$.next();
  }


  public resetCandidateForm(): void {
    this.candidateForm.reset({
      profileStatus: ProfileStatusesEnum.Active
    });
  }

  public markCandidateFormAsTouched(): void {
    this.candidateForm.markAllAsTouched();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      employeeId: [null, [Validators.required, Validators.maxLength(50)]],
      firstName: [null, [Validators.required, Validators.maxLength(50)]],
      middleName: [null, [Validators.maxLength(10)]],
      lastName: [null, [Validators.required, Validators.maxLength(50)]],
      dob: [null],
      primarySkillId: [null, [Validators.required]],
      secondarySkills: [null],
      classification: [null],
      hireDate: [null, [Validators.required]],
      fte: [null, [Validators.required, Validators.min(0.0), Validators.max(1)]],
      profileStatus: [ProfileStatusesEnum.Active],
      hrCompanyCodeId: [null],
      internalTransferId: [null],
      orientationConfigurationId: [null],
      organizationOrientationDate: [null],
      isContract: [false],
      contractStartDate: [null],
      contractEndDate: [null],
      address1: [null],
      country: [null, [Validators.required]],
      state: [null, [Validators.required]],
      city: [null, [Validators.required]],
      zipCode: [null],
      personalEmail: [null, [
        Validators.required,
        Validators.email,
        Validators.maxLength(200),
        Validators.pattern(/\S+@\S+\.com/)]
      ],
      workEmail: [null, [Validators.email, Validators.maxLength(200), Validators.pattern(/\S+@\S+\.com/)]],
      phone1: [null, [Validators.required]],
      phone2: [null],
      professionalSummary: [null]
    });
  }

}
