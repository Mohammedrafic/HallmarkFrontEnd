import { AbstractControl } from '@angular/forms';

export function ApplicabilityValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const initialOrderControl = control.get('initialOrders');
  const extensionControl = control.get('extensions');

  if (!initialOrderControl?.value && !extensionControl?.value) {
    initialOrderControl?.setErrors({ 'shouldSelectCheckbox': true });
    extensionControl?.setErrors({ 'shouldSelectCheckbox': true });
  } else {
    initialOrderControl?.setErrors(null);
    extensionControl?.setErrors(null);
  }

  return null;
}
