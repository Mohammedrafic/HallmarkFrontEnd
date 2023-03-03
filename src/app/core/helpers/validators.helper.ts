import { formatDate } from '@angular/common';
import { AbstractControl, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { EmailValidation } from '@core/constants';

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
    if (!Array.isArray(control.value) && control.value && key === 'contactEmails') {
      acc[key] = [control.value];
    } else if (
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

export const MultiEmailValidator = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  const invalidEmailList = control.value.split(',').filter((mail: string): void | string => {
    const email = mail.trim();

    if(!EmailValidation.test(email)) {
      return email;
    }
  });

  return invalidEmailList?.length ? { invalidEmails: invalidEmailList } : null;
};

export const GenerateLocationDepartmentOverlapMessage = (isLocationOverlaps: boolean, isDepartmentOverlaps: boolean, isLocationDepartmentDateSame: boolean, locationInactiveDate: Date, departmentInactiveDate: Date): string => {
  let message = '';
  if (isLocationOverlaps) {
    if (isDepartmentOverlaps) {
      if (isLocationDepartmentDateSame) {
        message = `Location and Department will be inactivated at ${formatDate(locationInactiveDate, 'MM/dd/yyyy', 'en-US')}. Are you sure you want to proceed?`;
      } else {
        message = `Location will be inactivated at ${formatDate(locationInactiveDate, 'MM/dd/yyyy', 'en-US')} and Department will be inactivated at ${formatDate(departmentInactiveDate, 'MM/dd/yyyy', 'en-US')}. Are you sure you want to proceed?`;
      }
    } else {
      message = `Location will be inactivated at ${formatDate(locationInactiveDate, 'MM/dd/yyyy', 'en-US')}. Are you sure you want to proceed?`;
    }
  } else if (isDepartmentOverlaps) {
    message = `Department will be inactivated at ${formatDate(departmentInactiveDate, 'MM/dd/yyyy', 'en-US')}. Are you sure you want to proceed?`;
  }
  return message;
}
