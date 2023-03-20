import { AbstractControl, ValidatorFn } from '@angular/forms';

export function ssnValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const ssnRegex = /^(?!219099999|078051120)(?!666|000|9\d{2})\d{3}(?!00)\d{2}(?!0{4})\d{4}$/;
    debugger;
    if (control.value && !ssnRegex.test(control.value)) {
      return { ssn: true };
    }

    return null;
  };
}
