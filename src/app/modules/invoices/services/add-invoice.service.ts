import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';
import { PUBLIC_ORDER_ID } from '@shared/constants';

@Injectable()
export class AddInvoiceService {
  constructor (
    private fb: FormBuilder,
  ) {}

  public createForm(isAgency: boolean): FormGroup {
    return this.fb.group({
      orderId: [null, [Validators.required, Validators.pattern(PUBLIC_ORDER_ID)]],
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
