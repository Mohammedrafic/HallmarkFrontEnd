import { AbstractControl, ValidatorFn } from '@angular/forms';

export function asteriskValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const value: string = control.value;

    if (value && value?.includes('*')) {
      return { 'asteriskError': true };
    }

    return null;
  };
}
