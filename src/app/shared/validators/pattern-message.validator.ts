import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function patternMessageValidator(pattern: RegExp, message: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const controlValue = control.value;
    const error = {
      notMatchPattern: true,
      message,
    };

    if (!controlValue) {
      return null;
    }

    if (!pattern.test(controlValue)) {
      return error;
    }

    return null;
  };
}
