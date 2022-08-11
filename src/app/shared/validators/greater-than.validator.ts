import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function greaterThanValidator(primaryControlName: string, secondaryControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const primaryControl = formGroup.get(primaryControlName)!;
    const secondaryControl = formGroup.get(secondaryControlName)!;
    const primaryControlValue = parseFloat(primaryControl?.value);
    const secondaryControlValue = parseFloat(secondaryControl?.value);
    const invalidTimeError = { invalidTime: true };

    if (!Boolean(primaryControl && secondaryControl && primaryControlValue && secondaryControlValue)) {
      return null;
    }

    if (primaryControlValue > secondaryControlValue) {
      if (primaryControl.pristine) {
        secondaryControl.setErrors(invalidTimeError);
      }
      if (secondaryControl.pristine) {
        primaryControl.setErrors(invalidTimeError);
      }
    } else {
      primaryControl.setErrors(primaryControlValue ? null : primaryControl.errors);
      secondaryControl.setErrors(secondaryControlValue ? null : secondaryControl.errors);
      primaryControl.markAsPristine();
      secondaryControl.markAsPristine();
    }

    return null;
  };
}
