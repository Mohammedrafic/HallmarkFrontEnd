import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function startEndTimeValidator(startTimeControlName: string, endTimeControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const startTimeControl = formGroup.get(startTimeControlName)!;
    const endTimeControl = formGroup.get(endTimeControlName)!;
    const startTimeMs = new Date(startTimeControl?.value).getTime();
    const endTimeMs = new Date(endTimeControl?.value).getTime();
    const invalidTimeError = { invalidTime: true };

    if (!Boolean(startTimeMs && endTimeMs)) {
      return null;
    }

    if (startTimeMs > endTimeMs) {
      if (startTimeControl.pristine) {
        endTimeControl.setErrors(invalidTimeError);
      }
      if (endTimeControl.pristine) {
        startTimeControl.setErrors(invalidTimeError);
      }
    } else {
      startTimeControl.setErrors(startTimeMs ? null : startTimeControl.errors);
      endTimeControl.setErrors(endTimeMs ? null : endTimeControl.errors);
      startTimeControl.markAsPristine();
      endTimeControl.markAsPristine();
    }

    return null;
  };
}
