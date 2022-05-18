import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export function customEmailValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  return Validators.email(control);
}
