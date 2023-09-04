import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { NgxsModule, Store } from '@ngxs/store';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { of } from 'rxjs';


import { MessageTypes } from '@shared/enums/message-types';
import { DialogAction, FilesClearEvent } from '@core/enums';
import { FileForUpload } from '@core/interface';
import { AddDialogHelperService } from '@core/services';
import { Attachment } from '@shared/components/attachments';
import { OrganizationLocation } from '@shared/models/organization.model';
import { ManInvoiceOptionsKeys } from 'src/app/modules/invoices/enums';
import { InvoiceMetaAdapter, ManualInvoiceAdapter } from 'src/app/modules/invoices/helpers';
import { ManualInvoice, ManualInvoiceMeta, ManualInvoicePostDto } from 'src/app/modules/invoices/interfaces';
import { Invoices } from 'src/app/modules/invoices/store/actions/invoices.actions';
import { ShowToast } from 'src/app/store/app.actions';

import { ManualInvoiceDialogComponent } from './manual-invoice-dialog.component';

class ActivatedRouteStub {
  get snapshot() {
    return {
      data: {
        isAgencyArea: true
      },
    }
  }
}

const manualInvoiceStrategyMock = {
  connectConfigOptions: jasmine.createSpy('connectConfigOptions'),
  populateOptions: jasmine.createSpy('populateOptions'),
  getMeta: jasmine.createSpy('getMeta'),
  populateCandidates: jasmine.createSpy('populateCandidates')
};

describe('ManualInvoiceDialogComponent', () => {
  let component: ManualInvoiceDialogComponent;
  let fixture: ComponentFixture<ManualInvoiceDialogComponent>;

  const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'snapshot', 'select']);
  const addDialogHelperServiceSpy = jasmine.createSpyObj('AddDialogHelperService', ['createForm']);
  const dialogComponentSpy = jasmine.createSpyObj('DialogComponent', ['hide', 'show', 'setTitle']);
  const formSpy = jasmine.createSpyObj('FormGroup', ['reset', 'get', 'patchValue', 'updateValueAndValidity']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DialogModule,
        NgxsModule.forRoot([], { developmentMode: true }),
      ],
      declarations: [
        ManualInvoiceDialogComponent,
      ],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: AddDialogHelperService, useValue: addDialogHelperServiceSpy },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManualInvoiceDialogComponent);
    component = fixture.componentInstance;
    component['sideAddDialog'] = dialogComponentSpy;
    component['strategy'] = manualInvoiceStrategyMock;
    component.form = formSpy;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('closeDialog method should reset form', () => {
    formSpy.reset.calls.reset()

    component.closeDialog();

    expect(formSpy.reset).toHaveBeenCalledTimes(2);
  });

  it('closeDialog method should dispatch close action', () => {
    component.closeDialog();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.ToggleManualInvoiceDialog(DialogAction.Close));
  });

  it('closeDialog method should set clearFiles', () => {
    component.closeDialog();

    expect(component.clearFiles).toBe(FilesClearEvent.ClearAll);
  });

  it('closeDialog method should hide dialog component', () => {
    dialogComponentSpy.hide.calls.reset()

    component.closeDialog();

    expect(dialogComponentSpy.hide).toHaveBeenCalledTimes(1);
  });

  it('closeDialog method reset dropDownOptions', () => {
    Object.defineProperty(component, 'dropDownOptions', { value: {
      invoiceLocations: ['test'],
      invoiceDepartments: ['test'],
      invoiceCandidates: ['test'],
      invoiceAgencies: ['test'],
      reasons: ['test'],
    }});

    component.closeDialog();

    expect(component['dropDownOptions']).toEqual({
      invoiceLocations: [],
      invoiceDepartments: [],
      invoiceCandidates: [],
      invoiceAgencies: [],
      reasons: [],
    });
  });

  it('closeDialog method should reset filesForUpload', () => {
    component.setFilesForUpload([{ fileName: 'test' } as FileForUpload]);

    component.closeDialog();

    expect(component['filesForUpload']).toEqual([]);
  });

  it('setFilesForUpload method should set filesForUpload', () => {
    const files = [{ fileName: 'test' } as FileForUpload];

    component.setFilesForUpload(files);

    expect(component['filesForUpload']).toEqual(files);
  });

  it('deleteFile method should set filesForDelete', () => {
    const fileId = 1;
    component.filesForDelete = [];
    component.invoiceToEdit = { attachments: [{ id: fileId }] } as unknown as ManualInvoice;

    component.deleteFile({ id: fileId });

    expect(component.filesForDelete).toEqual([{ id: fileId } as Attachment]);
  });

  it('deleteFile method should not set filesForDelete if ids are different', () => {
    component.filesForDelete = [];
    component.invoiceToEdit = { attachments: [{ id: 1 }] } as unknown as ManualInvoice;

    component.deleteFile({ id: 2 });

    expect(component.filesForDelete).toEqual([]);
  });

  it('clearDialogData method should reset properties', () => {
    component.invoiceToEdit = {} as ManualInvoice;
    component.filesForDelete = [{ id: 1, fileName: 'name' }];
    component['filesForUpload'] = [{ fileName: 'name' } as FileForUpload];
    component.dialogShown = true;

    component.clearDialogData();

    expect(component.invoiceToEdit).toBeNull();
    expect(component.filesForDelete).toEqual([]);
    expect(component['filesForUpload']).toEqual([]);
    expect(component.dialogShown).toBeFalse();
  });

  it('populateLocations method should work correctly', () => {
    const orderId = 1;
    const parsedOrderId = 2;
    const locationId = 3
    const orderIdControlValue = 'orderIdControlValue';
    const locations = [{ id: locationId } as OrganizationLocation];
    const invoiceLocations = [{ text: 'text', value: 'value' }];
    const manualInvoiceAdapterSpy = spyOn(ManualInvoiceAdapter, 'parseOrderId');
    const invoiceMetaAdapterSpy = spyOn(InvoiceMetaAdapter, 'createLocationsOptions');
    const patchValueSpy = jasmine.createSpy('patchValue');
    manualInvoiceAdapterSpy.and.returnValue([null, parsedOrderId, null]);
    invoiceMetaAdapterSpy.and.returnValue(invoiceLocations);
    storeSpy.snapshot.and.returnValue({ invoices: { regions: [{ locations }] } });
    formSpy.get.and.returnValue({
      patchValue: patchValueSpy,
      value: orderIdControlValue,
      valid: true,
    });
    component['searchOptions'] = [
      {
        candidateId: Number(orderId),
        orderPublicId: parsedOrderId,
        locationId,
      } as ManualInvoiceMeta
    ];

    component.populateLocations(orderId);

    expect(manualInvoiceAdapterSpy).toHaveBeenCalledWith(orderIdControlValue);
    expect(invoiceMetaAdapterSpy).toHaveBeenCalledWith(locations);
    expect(component['dropDownOptions'][ManInvoiceOptionsKeys.Locations]).toEqual(invoiceLocations);
    expect(component['strategy'].connectConfigOptions).toHaveBeenCalled();
    expect(patchValueSpy).toHaveBeenCalledTimes(1);
  });

  it('setOrderIdOnEdit method should handle orderId change', fakeAsync(() => {
    const patchValueSpy = jasmine.createSpy('patchValue');
    spyOn(ManualInvoiceAdapter, 'parseOrderId').and.returnValue([null, null, null]);
    storeSpy.snapshot.and.returnValue({ invoices: { selectedOrganizationId: 'selectedOrganizationId'} })
    formSpy.patchValue.calls.reset()
    formSpy.get.and.returnValue({
      patchValue: patchValueSpy,
      value: 'orderIdControlValue',
      valid: true,
    });
    component.invoiceToEdit = { formattedOrderIdFull: 'formattedOrderIdFull' } as ManualInvoice;
    component['searchOptions'] = [];

    component.setOrderIdOnEdit();
    tick();

    expect(patchValueSpy).toHaveBeenCalledTimes(3);
    expect(component['strategy'].populateOptions).toHaveBeenCalled();
    expect(formSpy.patchValue).toHaveBeenCalledTimes(1);
  }));

  it('saveManualInvoice method should updateValueAndValidity if form is invalid', () => {
    formSpy.valid = false;
    formSpy.updateValueAndValidity.calls.reset()

    component.saveManualInvoice();

    expect(formSpy.updateValueAndValidity).toHaveBeenCalledTimes(1);
  });

  it('saveManualInvoice method should show error if job ID is not found', () => {
    const manualInvoiceAdapterSpy = spyOn(ManualInvoiceAdapter, 'adapPostDto');
    manualInvoiceAdapterSpy.and.returnValue(null);
    formSpy.valid = true;
    formSpy.value = {};
    storeSpy.select.and.returnValue(of(1));

    component.saveManualInvoice();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new ShowToast(MessageTypes.Warning, 'Sorry such job ID not found'));
  });

  it('saveManualInvoice method should dispatch UpdateManualInvoice action', () => {
    const dto = { comment: 'comment' } as ManualInvoicePostDto;
    const invoiceToEdit = { id: 2 } as ManualInvoice;
    const manualInvoiceAdapterSpy = spyOn(ManualInvoiceAdapter, 'adapPostDto');
    manualInvoiceAdapterSpy.and.returnValue(dto);
    formSpy.valid = true;
    formSpy.value = {};
    storeSpy.select.and.returnValue(of(1));
    component.invoiceToEdit = invoiceToEdit;

    component.saveManualInvoice();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      new Invoices.UpdateManualInvoice(
        { ...dto, timesheetId: invoiceToEdit.id },
        [],
        component['filesForUpload'],
        component.filesForDelete,
        component['isAgency'],
      )
    );
  });

  it('saveManualInvoice method should dispatch SaveManulaInvoice action', () => {
    const dto = { comment: 'comment' } as ManualInvoicePostDto;
    const invoiceToEdit = { id: 2 } as ManualInvoice;
    const manualInvoiceAdapterSpy = spyOn(ManualInvoiceAdapter, 'adapPostDto');
    manualInvoiceAdapterSpy.and.returnValue(dto);
    formSpy.valid = true;
    formSpy.value = {};
    storeSpy.select.and.returnValue(of(1));
    component.invoiceToEdit = null;

    component.saveManualInvoice();

    expect(storeSpy.dispatch)
      .toHaveBeenCalledWith(new Invoices.SaveManulaInvoice(dto, component['filesForUpload'], component['isAgency']));
  });
});
