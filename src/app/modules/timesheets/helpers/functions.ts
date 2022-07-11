import { AbstractControl, FormGroup } from '@angular/forms';

import { TIMETHEETS_STATUSES } from '../enums';

export const getTimesheetStatusFromIdx = (idx: number): TIMETHEETS_STATUSES | string => {
  return idx === 1 ? TIMETHEETS_STATUSES.PENDING_APPROVE :
    idx === 2 ? TIMETHEETS_STATUSES.MISSING :
      idx === 3 ? TIMETHEETS_STATUSES.REJECTED :
        '';
}

export const leftOnlyValidValues = (formGroup: FormGroup): any => {
  return Object.entries(formGroup.controls).reduce((acc: any, [key, control]: [string, AbstractControl]) => {
    if (
      control.touched &&
      control.dirty &&
      (!Array.isArray(control.value) && control.value ||
        Array.isArray(control.value) && control.value.length)
    ) {
      acc[key] = control.value;
    }

    return acc;
  }, {});
}
