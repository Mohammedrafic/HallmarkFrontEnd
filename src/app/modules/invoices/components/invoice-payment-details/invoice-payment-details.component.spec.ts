import { GridApi } from '@ag-grid-community/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxsModule, Store } from '@ngxs/store';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { EMPTY, of } from 'rxjs';

import { InvoiceState } from 'src/app/modules/invoices/enums';
import { InvoiceDetail, InvoicePayment } from 'src/app/modules/invoices/interfaces';
import { InvoicesApiService } from 'src/app/modules/invoices/services';
import { InvoicesState } from 'src/app/modules/invoices/store/state/invoices.state';
import { UserState } from 'src/app/store/user.state';

import { InvoicePaymentDetailsComponent } from './invoice-payment-details.component';

const selectedOrganizationId = 1;
const formattedInvoiceNumber = '1';
const invoiceId = 2;
const agencySuffix = 3;
const invoiceState = InvoiceState.PendingPayment;
const calculatedTotal = 10;

const mockInvoiceDetail = {
  meta: { formattedInvoiceNumber, invoiceId, agencySuffix, invoiceState },
  totals: { calculatedTotal },
} as InvoiceDetail;

const mockPermissions = { test: true };

const storeSelectMockFn = (selector: any) => {
  switch (selector) {
    case InvoicesState.invoiceDetails:
      return of(mockInvoiceDetail);
    case UserState.userPermission:
      return of(mockPermissions);
    default:
      return EMPTY;
  }
}

describe('InvoicePaymentDetailsComponent', () => {
  let component: InvoicePaymentDetailsComponent;
  let fixture: ComponentFixture<InvoicePaymentDetailsComponent>;

  const storeSpy: jasmine.SpyObj<Store> = jasmine
    .createSpyObj('Store', ['snapshot', 'select']);
  const invoicesApiServiceSpy: jasmine.SpyObj<InvoicesApiService> = jasmine
    .createSpyObj('InvoicesApiService', ['getInvoicesPayments']);
  const gridApiSpy: jasmine.SpyObj<GridApi> = jasmine
    .createSpyObj('GridApi', ['showLoadingOverlay', 'setDomLayout', 'setRowData']);

  storeSpy.snapshot.and.returnValue({ invoices: { isAgencyArea: false, selectedOrganizationId } });
  storeSpy.select.and.callFake(storeSelectMockFn);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DialogModule,
        NgxsModule.forRoot([], { developmentMode: true }),
      ],
      declarations: [
        InvoicePaymentDetailsComponent,
      ],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: InvoicesApiService, useValue: invoicesApiServiceSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicePaymentDetailsComponent);
    component = fixture.componentInstance;
    component['gridApi'] = gridApiSpy;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('addNewPayment method should emit event', () => {
    const addPaymentSpy = spyOn(component.addPayment, 'emit');

    component.addNewPayment();

    expect(addPaymentSpy).toHaveBeenCalled();
  });

  it('editPayment method should emit event with correct id', () => {
    const editPaymentSpy = spyOn(component.editPaymentCheck, 'emit');
    const id = 'id';

    component.editPayment(id);

    expect(editPaymentSpy).toHaveBeenCalledWith(id);
  });

  it('watchForInvoiceDetails method should set invoiceData and actionsAllowed', () => {
    invoicesApiServiceSpy.getInvoicesPayments.and.returnValue(EMPTY);
    component.actionsAllowed = false;

    component.ngOnInit();

    expect(component.actionsAllowed).toBeTrue();
    expect(component.invoiceData).toEqual({
      invoiceNumber: formattedInvoiceNumber,
      amount: calculatedTotal,
      agencySuffix,
      invoiceId,
    })
  });

  it('watchForInvoiceDetails method should call setRowData', () => {
    const invoicePayment = { id: 'id' } as unknown as InvoicePayment;
    invoicesApiServiceSpy.getInvoicesPayments.and.returnValue(of([invoicePayment]));
    gridApiSpy.setRowData.calls.reset();

    component.ngOnInit();

    expect(gridApiSpy.setRowData).toHaveBeenCalledOnceWith([invoicePayment]);
  });

  it('watchForInvoiceDetails method should generate correct dto for organization area', () => {
    invoicesApiServiceSpy.getInvoicesPayments.and.returnValue(EMPTY);
    invoicesApiServiceSpy.getInvoicesPayments.calls.reset();

    component.ngOnInit();

    expect(invoicesApiServiceSpy.getInvoicesPayments).toHaveBeenCalledOnceWith({
      InvoiceId: invoiceId,
      OrganizationId: selectedOrganizationId,
    });
  });

  it('watchForInvoiceDetails method should generate correct dto for agency area', () => {
    component.isAgency = true;
    invoicesApiServiceSpy.getInvoicesPayments.and.returnValue(EMPTY);
    invoicesApiServiceSpy.getInvoicesPayments.calls.reset();

    component.ngOnInit();

    expect(invoicesApiServiceSpy.getInvoicesPayments).toHaveBeenCalledOnceWith({
      InvoiceId: invoiceId,
      OrganizationId: selectedOrganizationId,
      AgencySuffix: agencySuffix,
    });
  });

  it('getuserPermission method should set userPermission', () => {
    invoicesApiServiceSpy.getInvoicesPayments.and.returnValue(EMPTY);
    component.userPermission = {};

    component.ngOnInit();

    expect(component.userPermission).toEqual(mockPermissions);
  });
});
