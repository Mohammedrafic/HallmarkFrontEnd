import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CustomFormGroup } from '@core/interface';
import { InvoicePaymentData } from '../../interfaces';
import { CheckForm, PaymentForm, PaymentsTableData } from './invoice-add-payment.interface';

@Injectable()
export class InvoiceAddPaymentService {
  constructor(
    private fb: FormBuilder,
  ) {}

  createCheckForm(): CustomFormGroup<CheckForm> {
    return this.fb.group({
      date: [new Date(), Validators.required],
      checkNumber: [null, [Validators.required, Validators.maxLength(20)]],
      checkDate: [new Date(), Validators.required],
      initialAmount: [null, [Validators.required, Validators.maxLength(10)]],
      paymentMode: [null, Validators.required],
      isRefund: [false],
    }) as CustomFormGroup<CheckForm>;
  }

  createPaymentsForm(records: InvoicePaymentData[]): Record<string, CustomFormGroup<PaymentForm>> {
    const formGroups: Record<string, FormGroup> = {};

    records.forEach((record) => {
      formGroups[record.invoiceNumber] = this.fb.group({
        amount: [null, [Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)]],
        balance: [{ value: null, disabled: true }, [Validators.min(1)]],
      });
    });

    return formGroups as Record<string, CustomFormGroup<PaymentForm>>;
  }

  createTableData(
    payments: InvoicePaymentData[],
    forms: Record<string, CustomFormGroup<PaymentForm>>): PaymentsTableData[] {
    return payments.map((record) => {
      return ({
        id: Math.random() * (100 - 1) + 1,
        invoiceNumber: record.invoiceNumber,
        amount: record.amount,
        payment: 0,
        balance: 0,
        group: forms[record.invoiceNumber],
      });
    });  
  } 
}