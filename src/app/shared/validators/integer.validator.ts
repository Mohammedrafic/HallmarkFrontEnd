import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * @description Integer form control validator: checks whether control value is integer
 * @optional min: number
 * @optional max: number
 * @returns null if value is correct otherwise { integerValidator: true }
 */
export function integerValidator(min?: number, max?: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const controlValue = control.value;

    if (!controlValue) {
      return null;
    }

    // @ts-ignore
    if (Number.isInteger(min) && controlValue < min) {
      return { integerValidator: true };
    }

    // @ts-ignore
    if (Number.isInteger(max) && controlValue > max) {
      return { integerValidator: true };
    }

    if (!isNaN(controlValue) && controlValue % 1 === 0) {
      return null;
    }

    return { integerValidator: true };
  }
}
