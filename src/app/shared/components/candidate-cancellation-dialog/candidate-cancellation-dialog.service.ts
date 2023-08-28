import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class CandidateCancellationDialogService {

  constructor(private formBuilder: FormBuilder) {}

  createCandidateCancellationForm(hasEndDateControl: boolean): FormGroup {
    if (hasEndDateControl) {
      return this.formBuilder.group({
        jobCancellationReason: [null, Validators.required],
        penaltyCriteria: [null, Validators.required],
        rate: [null, Validators.required],
        hours: [null, Validators.required],
        actualEndDate: [null, Validators.required],
      });
    }

    return this.formBuilder.group({
      jobCancellationReason: [null, Validators.required],
      penaltyCriteria: [null, Validators.required],
      rate: [null, Validators.required],
      hours: [null, Validators.required],
    });
  }
}
