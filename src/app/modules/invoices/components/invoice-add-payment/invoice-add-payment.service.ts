import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CustomFormGroup } from '@core/interface';
import { InvoicePaymentData, PaymentDto } from '../../interfaces';
import { CheckForm, PaymentForm, PaymentsTableData } from './invoice-add-payment.interface';

@Injectable()
export class InvoiceAddPaymentService {
  constructor(
    private fb: FormBuilder,
  ) {}

  createCheckForm(): CustomFormGroup<CheckForm> {
    return this.fb.group({
      id: [null],
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
      formGroups[record.invoiceNumber] = this.createPaymentGroup();
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

  /**
   * This method is used for merging data from existing check with payment
   * and new invoices that were selected for table. 
   */
  mergeTableData(
    tableData: PaymentsTableData[],
    payments: PaymentDto[],
    paymentsForm: Record<string, CustomFormGroup<PaymentForm>>): PaymentsTableData[] {
    const mergeData: PaymentsTableData[] = [];

    payments.forEach((payment) => {
      const initialAmount = (payment.amountToPay as number) + payment.payment;
      const form = this.createPaymentGroup(initialAmount, payment.amountToPay);
      paymentsForm[payment.formattedInvoiceId as string] = form;
      form.get('amount')?.patchValue(payment.payment);
      
      mergeData.push({
        id: payment.id as number,
        invoiceNumber: payment.formattedInvoiceId as string,
        amount: initialAmount,
        payment: payment.payment,
        balance: (payment.amountToPay as number),
        group: form,
      });

      tableData.filter((data) => !mergeData.find((record) => data.invoiceNumber === record.invoiceNumber))
      .forEach((record) => {
        mergeData.push(record);
      });
    });

    return mergeData;
  }

  private createPaymentGroup(
    initAmount: number | null = null,
    initBalance: number | null = null): CustomFormGroup<PaymentForm> {
    return this.fb.group({
      amount: [initAmount, [Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)]],
      balance: [{ value: initBalance, disabled: true }, [Validators.min(1)]],
    }) as CustomFormGroup<PaymentForm>;
  }
}