import { FormGroup, FormBuilder } from '@angular/forms';
import { Injectable } from '@angular/core';

/**
 * This service is a placeholder to be overrided in providers for AddDialogHelper.
 */
@Injectable()
export class AddDialogHelperService {
  constructor(private fb: FormBuilder) {}

  createForm(type?: unknown): FormGroup {
    return this.fb.group([]);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeTimeValidators(form: unknown): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addTimeValidators(form: unknown): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addTimeOutValidator(form: unknown): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeTimeOutValidator(form: unknown): void {}
}
