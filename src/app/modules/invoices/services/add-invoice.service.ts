import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';

@Injectable()
export class AddInvoiceService {
  constructor (
    private fb: FormBuilder,
  ) {}

  public createManInvoiceForm(): FormGroup {
    return this.fb.group({
      orderId: [null, Validators.required],
      candidateName: [null, Validators.required],
      agency: [null, Validators.required],
      workLocationId: [null, Validators.required],
      workDepartmentId: [null, Validators.required],
      serviceDate: ['', Validators.required],
      value: [null, [Validators.required, Validators.min(1), Validators.max(Number.MAX_SAFE_INTEGER)]],
      reasonId: [null, Validators.required],
      linkInvoiceId: [null],
      vendorFee: [null, Validators.required],
      comment: [null],
    });
  }
}