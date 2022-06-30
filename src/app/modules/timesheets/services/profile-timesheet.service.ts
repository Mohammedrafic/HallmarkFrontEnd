import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { endTimeValidator, startTimeValidator } from '@shared/validators/date.validator';

@Injectable()
export class ProfileTimesheetService {
  constructor(private fb: FormBuilder) {
  }

  public populateForm(data: any): FormGroup {
    const group = this.fb.group({
      timeIn: [new Date(data.timeIn), [Validators.required]],
      timeOut: [new Date(data.timeOut), [Validators.required]],
      category: [data.category, [Validators.required]],
      costCenter: [data.costCenter, []],
    });

    group.get('timeIn')?.addValidators(startTimeValidator(group, 'timeOut'));
    group.get('timeOut')?.addValidators(endTimeValidator(group, 'timeIn'));

    return group;
  }
}
