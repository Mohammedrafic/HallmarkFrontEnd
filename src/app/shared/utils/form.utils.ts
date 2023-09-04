import { AbstractControl, FormGroup } from '@angular/forms';

/** Disable form controls and return new FormGroup */
export const disableControls = (groupInstance: FormGroup, controlNames: string[], emitEvent = true): FormGroup => {
  controlNames.forEach((controlName: string) => {
    const control = groupInstance?.get(controlName);
    control && control?.disable({ emitEvent: emitEvent });
  });
  return groupInstance;
};

export const revertControlState = (control: AbstractControl, value: unknown): void => {
  control.setValue(value);
  control.markAsPristine();
};
