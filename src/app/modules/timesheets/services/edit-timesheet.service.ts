import { FormBuilder, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';

import { CustomFormGroup } from '@core/interface';
import { EditTimsheetForm } from '../interface/form.interface';

@Injectable()
export class EditTimesheetService {
  constructor(
    private fb: FormBuilder,
  ) {}

  createForm(): CustomFormGroup<EditTimsheetForm> {
    return this.fb.group(
      {
        day: [{ value: null, disabled: true }],
        timeIn: [null, Validators.required],
        timeOut: [null, Validators.required],
        costCenter: [null, Validators.required],
        category: [null, Validators.required],
        hours: [null, Validators.required],
        rate: [null, Validators.required],
        total:[{ value: null, disabled: true }],
      }
    ) as CustomFormGroup<EditTimsheetForm>;
  }
}
