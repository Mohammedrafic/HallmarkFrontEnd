import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DateTimeHelper } from '@core/helpers';

export function greaterThanValidator(primaryControlName: string, secondaryControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const primaryControl = formGroup.get(primaryControlName)!;
    const secondaryControl = formGroup.get(secondaryControlName)!;
    const primaryControlValue = adaptValue(primaryControl?.value);
    const secondaryControlValue = adaptValue(secondaryControl?.value);
    const invalidTimeError = { invalidTime: true };

    if (!Boolean(primaryControl && secondaryControl && primaryControlValue && secondaryControlValue)) {
      return null;
    }

    if (primaryControlValue > secondaryControlValue) {
      if (!primaryControl.pristine && !secondaryControl.pristine) {
        secondaryControl.setErrors(invalidTimeError);
      }

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

function adaptValue(value: Date | string): number {
  if (value instanceof Date) {
    return DateTimeHelper.setCurrentUtcDate(value.toString()).getTime();
  }
  return parseFloat(value);
}
