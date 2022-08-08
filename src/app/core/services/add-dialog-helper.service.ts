import { FormGroup, FormBuilder } from '@angular/forms';
import { Injectable } from '@angular/core';

/**
 * This service is a placeholder to be overrided in providers for AddDialogHelper.
 */
@Injectable()
export class AddDialogHelperService {
  constructor(private fb: FormBuilder) {}

  public createForm(type?: unknown): FormGroup {
    return this.fb.group([]);
  }
}
