import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * @description Currency form control validator: checks whether control value is float with 2 digits after coma
 * @optional min: number
 * @optional max: number
 * @returns null if value is correct and { currencyValidator: true } otherwise
 */
export function currencyValidator(min?: number, max?: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const controlValue = control.value;

    if (!controlValue) {
      return null;
    }

    // @ts-ignore
    if (Number.isInteger(min) && controlValue < min) {
      return { currencyValidator: true };
    }

    // @ts-ignore
    if (Number.isInteger(max) && controlValue > max) {
      return { currencyValidator: true };
    }

    if (!isNaN(controlValue) && parseFloat((controlValue * 100).toFixed(2)) % 1 === 0) {
      return null;
    }

    return { currencyValidator: true };
  }
}
