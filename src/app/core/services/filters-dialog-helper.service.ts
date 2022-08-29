import { FormGroup, FormBuilder } from '@angular/forms';
import { Injectable } from '@angular/core';

/**
 * This service is a placeholder to be overrided in providers for FiltersDialogs.
 */
@Injectable()
export class FiltersDialogHelperService {
  constructor(private fb: FormBuilder) {}

  public createForm(type?: unknown): FormGroup {
    return this.fb.group([]);
  }

  public setDataSourceByFormKey(
    key: unknown,
    source: unknown,
  ): void {
  }
}
