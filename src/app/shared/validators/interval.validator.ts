import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function intervalMinValidator(form: AbstractControl, controlName: string, updateSecondControl = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (form) {
      const controlToValidate = form.get(controlName);
      const result = !controlToValidate?.disabled && control.value >= controlToValidate?.value;

      if (updateSecondControl && !result) {
        controlToValidate?.setErrors(null);
      }

      return result ? { invalidInterval: { value: control.value }} : null;
    }

    return null;
  }
}

export function intervalMaxValidator(form: AbstractControl, controlName: string, updateSecondControl = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (form) {
      const controlToValidate = form.get(controlName);
      const result = control.value <= controlToValidate?.value;

      if (updateSecondControl && !result) {
        controlToValidate?.setErrors(null);
      }

      return result ? { invalidInterval: { value: control.value }} : null;
    }

    return null;
  }
}
