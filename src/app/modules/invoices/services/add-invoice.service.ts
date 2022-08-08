import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';

@Injectable()
export class AddInvoiceService {
  constructor (
    private fb: FormBuilder,
  ) {}

  public createForm(): FormGroup {
    return this.fb.group({
      orderId: [null, Validators.required],
      name: [null, Validators.required],
      unitId: [null, Validators.required],
      locationId: [null, Validators.required],
      departmentId: [null, Validators.required],
      date: ['', Validators.required],
      value: [null, [Validators.required, Validators.min(1), Validators.max(Number.MAX_SAFE_INTEGER)]],
      reasonId: [null, Validators.required],
      link: [null],
      vendorFee: [null, Validators.required],
      description: [null],
    });
  }
}
