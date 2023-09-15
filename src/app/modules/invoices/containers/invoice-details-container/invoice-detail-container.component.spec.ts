import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxsModule, Store } from '@ngxs/store';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { of } from 'rxjs';

import { DialogAction } from '@core/enums';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportPayload } from '@shared/models/export.model';
import { ResizeObserverModel } from '@shared/services/resize-observer.service';
import { ChipsCssClass } from '@shared/pipes/chip-css-class/chips-css-class.pipe';
import { BreakpointObserverService } from '@core/services';
import { NewStatusDependsOnAction } from 'src/app/modules/invoices/constants/invoice-detail.constant';
import { InvoiceState, PaymentDialogTitle } from 'src/app/modules/invoices/enums';
import { ExportOption, InvoiceDetail, PrintInvoiceData } from 'src/app/modules/invoices/interfaces';
import { InvoicePrintingService } from 'src/app/modules/invoices/services';
import { InvoicesContainerService } from 'src/app/modules/invoices/services/invoices-container/invoices-container.service';
import { Invoices } from 'src/app/modules/invoices/store/actions/invoices.actions';

import { InvoiceDetailContainerComponent } from './invoice-detail-container.component';

@Component({
  selector: 'app-navigation-panel',
  template: '<ng-content></ng-content>'
})
class FakeNavigationPanelComponent {
  @Input() public prevLabel: string = 'Previous';
  @Input() public nextLabel: string = 'Next';
  @Input() public prevDisabled: boolean = false;
  @Input() public nextDisabled: boolean = false;
  @Output() public readonly prevClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly nextClick: EventEmitter<void> = new EventEmitter<void>();
}

const resizeObserverMock: ResizeObserverModel = {
  detach: () => {},
  resize$: of([]),
}

describe('InvoiceDetailContainerComponent', () => {
  let component: InvoiceDetailContainerComponent;
  let fixture: ComponentFixture<InvoiceDetailContainerComponent>;

  const storeSpy: jasmine.SpyObj<Store> = jasmine
    .createSpyObj('Store', ['dispatch', 'select']);
  const invoicesContainerServiceSpy: jasmine.SpyObj<InvoicesContainerService> = jasmine
    .createSpyObj('InvoicesContainerService', ['isAgency', 'getDetailColDef', 'getDetailSummaryColDef']);
  const dialogComponentSpy: jasmine.SpyObj<DialogComponent> = jasmine
    .createSpyObj('DialogComponent', ['hide', 'show']);
  const invoicePrintingServiceSpy: jasmine.SpyObj<InvoicePrintingService> = jasmine
    .createSpyObj('InvoicePrintingService', ['printAgencyInvoice', 'printInvoice']);
  const chipsCssClassSpy: jasmine.SpyObj<ChipsCssClass> = jasmine
    .createSpyObj('ChipsCssClass', ['transform']);
  const breakpointObserverServiceSpy: jasmine.SpyObj<BreakpointObserverService> = jasmine
    .createSpyObj('BreakpointObserverService', ['getBreakpointMediaRanges']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DialogModule,
        NgxsModule.forRoot([], { developmentMode: true }),
      ],
      declarations: [
        InvoiceDetailContainerComponent,
        FakeNavigationPanelComponent,
      ],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: InvoicesContainerService, useValue: invoicesContainerServiceSpy },
        { provide: InvoicePrintingService, useValue: invoicePrintingServiceSpy },
        { provide: ChipsCssClass, useValue: chipsCssClassSpy },
        { provide: BreakpointObserverService, useValue: breakpointObserverServiceSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailContainerComponent);
    component = fixture.componentInstance;
    component.sideDialog = dialogComponentSpy;
    component['resizeObserver'] = resizeObserverMock;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('closeInvoiceDetails method should dispatch a close action and hide the side dialog', () => {
    storeSpy.dispatch.and.returnValue(of(true));
    storeSpy.dispatch.calls.reset();
    dialogComponentSpy.hide.calls.reset();

    component.closeInvoiceDetails();

    expect(storeSpy.dispatch).toHaveBeenCalledOnceWith(new Invoices.ToggleInvoiceDialog(DialogAction.Close));
    expect(dialogComponentSpy.hide).toHaveBeenCalledTimes(1);
  });

  it('export method should dispatch an action with correct parameters', () => {
    const fileTypeId = ExportedFileType.excel;
    const event = { item: { properties: { id: fileTypeId } as unknown as ExportOption } };
    storeSpy.dispatch.calls.reset();

    component.export(event);

    expect(storeSpy.dispatch).toHaveBeenCalledOnceWith(new Invoices.DetailExport(new ExportPayload(fileTypeId)));
  });

  it('printInvoice method should dispatch an action and print invoice for Organization', () => {
    const invoiceId = 1;
    const isAgency = false;
    const dto = { invoiceIds: [invoiceId] };
    const printInvoiceData = [{ meta: { invoiceDate: '' } } as PrintInvoiceData];
    component.invoiceDetail = { meta: { invoiceId } } as InvoiceDetail;
    component.isAgency = isAgency;
    storeSpy.dispatch.and.returnValue(of({ invoices: { printData: printInvoiceData } }));
    storeSpy.dispatch.calls.reset();
    invoicePrintingServiceSpy.printInvoice.calls.reset();

    component.printInvoice();

    expect(storeSpy.dispatch).toHaveBeenCalledOnceWith(new Invoices.GetPrintData(dto, isAgency));
    expect(invoicePrintingServiceSpy.printInvoice).toHaveBeenCalledOnceWith(printInvoiceData);
  });

  it('printInvoice method should dispatch an action and print invoice for Agency', () => {
    const invoiceId = 1;
    const organizationId = 2;
    const isAgency = true;
    const dto = { invoiceIds: [invoiceId], organizationIds: [organizationId] };
    const printInvoiceData = [{ meta: { invoiceDate: '' } } as PrintInvoiceData];
    component.invoiceDetail = { meta: { invoiceId, organizationIds: [organizationId] } } as InvoiceDetail;
    component.isAgency = isAgency;
    storeSpy.dispatch.and.returnValue(of({ invoices: { printData: printInvoiceData } }));
    storeSpy.dispatch.calls.reset();
    invoicePrintingServiceSpy.printAgencyInvoice.calls.reset();

    component.printInvoice();

    expect(storeSpy.dispatch).toHaveBeenCalledOnceWith(new Invoices.GetPrintData(dto, isAgency));
    expect(invoicePrintingServiceSpy.printAgencyInvoice).toHaveBeenCalledOnceWith(printInvoiceData);
  });

  it('changeInvoiceStatus method should call openAddPayment method when invoiceState equals PendingPayment', () => {
    const openAddPaymentSpy = spyOn(component, 'openAddPayment');
    component.invoiceDetail = { meta: { invoiceState: InvoiceState.PendingPayment } } as InvoiceDetail;

    component.changeInvoiceStatus();

    expect(openAddPaymentSpy).toHaveBeenCalledTimes(1);
  });

  it('changeInvoiceStatus method should call openAddPayment method when it is an Agency', () => {
    const openAddPaymentSpy = spyOn(component, 'openAddPayment');
    component.invoiceDetail = { meta: { invoiceState: InvoiceState.SubmittedPendingApproval } } as InvoiceDetail;
    component.isAgency = true

    component.changeInvoiceStatus();

    expect(openAddPaymentSpy).toHaveBeenCalledTimes(1);
  });

  it('changeInvoiceStatus method should emit updateTable event with correct parameter for Agency', () => {
    const updateTableSpy = spyOn(component.updateTable, 'emit');
    const invoiceId = 1;
    const organizationId = 2;
    component.invoiceDetail = {
      meta: {
        invoiceState: InvoiceState.Paid,
        organizationIds: [organizationId],
        invoiceId,
      }
    } as InvoiceDetail;
    component.isAgency = true

    component.changeInvoiceStatus();

    expect(updateTableSpy).toHaveBeenCalledOnceWith({
      invoiceId,
      status: NewStatusDependsOnAction.get(component.actionBtnText) as InvoiceState,
      organizationId,
    });
  });

  it('changeInvoiceStatus method should emit updateTable event with correct parameter for Organization', () => {
    const updateTableSpy = spyOn(component.updateTable, 'emit');
    const invoiceId = 1;
    component.invoiceDetail = {
      meta: {
        invoiceState: InvoiceState.Paid,
        invoiceId,
      }
    } as InvoiceDetail;
    component.isAgency = false

    component.changeInvoiceStatus();

    expect(updateTableSpy).toHaveBeenCalledOnceWith({
      invoiceId,
      status: NewStatusDependsOnAction.get(component.actionBtnText) as InvoiceState,
    });
  });

  it('onNextPreviousOrder method should emit nextPreviousOrderEvent event', () => {
    const nextPreviousOrderEventSpy = spyOn(component.nextPreviousOrderEvent, 'emit');

    component.onNextPreviousOrder(true);

    expect(nextPreviousOrderEventSpy).toHaveBeenCalledOnceWith(true);
  });

  it('openPaymentDetails method should update invoiceDetailsConfig', () => {
    component.invoiceDetailsConfig.paymentDetailsOpen = false;

    component.openPaymentDetails();

    expect(component.invoiceDetailsConfig.paymentDetailsOpen).toBeTrue();
  });

  it('closePaymentDetails method should update invoiceDetailsConfig', () => {
    component.invoiceDetailsConfig.paymentDetailsOpen = true;

    component.closePaymentDetails();

    expect(component.invoiceDetailsConfig.paymentDetailsOpen).toBeFalse();
  });

  it('openAddPayment method should update invoiceDetailsConfig and create PaymentRecords', () => {
    const invoiceId = 1;
    const formattedInvoiceNumber = '2';
    const amountToPay = 3;
    const agencySuffix = 4;
    component.invoiceDetail = {
      meta: { agencySuffix, formattedInvoiceNumber, invoiceId },
      totals: { amountToPay },
    } as InvoiceDetail;
    component.invoiceDetailsConfig.addPaymentOpen = false;
    component.paymentDialogTitle = PaymentDialogTitle.Edit;
    component.paymentRecords = [];

    component.openAddPayment();

    expect(component.invoiceDetailsConfig.addPaymentOpen).toBeTrue();
    expect(component.paymentDialogTitle).toEqual(PaymentDialogTitle.Add);
    expect(component.paymentRecords).toEqual([{
      invoiceId,
      invoiceNumber: formattedInvoiceNumber,
      amount: amountToPay,
      agencySuffix: agencySuffix,
    }]);
  });

  it('openEditPayment method should update invoiceDetailsConfig and create PaymentRecords', () => {
    const id = 'id';
    const invoiceId = 1;
    const formattedInvoiceNumber = '2';
    const amountToPay = 3;
    const agencySuffix = 4;
    component.invoiceDetail = {
      meta: { agencySuffix, formattedInvoiceNumber, invoiceId },
      totals: { amountToPay },
    } as InvoiceDetail;
    component.invoiceDetailsConfig.addPaymentOpen = false;
    component.paymentDialogTitle = PaymentDialogTitle.Add;
    component.paymentRecords = [];

    component.openEditPayment(id);

    expect(component.invoiceDetailsConfig.addPaymentOpen).toBeTrue();
    expect(component.paymentDialogTitle).toEqual(PaymentDialogTitle.Edit);
    expect(component.editCheckNumber).toBe(id);
    expect(component.paymentRecords).toEqual([{
      invoiceId,
      invoiceNumber: formattedInvoiceNumber,
      amount: amountToPay,
      agencySuffix: agencySuffix,
    }]);
  });

  it('closeAddPayment method should update invoiceDetailsConfig and reset properties', () => {
    component.invoiceDetailsConfig.addPaymentOpen = true;
    component.editCheckNumber = '1';
    component.paymentRecords = [{
      invoiceId: 1,
      invoiceNumber: '2',
      amount: 3,
      agencySuffix: 4,
    }];

    component.closeAddPayment();

    expect(component.invoiceDetailsConfig.addPaymentOpen).toBeFalse();
    expect(component.paymentRecords).toEqual([]);
    expect(component.editCheckNumber).toBeNull();
  });
});
