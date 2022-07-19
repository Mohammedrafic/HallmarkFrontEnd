import { AbstractControl } from '@angular/forms';
import { ValidatorFn } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';

export const dateRangeValidator: ValidatorFn = ((control: AbstractControl): ValidationErrors | null => {
  const timeIn = control.get('timeIn')?.value;
  const timeOut = control.get('timeOut')?.value;

  if (timeOut < timeIn) {
    control.get('timeOut')?.setErrors({ range: 'invalid range selected' })
    return { range: 'invalid range selected' };
  }
  return null;
});