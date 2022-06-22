import { AbstractControl, FormGroup } from '@angular/forms';

export interface CustomFormGroup<T> extends FormGroup {
  value: T;
  constrols: {
    [key in keyof T]: AbstractControl;
  }
}
