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
      businessUnitId: ['', [Validators.required]],
      regionIds:['',[Validators.required]],
      locations: [''],
      locationIds: ['', [Validators.required]],
      ssn: ['', [Validators.minLength(9)]],
      candidateEmail: ['',[Validators.email, Validators.maxLength(200)]],
      dnrComment: ['', [Validators.required]],
      dnrRequestedBy: [''],
      candidateProfileId: ['', [Validators.required]],
      dnrStatus: ['Active'],
    }) as CustomFormGroup<DoNotReturnForm>;
  }

  createDoNotreturnFilterForm(): CustomFormGroup<DoNotReturnFilterForm> {
    return this.fb.group({
      candidatename: [''],
      ssn: [''],
    }) as CustomFormGroup<DoNotReturnFilterForm>;
  }

}
