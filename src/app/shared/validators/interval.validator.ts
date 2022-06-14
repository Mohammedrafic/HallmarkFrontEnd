import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function intervalMinValidator(form: AbstractControl, controlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (form && control.value && form.get(controlName)?.value) {
      const result = control.value > form.get(controlName)?.value;
      return result ? { invalidInterval: { value: control.value }} : null;
    }

    return null;
  }
}

export function intervalMaxValidator(form: AbstractControl, controlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (form && control.value && form.get(controlName)?.value) {
      const result = control.value < form.get(controlName)?.value;
      return result ? { invalidInterval: { value: control.value }} : null;
    }

    return null;
  }
}
