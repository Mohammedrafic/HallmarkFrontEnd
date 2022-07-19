import { AbstractControl, FormGroup } from '@angular/forms';

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
