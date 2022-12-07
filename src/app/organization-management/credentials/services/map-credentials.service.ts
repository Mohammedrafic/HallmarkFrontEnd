import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class MapCredentialsService {
  constructor(private fb: FormBuilder) {
  }

  createForm(): FormGroup {
    return this.fb.group({
      mappingId: [null],
      regionIds: [null, Validators.required],
      locationIds: [null, Validators.required],
      departmentIds: [null, Validators.required],
      groupIds: [null, Validators.required],
    });
  }
}
