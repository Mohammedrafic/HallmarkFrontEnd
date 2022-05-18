import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function startDateValidator(form: AbstractControl, controlName: string, minDate: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (form && control.value) {
      const isLessThanMin = control.value < minDate;
      if (form.get(controlName)?.value) {
        const forbidden = isLessThanMin || control.value > new Date(form.get(controlName)?.value);
        return forbidden ? {invalidDate: {value: control.value}} : null;
      } else {
        const forbidden = isLessThanMin;
        return forbidden ? {invalidDate: {value: control.value}} : null;
      }
    }
    return null;
  };
}

export function endDateValidator(form: AbstractControl, controlName: string, minDate: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (form && control.value) {
      const isLessThanMin = control.value < minDate;
      if (form.get(controlName)?.value) {
        const forbidden = isLessThanMin || control.value < new Date(form.get(controlName)?.value);
        return forbidden ? {invalidDate: { value: control.value }} : null;
      } else {
        const forbidden = isLessThanMin;
        return forbidden ? {invalidDate: { value: control.value }} : null;
      }
    }
    return null;
  };
}

export function startTimeValidator(form: AbstractControl, controlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (form && control.value && form.get(controlName)?.value) {
      const forbidden = control.value > new Date(form.get(controlName)?.value);
      return forbidden ? {invalidDate: {value: control.value}} : null;
    }
    return null;
  };
}

export function endTimeValidator(form: AbstractControl, controlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (form && control.value && form.get(controlName)?.value) {
      const forbidden = control.value < new Date(form.get(controlName)?.value);
      return forbidden ? {invalidDate: { value: control.value }} : null;
    }
    return null;
  };
}
