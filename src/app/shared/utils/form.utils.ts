import { FormGroup } from '@angular/forms';

/** Disable form controls and return new FormGroup */
export const disableControls = (groupInstance: FormGroup, controlNames: string[]): FormGroup => {
  controlNames.forEach((controlName: string) => {
    const control = groupInstance?.get(controlName);
    control && control?.disable();
  });
  return groupInstance;
};
