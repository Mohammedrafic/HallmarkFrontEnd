import { AbstractControl, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';

export const DateRangeValidator: ValidatorFn = ((control: AbstractControl): ValidationErrors | null => {
  const timeIn = control.get('timeIn')?.value;
  const timeOut = control.get('timeOut')?.value;

  if (timeOut < timeIn) {
    control.get('timeOut')?.setErrors({ range: 'invalid range selected' });
    return { range: 'invalid range selected' };
  }
  return null;
});

export const LeftOnlyValidValues = <T>(formGroup: FormGroup): T => {
  return Object.entries(formGroup.controls).reduce((acc: any, [key, control]: [string, AbstractControl]) => {
    if (
      (!Array.isArray(control.value) && control.value ||
        Array.isArray(control.value) && control.value.length)
    ) {
      acc[key] = control.value;
    }

    return acc;
  }, {});
};

export const AllTimesheetTimeSet = (formGroup: FormGroup): ValidationErrors | null => {
  const timeInControl = formGroup.get('timeIn');
  const timeOutControl = formGroup.get('timeOut');
  const timeInValueExist = !!timeInControl?.value;
  const timeOutValueExist = !!timeOutControl?.value;

  if (timeInValueExist && !timeOutValueExist) {
    timeOutControl?.setErrors({ notAllValuesSet: true });
    return { notAllValuesSet: true };
  }
  
  if (!timeInValueExist && timeOutValueExist) {
    timeInControl?.setErrors({ notAllValuesSet: true });
    return { notAllValuesSet: true };
  }

  timeInControl?.setErrors(null);
  timeOutControl?.setErrors(null);

  return null;
};
