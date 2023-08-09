import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CustomFormGroup } from '@core/interface';
import { InvoicePaymentData, PaymentCreationDto, PaymentDto } from '../../interfaces';
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
      initialAmount: [null, [Validators.required, Validators.max(9999999999)]],
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
        id: record.invoiceId,
        invoiceNumber: record.invoiceNumber,
        amount: record.amount,
        payment: 0,
        balance: record.amount,
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

    if (!payments || !payments.length) {
      return tableData;
    }
    
    payments.forEach((payment) => {
      const initialAmount = (payment.amountToPay as number) + payment.payment;
      const form = this.createPaymentGroup(initialAmount, payment.amountToPay);
      paymentsForm[payment.formattedInvoiceId as string] = form;
      
      form.get('amount')?.patchValue(payment.payment);
      form.get('balance')?.patchValue(payment.amountToPay);

      mergeData.push({
        id: payment.id as number,
        invoiceNumber: payment.formattedInvoiceId as string,
        amount: initialAmount,
        payment: payment.payment,
        balance: (payment.amountToPay as number),
        group: form,
      });

      paymentsForm[payment.formattedInvoiceId as string].get('id')?.patchValue(payment.id,
        { emitEvent: false, onlySelf: true });

      tableData.filter((data) => !mergeData.find((record) => data.invoiceNumber === record.invoiceNumber))
      .forEach((record) => {
        mergeData.push(record);
      });
    });

    return mergeData;
  }

  calculateCheckAmount(paymentForms: Record<string, CustomFormGroup<PaymentForm>>, initAmount: number): number {
    const forms = Object.keys(paymentForms).map((key) => paymentForms[key]);

    const totalPayment = forms.reduce((acc, form) => {
      return acc + form.get('amount')?.value;
    }, 0);

    return initAmount - totalPayment;
  }

  calcBalanceCovered(paymentForms: Record<string, CustomFormGroup<PaymentForm>>): boolean {
    return !Object.keys(paymentForms)
    .map((key) => paymentForms[key].get('balance')?.value)
    .some((item) => item > 0);
  }

  findPartialyCoveredIds(paymentForms: Record<string, CustomFormGroup<PaymentForm>>): string[] {
    return Object.keys(paymentForms)
    .filter((key) => paymentForms[key].get('balance')?.value > 0);
  }

  checkPaymentsFormTouch(paymentForms: Record<string, CustomFormGroup<PaymentForm>>): boolean {
    return Object.keys(paymentForms).some((key) => paymentForms[key].touched);
  }

  createInitialInvoicesData(data: PaymentCreationDto, initialInvoices: InvoicePaymentData[]): InvoicePaymentData[] {
    const invoicesData: InvoicePaymentData[] = initialInvoices.filter((invoice) => {
      return !data.payments.find((payment) => payment.formattedInvoiceId === invoice.invoiceNumber);
    });

    data.payments.forEach((payment) => {
      invoicesData.push({
        invoiceId: payment.invoiceId,
        invoiceNumber: payment.formattedInvoiceId as string,
        amount: payment.amountToPay as number,
        checkId: data.check.id,
        id: payment.id,
        ...payment.agencySuffix ? { agencySuffix: payment.agencySuffix } : {},
      });
    });

    return invoicesData;
  }

  private createPaymentGroup(
    initAmount: number | null = null,
    initBalance: number | null = null): CustomFormGroup<PaymentForm> {
    return this.fb.group({
      id: [{ value: null, disabled: true }],
      amount: [initAmount, [Validators.required, Validators.min(-9999999999), Validators.max(9999999999)]],
      balance: [{ value: initBalance, disabled: true }, [ Validators.min(0)]],
    }) as CustomFormGroup<PaymentForm>;
  }
}
