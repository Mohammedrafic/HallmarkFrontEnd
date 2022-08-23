import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';

@Injectable()
export class AddInvoiceService {
  constructor (
    private fb: FormBuilder,
  ) {}

  public createForm(isAgency: boolean): FormGroup {
    return this.fb.group({
      orderId: [null, Validators.required],
      nameId: [null, Validators.required],
      unitId: [null, Validators.required],
      locationId: [null, Validators.required],
      departmentId: [null, Validators.required],
      date: ['', Validators.required],
      value: [null, [Validators.required, Validators.min(-Number.MAX_SAFE_INTEGER),
        Validators.max(Number.MAX_SAFE_INTEGER)]],
      reasonId: [null],
      link: [null],
      vendorFee: [true],
      description: [null, Validators.maxLength(250)],
    });
  }
}
