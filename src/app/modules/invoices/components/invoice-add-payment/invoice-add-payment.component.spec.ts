import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CustomFormGroup } from '@core/interface';

import { NgxsModule, Store } from '@ngxs/store';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { EMPTY, of } from 'rxjs';

import { MessageTypes } from '@shared/enums/message-types';
import { ConfirmService } from '@shared/services/confirm.service';
import { PaymentsAdapter } from 'src/app/modules/invoices/helpers/payments.adapter';
import { PaymentCreationDto } from 'src/app/modules/invoices/interfaces';
import { InvoicesApiService } from 'src/app/modules/invoices/services';
import { Invoices } from 'src/app/modules/invoices/store/actions/invoices.actions';
import { ShowToast } from 'src/app/store/app.actions';

import { InvoiceAddPaymentComponent } from './invoice-add-payment.component';
import { InvoiceAddPaymentService } from './invoice-add-payment.service';
import { PaymentMessages } from './invoice-add-payment.constant';
import { PaymentForm, PaymentsTableData } from './invoice-add-payment.interface';

describe('InvoiceAddPaymentComponent', () => {
  let component: InvoiceAddPaymentComponent;
  let fixture: ComponentFixture<InvoiceAddPaymentComponent>;

  const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'snapshot', 'select']);
  const addInvoiceAddPaymentService = jasmine.createSpyObj('InvoiceAddPaymentService',
    ['createCheckForm', 'calcBalanceCovered', 'findPartialyCoveredIds',
      'createTableData', 'mergeTableData', 'createInitialInvoicesData', 'calculateCheckAmount']);
  const confirmServiceSpy = jasmine.createSpyObj('ConfirmService', ['confirm']);
  const invoicesApiServiceSpy = jasmine.createSpyObj('InvoicesApiService', ['deletePayment', 'getCheckData']);
  const formSpy = jasmine.createSpyObj('FormGroup', ['get', 'patchValue']);

  storeSpy.snapshot.and.returnValue({ invoices: {} });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DialogModule,
        NgxsModule.forRoot([], {developmentMode: true}),
      ],
      declarations: [
        InvoiceAddPaymentComponent,
      ],
      providers: [
        {provide: Store, useValue: storeSpy},
        {provide: InvoiceAddPaymentService, useValue: addInvoiceAddPaymentService},
        {provide: ConfirmService, useValue: confirmServiceSpy},
        {provide: InvoicesApiService, useValue: invoicesApiServiceSpy},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceAddPaymentComponent);
    component = fixture.componentInstance;
    component.checkForm = formSpy;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('savePayment method should not save a payment if checkForm is invalid', () => {
    addInvoiceAddPaymentService.calcBalanceCovered.calls.reset();
    formSpy.valid = false;

    component.savePayment();

    expect(addInvoiceAddPaymentService.calcBalanceCovered).not.toHaveBeenCalled();
  });

  it('savePayment method should not save a payment if paymentsForm is invalid', () => {
    addInvoiceAddPaymentService.calcBalanceCovered.calls.reset();
    formSpy.valid = true;
    component.paymentsForm = { test: { valid: false } as CustomFormGroup<PaymentForm> };

    component.savePayment();

    expect(addInvoiceAddPaymentService.calcBalanceCovered).not.toHaveBeenCalled();
  });

  it('savePayment method should save a payment if calculatedLeftAmount is 0 and balance is covered', () => {
    const dto = { check: {}, payments: [] } as unknown as PaymentCreationDto;
    const paymentsAdapterSpy = spyOn(PaymentsAdapter, 'adaptPaymentForPost');
    paymentsAdapterSpy.and.returnValue(dto);
    addInvoiceAddPaymentService.calcBalanceCovered.calls.reset();
    addInvoiceAddPaymentService.calcBalanceCovered.and.returnValue(true);
    storeSpy.dispatch.calls.reset();
    storeSpy.dispatch.and.returnValue(EMPTY);
    formSpy.valid = true;
    component.calculatedLeftAmount = 0;
    component.paymentsForm = { test: { valid: true } as CustomFormGroup<PaymentForm> };

    component.savePayment();

    expect(addInvoiceAddPaymentService.calcBalanceCovered).toHaveBeenCalledOnceWith(component.paymentsForm);
    expect(paymentsAdapterSpy).toHaveBeenCalledOnceWith(
      component.checkForm.value,
      component.paymentsForm,
      component['organizationId'],
      component.invoicesToPay
    );
    expect(storeSpy.dispatch).toHaveBeenCalledOnceWith(new Invoices.SavePayment(dto));
  });

  it('savePayment method should show confirm dialog with a lowerAmount message', () => {
    addInvoiceAddPaymentService.calcBalanceCovered.calls.reset();
    addInvoiceAddPaymentService.calcBalanceCovered.and.returnValue(true);
    confirmServiceSpy.confirm.calls.reset();
    confirmServiceSpy.confirm.and.returnValue(EMPTY);
    formSpy.valid = true;
    component.calculatedLeftAmount = 1;
    component.paymentsForm = { test: { valid: true } as CustomFormGroup<PaymentForm> };

    component.savePayment();

    expect(confirmServiceSpy.confirm).toHaveBeenCalledOnceWith(PaymentMessages.lowerAmount, {
      title: 'Check Payment Amount',
      okButtonLabel: 'Yes',
      okButtonClass: 'delete-button',
    });
  });

  it('savePayment method should show confirm dialog with a partialyCovered message', () => {
    const ids = ['1', '2'];
    addInvoiceAddPaymentService.calcBalanceCovered.calls.reset();
    addInvoiceAddPaymentService.calcBalanceCovered.and.returnValue(false);
    addInvoiceAddPaymentService.findPartialyCoveredIds.calls.reset();
    addInvoiceAddPaymentService.findPartialyCoveredIds.and.returnValue(ids);
    confirmServiceSpy.confirm.calls.reset();
    confirmServiceSpy.confirm.and.returnValue(EMPTY);
    formSpy.valid = true;
    component.calculatedLeftAmount = 1;
    component.paymentsForm = { test: { valid: true } as CustomFormGroup<PaymentForm> };

    component.savePayment();

    expect(addInvoiceAddPaymentService.findPartialyCoveredIds).toHaveBeenCalledOnceWith(component.paymentsForm);
    expect(confirmServiceSpy.confirm).toHaveBeenCalledOnceWith(
      PaymentMessages.partialyCovered(ids),
      {
        title: 'Check Payment Amount',
        okButtonLabel: 'Yes',
        okButtonClass: 'delete-button',
      });
  });

  it('savePayment method should show error toast if calculatedLeftAmount is negative', () => {
    addInvoiceAddPaymentService.calcBalanceCovered.and.returnValue(true);
    storeSpy.dispatch.calls.reset();
    formSpy.valid = true;
    component.calculatedLeftAmount = -1;
    component.paymentsForm = { test: { valid: true } as CustomFormGroup<PaymentForm> };

    component.savePayment();

    expect(storeSpy.dispatch).toHaveBeenCalledOnceWith(new ShowToast(MessageTypes.Error, PaymentMessages.negativeAmount));
  });

  it('savePayment method should show confirm dialog with a partialyNullAmount message', () => {
    const ids = ['1', '2'];
    addInvoiceAddPaymentService.calcBalanceCovered.calls.reset();
    addInvoiceAddPaymentService.calcBalanceCovered.and.returnValue(false);
    addInvoiceAddPaymentService.findPartialyCoveredIds.calls.reset();
    addInvoiceAddPaymentService.findPartialyCoveredIds.and.returnValue(ids);
    confirmServiceSpy.confirm.calls.reset();
    confirmServiceSpy.confirm.and.returnValue(EMPTY);
    formSpy.valid = true;
    component.calculatedLeftAmount = 0;
    component.paymentsForm = { test: { valid: true } as CustomFormGroup<PaymentForm> };

    component.savePayment();

    expect(addInvoiceAddPaymentService.findPartialyCoveredIds).toHaveBeenCalledOnceWith(component.paymentsForm);
    expect(confirmServiceSpy.confirm).toHaveBeenCalledOnceWith(
      PaymentMessages.partialyNullAmount(ids),
      {
        title: 'Check Payment Amount',
        okButtonLabel: 'Yes',
        okButtonClass: 'delete-button',
      });
  });

  it('deletePayment method should show confirm dialog and delete payment', fakeAsync(() => {
    const invoiceId = 'invoiceId';
    const invoiceDbid = 1;
    confirmServiceSpy.confirm.calls.reset();
    confirmServiceSpy.confirm.and.returnValue(of(true));
    invoicesApiServiceSpy.deletePayment.calls.reset();
    invoicesApiServiceSpy.deletePayment.and.returnValue(EMPTY);
    component.paymentsForm = { [invoiceId]: { valid: true } as CustomFormGroup<PaymentForm> };
    component.tableData = [{ invoiceNumber: invoiceId } as PaymentsTableData];

    component.deletePayment(invoiceId, invoiceDbid);
    tick();

    expect(confirmServiceSpy.confirm).toHaveBeenCalledOnceWith(PaymentMessages.deleteInvoice, {
      title: 'Check Payment Amount',
      okButtonLabel: 'Yes',
      okButtonClass: 'delete-button',
    });
    expect(invoicesApiServiceSpy.deletePayment).toHaveBeenCalledOnceWith(invoiceDbid);
    expect(component.paymentsForm).toEqual({});
    expect(component.tableData).toEqual([]);
  }));

  it('calcCheckAmount method should set calculatedLeftAmount', () => {
    const calculatedLeftAmount = 3;
    component.calculatedLeftAmount = 0;
    addInvoiceAddPaymentService.calculateCheckAmount.and.returnValue(calculatedLeftAmount);

    component.calcCheckAmount();

    expect(component.calculatedLeftAmount).toBe(calculatedLeftAmount);
  });
});
