import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomFormGroup } from '@core/interface';
import { RnUtilizationForm } from './rn-utilization.interface';

@Injectable()
export class RnUtilizationFormService {
  constructor(private fb: FormBuilder) {}

  getNursingUtilizationForm(): CustomFormGroup<RnUtilizationForm> {
    return this.fb.group({
      workDate: [new Date(), Validators.required],
      workCommitment: [null, Validators.required],
      skills: [null, Validators.required],
      targetUtilization: [60, Validators.required],
    }) as CustomFormGroup<RnUtilizationForm>;
  }
}
