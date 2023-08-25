import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { CustomFormGroup } from '@core/interface';
import { PaymentMode } from 'src/app/modules/invoices/enums';

import { InvoicePaymentData, PaymentCreationDto, PaymentDto } from '../../interfaces';
import { PaymentForm, PaymentsTableData } from './invoice-add-payment.interface';
import { InvoiceAddPaymentService } from './invoice-add-payment.service';

const nullBalancePaymentForm: CustomFormGroup<PaymentForm> = new FormGroup({
  id: new FormControl(1),
  amount: new FormControl(100),
  balance: new FormControl(0),
}) as CustomFormGroup<PaymentForm>;

const positiveBalancePaymentForm = new FormGroup({
  id: new FormControl(2),
  amount: new FormControl(200),
  balance: new FormControl(50),
}) as CustomFormGroup<PaymentForm>;

const negativeBalancePaymentForm = new FormGroup({
  id: new FormControl(3),
  amount: new FormControl(300),
  balance: new FormControl(-25),
}) as CustomFormGroup<PaymentForm>;

describe('InvoiceAddPaymentService', () => {
  let service: InvoiceAddPaymentService;
  let tableData: PaymentsTableData[];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [FormBuilder, InvoiceAddPaymentService],
    });

    service = TestBed.inject(InvoiceAddPaymentService);
    tableData = [
      {
        id: 1,
        invoiceNumber: '1',
        amount: 1,
        payment: 1,
        balance: 1,
        group: {} as FormGroup,
      },
      {
        id: 3,
        invoiceNumber: '3',
        amount: 3,
        payment: 3,
        balance: 3,
        group: {} as FormGroup,
      },
    ];
  });

  it('should create InvoiceAddPaymentService', () => {
    expect(service).toBeTruthy();
  });

  it('mergeTableData should return table data without changes', () => {
    expect(service.mergeTableData(tableData, [], {})).toEqual([...tableData]);
  });

  it('mergeTableData should return filtered and merged table data', () => {
    const formMock = { get: () => null } as unknown as FormGroup;
    spyOn<any>(service, 'createPaymentGroup').and.returnValue(formMock);
    const payment1: PaymentDto = {
      id: 1,
      invoiceId: 1,
      checkId: 1,
      agencySuffix: 1,
      paymentDate: '2023-03-12T07:00:00+00:00',
      payment: 1,
      organizationId: 1,
      amountToPay: 1,
      formattedInvoiceId: '1',
    };
    const payment2: PaymentDto = {
      id: 2,
      invoiceId: 2,
      checkId: 2,
      agencySuffix: 2,
      paymentDate: '2023-03-12T07:00:00+00:00',
      payment: 2,
      organizationId: 2,
      amountToPay: 2,
      formattedInvoiceId: '2',
    };
    const expectedResult: PaymentsTableData[] = [
      {
        id: payment1.id as number,
        invoiceNumber: payment1.formattedInvoiceId as string,
        amount: (payment1.amountToPay as number) + payment1.payment,
        payment: payment1.payment,
        balance: payment1.amountToPay as number,
        group: formMock,
      },
      {
        id: payment2.id as number,
        invoiceNumber: payment2.formattedInvoiceId as string,
        amount: (payment2.amountToPay as number) + payment2.payment,
        payment: payment2.payment,
        balance: payment2.amountToPay as number,
        group: formMock,
      },
      {
        id: 3,
        invoiceNumber: '3',
        amount: 3,
        payment: 3,
        balance: 3,
        group: {} as FormGroup,
      },
    ];

    expect(service.mergeTableData(tableData, [payment1, payment2], {})).toEqual(expectedResult);
  });

  it('calculateCheckAmount should return correct check amount', () => {
    const invoicePaymentData: InvoicePaymentData[] = [
      {
        invoiceId: 1,
        invoiceNumber: '1',
        amount: 33,
        agencySuffix: 1,
        checkId: 1,
        id: 1,
      },
      {
        invoiceId: 2,
        invoiceNumber: '2',
        amount: 17,
        agencySuffix: 2,
        checkId: 2,
        id: 2,
      }
    ];
    const paymentForm = service.createPaymentsForm(invoicePaymentData);

    paymentForm[invoicePaymentData[0].invoiceNumber].get('amount')?.setValue(invoicePaymentData[0].amount);
    paymentForm[invoicePaymentData[1].invoiceNumber].get('amount')?.setValue(invoicePaymentData[1].amount);

    expect(service.calculateCheckAmount(paymentForm, 51)).toEqual(1);
  });

  it('calcBalanceCovered should return true if all balances are <= 0', () => {
    const paymentForms = {
      form1: nullBalancePaymentForm,
      form2: negativeBalancePaymentForm,
    };

    expect(service.calcBalanceCovered(paymentForms)).toBeTrue();
  });

  it('calcBalanceCovered should return false if any balance is > 0', () => {
    const paymentForms = {
      form1: nullBalancePaymentForm,
      form2: positiveBalancePaymentForm,
    };

    expect(service.calcBalanceCovered(paymentForms)).toBeFalse();
  });

  it('findPartialyCoveredIds should return IDs of forms with positive balance', () => {
    const paymentForms: Record<string, CustomFormGroup<PaymentForm>> = {
      form1: nullBalancePaymentForm,
      form2: positiveBalancePaymentForm,
      form3: negativeBalancePaymentForm,
    };

    expect(service.findPartialyCoveredIds(paymentForms)).toEqual(['form2']);
  });

  it('findPartialyCoveredIds should return an empty array if no forms have positive balance', () => {
    const paymentForms: Record<string, CustomFormGroup<PaymentForm>> = {
      form1: nullBalancePaymentForm,
      form2: negativeBalancePaymentForm,
    };

    expect(service.findPartialyCoveredIds(paymentForms)).toEqual([]);
  });

  it('findPartialyCoveredIds should return an empty array if paymentForms is empty', () => {
    const paymentForms: Record<string, CustomFormGroup<PaymentForm>> = {};

    expect(service.findPartialyCoveredIds(paymentForms)).toEqual([]);
  });

  it('checkPaymentsFormTouch should return true if at least one form is touched', () => {
    const paymentForms: Record<string, CustomFormGroup<PaymentForm>> = {
      form1: nullBalancePaymentForm,
      form2: positiveBalancePaymentForm,
    };

    nullBalancePaymentForm.markAsTouched();

    expect(service.checkPaymentsFormTouch(paymentForms)).toBeTrue();
  });

  it('checkPaymentsFormTouch should return false if no forms are touched', () => {
    const paymentForms: Record<string, CustomFormGroup<PaymentForm>> = {
      form1: negativeBalancePaymentForm,
      form2: positiveBalancePaymentForm,
    };

    expect(service.checkPaymentsFormTouch(paymentForms)).toBeFalse();
  });

  it('checkPaymentsFormTouch should return false if paymentForms is empty', () => {
    const paymentForms: Record<string, CustomFormGroup<PaymentForm>> = {};

    expect(service.checkPaymentsFormTouch(paymentForms)).toBeFalse();
  });

  it('createInitialInvoicesData should return invoices data with empty payments array', () => {
    const data: PaymentCreationDto = {
      check: {
        checkNumber: '123',
        initialAmount: 500,
        checkDate: '2023-08-01',
        paymentMode: PaymentMode.Check,
        isRefund: false,
      },
      payments: [],
    };

    const initialInvoices: InvoicePaymentData[] = [
      { invoiceId: 1, invoiceNumber: 'INV-001', amount: 100 },
      { invoiceId: 2, invoiceNumber: 'INV-002', amount: 200 },
    ];

    expect(service.createInitialInvoicesData(data, initialInvoices)).toEqual(initialInvoices);
  });

  it('createInitialInvoicesData should return empty invoices data if both data and initialInvoices are empty', () => {
    const data: PaymentCreationDto = {
      check: {
        checkNumber: '123',
        initialAmount: 500,
        checkDate: '2023-08-01',
        paymentMode: PaymentMode.Check,
        isRefund: false,
      },
      payments: [],
    };

    const initialInvoices: InvoicePaymentData[] = [];

    expect(service.createInitialInvoicesData(data, initialInvoices)).toEqual([]);
  });

  it('createInitialInvoicesData should create initial invoices data correctly', () => {
    const data: PaymentCreationDto = {
      check: {
        checkNumber: '12345',
        initialAmount: 500,
        checkDate: '2023-08-22',
        paymentMode: PaymentMode.Check,
        isRefund: false,
        id: 4,
      },
      payments: [
        {
          invoiceId: 1,
          paymentDate: '2023-08-22',
          payment: 200,
          organizationId: 1,
          amountToPay: 200,
          formattedInvoiceId: 'INV-001',
          id: 3,
        },
      ],
    };

    const initialInvoices: InvoicePaymentData[] = [
      {
        invoiceId: 1,
        invoiceNumber: 'INV-001',
        amount: 100,
      },
    ];


    expect(service.createInitialInvoicesData(data, initialInvoices)).toEqual([
      {
        invoiceId: 1,
        invoiceNumber: 'INV-001',
        amount: 200,
        checkId: 4,
        id: 3,
      },
    ]);
  });

  it('createInitialInvoicesData should not duplicate invoices when payments have same invoice numbers', () => {
    const data: PaymentCreationDto = {
      check: {
        checkNumber: '12345',
        initialAmount: 500,
        checkDate: '2023-08-22',
        paymentMode: PaymentMode.Check,
        isRefund: false,
      },
      payments: [
        {
          invoiceId: 1,
          paymentDate: '2023-08-22',
          payment: 200,
          organizationId: 1,
          amountToPay: 200,
          formattedInvoiceId: 'INV-001',
        },
      ],
    };

    const initialInvoices: InvoicePaymentData[] = [
      {
        invoiceId: 1,
        invoiceNumber: 'INV-001',
        amount: 100,
      },
    ];

    const result = service.createInitialInvoicesData(data, initialInvoices);

    // Ensure that no duplicate invoices are present
    const invoiceIds = result.map(invoice => invoice.invoiceId);
    const uniqueInvoiceIds = Array.from(new Set(invoiceIds));
    expect(invoiceIds.length).toBe(uniqueInvoiceIds.length);
  });});
