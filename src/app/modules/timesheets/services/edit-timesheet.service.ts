import { FormBuilder, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';

import { CustomFormGroup } from '@core/interface';
import { EditTimsheetForm } from '../interface';

@Injectable()
export class EditTimesheetService {
  constructor(
    private fb: FormBuilder,
  ) {}

  createForm(): CustomFormGroup<EditTimsheetForm> {
    return this.fb.group(
      {
        day: [null, Validators.required],
        timeIn: [null, [Validators.required]],
        timeOut: [null, [Validators.required]],
        costCenter: [null, Validators.required],
        category: [null, Validators.required],
        hours: [null, [Validators.required, Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)]],
        rate: [null, [Validators.required, Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)]],
      }
    ) as CustomFormGroup<EditTimsheetForm>;
  }
}
