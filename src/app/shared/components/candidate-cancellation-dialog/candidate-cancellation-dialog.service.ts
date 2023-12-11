import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class CandidateCancellationDialogService {

  constructor(private formBuilder: FormBuilder, private http: HttpClient ) {}

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
