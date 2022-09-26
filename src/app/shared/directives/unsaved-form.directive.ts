import { Directive, forwardRef, Provider } from '@angular/core';
import { FormGroup } from '@angular/forms';

export abstract class UnsavedFormComponentRef {
  form: FormGroup;
}

export const UNSAVED_FORM_PROVIDERS: (host: unknown) => Provider = (
  host: unknown
): Provider => ({
  provide: UnsavedFormComponentRef,
  useExisting: forwardRef(() => host),
});

@Directive({
  selector: '[appUnsavedForm]',
})
export class UnsavedFormDirective {

  get hasChanges(): boolean {
    return this.host.form.dirty;
  }

  constructor(private host: UnsavedFormComponentRef) {}
}

