import { Injectable } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { CustomFormGroup } from "@core/interface";
import { ONLY_NUMBER } from "@shared/constants";
import { DoNotReturnFilterForm, DoNotReturnForm } from "./do-not-return.interface";

@Injectable()
export class DoNotReturnFormService {

  constructor(
    private fb: FormBuilder,
  ) { }

  createDoNotreturnForm(): CustomFormGroup<DoNotReturnForm> {
    return this.fb.group({
      id: [0],
      isExternal: ['false', [Validators.required]],
      businessUnitId: ['', [Validators.required]],
      regionIds:['',[Validators.required]],
      locationIds: ['', [Validators.required]],
      ssn: ['', [Validators.minLength(9)]],
      dob: [null],
      candidateEmail: ['',[Validators.email, Validators.maxLength(200)]],
      dnrComment: [''],
      candidateProfileId: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      middleName: [''],
      lastName: ['', [Validators.required]],
      dnrStatus: ['Blocked'],
    }) as CustomFormGroup<DoNotReturnForm>;
  }

  createDoNotreturnFilterForm(): CustomFormGroup<DoNotReturnFilterForm> {
    return this.fb.group({
      businessUnitId: ['', [Validators.required]],
      firstName: [''],
      middleName: [''],
      lastName: [''],
      ssn: [''],
      regionBlocked:[''],
      locationBlocked: [''],
      email: ['',[Validators.email, Validators.maxLength(200)]],
      currentStatus: ['Blocked'],
    }) as CustomFormGroup<DoNotReturnFilterForm>;
  }

}
