import { AbstractControlOptions, FormBuilder, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';

import { CustomFormGroup } from '@core/interface';
import { RecordFields } from '../enums';
import { EditTimsheetForm } from '../interface';
import { dateRangeValidator } from '@core/helpers';

@Injectable()
export class AddRecordService {
  constructor(
    private fb: FormBuilder,
  ) {}

  createForm(type: RecordFields): CustomFormGroup<EditTimsheetForm> {
    if (type === RecordFields.Time) {
      const options: AbstractControlOptions = {
        validators: dateRangeValidator,
      };
      return this.fb.group({
          timeIn: [null, [Validators.required]],
          timeOut: [null, [Validators.required]],
          costCenter: [null, Validators.required],
          billRateConfigId: [null, Validators.required],
          amount: [null, [Validators.required, Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)]],
        }, options ) as CustomFormGroup<EditTimsheetForm>;
    }

    if (type === RecordFields.Miles) {
      return this.fb.group(
        {
          day: [null, [Validators.required]],
          costCenter: [null, Validators.required],
          billRateConfigId: [null, Validators.required],
          amount: [null, [Validators.required, Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)]],
        }
      ) as CustomFormGroup<EditTimsheetForm>;
    }

    return this.fb.group(
      {
        day: [null, [Validators.required]],
        costCenter: [null, Validators.required],
        billRateConfigId: [null, Validators.required],
        description: [null, Validators.maxLength(250)],
        amount: [null, [Validators.required, Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)]],
      }
    ) as CustomFormGroup<EditTimsheetForm>;

  }
}
