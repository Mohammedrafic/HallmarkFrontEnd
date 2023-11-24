import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { Actions, NgxsModule, Store } from '@ngxs/store';
import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { RowNode } from '@ag-grid-community/core';
import { EMPTY, of } from 'rxjs';

import { DialogAction, FilterPageName } from '@core/enums';
import { DataSourceItem } from '@core/interface';
import { FilterService } from '@shared/services/filter.service';
import { RejectReasonInputDialogComponent } from '@shared/components/reject-reason-input-dialog/reject-reason-input-dialog.component';
import { BulkTypeAction } from '@shared/enums/bulk-type-action.enum';
import { BulkActionDataModel } from '@shared/models/bulk-action-data.model';
import { GridReadyEventModel } from '@shared/components/grid/models';
import { GRID_CONFIG } from '@shared/constants';
import { GroupInvoicesOption, InvoiceDefaulPerPageOptions, InvoicesPerPageOptions } from 'src/app/modules/invoices/constants';
import { InvoicesAgencyTabId, InvoicesAggregationType, OrganizationInvoicesGridTab } from 'src/app/modules/invoices/enums';
import {
  InvoiceGridSelections,
  InvoicePaymentData,
  InvoicesFilterState,
  PendingApprovalInvoice,
  PrintInvoiceData,
  SelectedInvoiceRow,
} from 'src/app/modules/invoices/interfaces';
import { InvoicePrintingService, InvoicesApiService, InvoicesService } from 'src/app/modules/invoices/services';
import { InvoicesContainerService } from 'src/app/modules/invoices/services/invoices-container/invoices-container.service';
import { Invoices } from 'src/app/modules/invoices/store/actions/invoices.actions';
import { InvoicesState } from 'src/app/modules/invoices/store/state/invoices.state';
import { InvoiceTabs } from 'src/app/modules/invoices/tokens';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import * as PreservedFilters from 'src/app/store/preserved-filters.actions';
import { ClearOrganizationStructure } from 'src/app/store/user.actions';
import { UserState } from 'src/app/store/user.state';

import { InvoicesContainerComponent } from './invoices-container.component';

class ActivatedRouteStub {
  get snapshot() {
    return {
      queryParams: {
        invoiceId: 'invoiceId',
        orgId: 'orgId',
      },
    }
  }
}

@Component({
  selector: 'app-page-toolbar',
  template: '<ng-content></ng-content>'
})
class FakePageToolbarComponent {}

@Component({
  selector: 'app-invoice-grid-export',
  template: '<ng-content></ng-content>'
})
class FakeInvoiceGridExportComponent {}

@Component({
  selector: 'app-invoice-record-dialog',
  template: '<ng-content></ng-content>'
})
class FakeInvoiceRecordDialogComponent {}

@Component({
  selector: 'app-invoice-detail-container',
  template: '<ng-content></ng-content>'
})
class FakeInvoiceDetailContainerComponent {}

@Component({
  selector: 'app-manual-invoice-dialog',
  template: '<ng-content></ng-content>'
})
class FakeManualInvoiceDialogComponent {}

@Component({
  selector: 'app-reject-reason-input-dialog',
  template: '<ng-content></ng-content>'
})
class FakeRejectReasonInputDialogComponent {}

@Component({
  selector: 'app-invoices-filters-dialog',
  template: '<ng-content></ng-content>'
})
class FakeInvoicesFiltersDialogComponent {}

@Component({
  selector: 'app-file-viewer',
  template: '<ng-content></ng-content>'
})
class FakeFileViewerComponent {}

const agencyId = 1;
const orgId = 2;
const organization = { id: orgId } as DataSourceItem;

const storeSelectMockFn = (selector: any) => {
  switch (selector) {
    case UserState.lastSelectedAgencyId:
      return of(agencyId);
    case InvoicesState.invoicesOrganizations:
      return of([organization]);
    default:
      return EMPTY;
  }
}

describe('InvoicesContainerComponent', () => {
  let component: InvoicesContainerComponent;
  let fixture: ComponentFixture<InvoicesContainerComponent>;

  const storeSpy: jasmine.SpyObj<Store> = jasmine
    .createSpyObj('Store', ['dispatch', 'select', 'snapshot', 'selectSnapshot']);
  const actionsSpy: jasmine.SpyObj<Actions> = jasmine
    .createSpyObj('Actions', ['pipe']);
  const invoicesServiceSpy: jasmine.SpyObj<InvoicesService> = jasmine.createSpyObj(
    'InvoicesService',
    ['getCurrentTableIdxStream', 'setCurrentSelectedIndexValue', 'setNextValue', 'createPaymentRecords']
  );
  const invoicesContainerServiceSpy: jasmine.SpyObj<InvoicesContainerService> = jasmine.createSpyObj(
    'InvoicesContainerService',
    ['getTabConfig', 'getRowData', 'getGridOptions', 'getColDefsByTab', 'getAllTabId']
  );
  const invoicesApiServiceSpy: jasmine.SpyObj<InvoicesApiService> = jasmine
    .createSpyObj('InvoicesApiService', ['getGroupingOptionsIds']);
  const invoicePrintingServiceSpy: jasmine.SpyObj<InvoicePrintingService> = jasmine
    .createSpyObj('InvoicePrintingService', ['printAgencyInvoice', 'printInvoice']);
  const filterServiceSpy: jasmine.SpyObj<FilterService> = jasmine
    .createSpyObj('FilterService', ['composeFilterState']);

  storeSpy.snapshot.and.returnValue({ invoices: { isAgencyArea: false, permissions: { agencyCanPay: false } } });
  storeSpy.selectSnapshot.and.returnValue({ state: {} });
  storeSpy.select.and.callFake(storeSelectMockFn);
  actionsSpy.pipe.and.returnValue(of(null));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ListBoxModule,
        TooltipModule,
        FeatherModule.pick({}),
        NgxsModule.forRoot([], { developmentMode: true }),
      ],
      declarations: [
        InvoicesContainerComponent,
        FakePageToolbarComponent,
        FakeInvoiceGridExportComponent,
        FakeInvoiceRecordDialogComponent,
        FakeInvoiceDetailContainerComponent,
        FakeManualInvoiceDialogComponent,
        FakeRejectReasonInputDialogComponent,
        FakeInvoicesFiltersDialogComponent,
        FakeFileViewerComponent,
      ],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: InvoicesService, useValue: invoicesServiceSpy },
        { provide: InvoicesContainerService, useValue: invoicesContainerServiceSpy },
        { provide: InvoicePrintingService, useValue: invoicePrintingServiceSpy },
        { provide: InvoicesApiService, useValue: invoicesApiServiceSpy },
        { provide: FilterService, useValue: filterServiceSpy },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: InvoiceTabs, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesContainerComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('watchAgencyId method should work correctly', () => {
    const controlResetSpy = spyOn(component.organizationControl, 'reset');
    const controlSetValueSpy = spyOn(component.organizationControl, 'setValue');
    const organizationMultiSelectControlSetValueSpy = spyOn(component.organizationMultiSelectControl, 'setValue');
    component.isAgency = true;
    storeSpy.dispatch.and.returnValue(of(null));
    storeSpy.dispatch.calls.reset();

    component.watchAgencyId();

    expect(component.organizationId).toBe(0);
    expect(controlResetSpy).toHaveBeenCalled();
    expect(component.organizationsList).toEqual([organization]);
    expect(component.showmsg).toBeTrue();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.SelectOrganization(0));
    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.GetOrganizations());
    expect(component.agencyOrganizationIds).toEqual([]);
    expect(controlSetValueSpy).toHaveBeenCalledWith(orgId, { emitEvent: true, onlySelf: false });
    expect(organizationMultiSelectControlSetValueSpy).toHaveBeenCalledWith([orgId]);
  });

  it('watchAgencyId method should set navigatedOrgId', () => {
    const navigatedOrgId = 3;
    const controlSetValueSpy = spyOn(component.organizationControl, 'setValue');
    const organizationMultiSelectControlSetValueSpy = spyOn(component.organizationMultiSelectControl, 'setValue');
    component.isAgency = true;
    component['navigatedOrgId'] = navigatedOrgId
    storeSpy.dispatch.and.returnValue(of(null));

    component.watchAgencyId();

    expect(controlSetValueSpy).toHaveBeenCalledWith(navigatedOrgId, { emitEvent: true, onlySelf: false });
    expect(organizationMultiSelectControlSetValueSpy).toHaveBeenCalledWith([navigatedOrgId]);
  });

  it('startFiltersWatching method should work correctly for agency', () => {
    const id = 1;
    component.isAgency = true;
    component.organizationId$ = of([id])
    storeSpy.dispatch.calls.reset();

    component.startFiltersWatching();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.ClearOrganizationStructure());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(new PreservedFilters.ResetPageFilters());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(new PreservedFilters.GetPreservedFiltersByPage(FilterPageName.InvoicesVMSAgency));
    expect(component.organizationId).toBe(id);
    expect(component.navigatedInvoiceId).toBeNull();
    expect(component['navigatedOrgId']).toBeNull();
  });

  it('startFiltersWatching method should work correctly for organization', () => {
    const id = 1;
    const filterSpy = spyOn(component, 'resetFilters');
    component.isAgency = false;
    component.organizationId$ = of(id)
    component.selectedTabIdx = OrganizationInvoicesGridTab.PendingRecords;
    storeSpy.dispatch.calls.reset();
    invoicesApiServiceSpy.getGroupingOptionsIds.and.returnValue(of([InvoicesAggregationType.Candidate]));

    component.startFiltersWatching();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new ClearOrganizationStructure());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(new PreservedFilters.ResetPageFilters());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(new PreservedFilters.GetPreservedFiltersByPage(FilterPageName.InvoicesVMSOrganization));
    expect(component.organizationId).toBe(id);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.SelectOrganization(id));
    expect(filterSpy).toHaveBeenCalledWith(true);
    expect(component.navigatedInvoiceId).toBeNull();
    expect(component['navigatedOrgId']).toBeNull();
    expect(component.groupInvoicesOptions).toEqual([{
      id: InvoicesAggregationType.Candidate,
      text: 'Candidate (Loc - Candidate)',
      tooltip: 'Generate as many invoices as different unique Candidates in the chosen timesheets list.',
    }]);
    expect(component.groupInvoicesBy).toEqual(component.groupInvoicesOptions[0]);
  });

  it('showFilters method should dispatch correct action', () => {
    storeSpy.dispatch.calls.reset();

    component.showFilters();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new ShowFilterDialog(true));
  });

  it('selectTab method should select tab for organization', () => {
    const tabIdx = OrganizationInvoicesGridTab.PendingRecords;
    const tabConfig = { groupingEnabled: true, manualInvoiceCreationEnabled: true };
    const filterSpy = spyOn(component, 'resetFilters');
    component.isAgency = false;
    component.organizationId = 1;
    component.payInvoiceEnabled = false;
    storeSpy.dispatch.calls.reset();
    invoicesApiServiceSpy.getGroupingOptionsIds.and.returnValue(of([InvoicesAggregationType.Candidate]));
    invoicesContainerServiceSpy.getTabConfig.and.returnValue(tabConfig);

    component.selectTab(tabIdx, []);

    expect(component.selectedTabIdx).toBe(tabIdx);
    expect(component.recordsPerPageOptions).toBe(InvoicesPerPageOptions);
    expect(component.groupInvoicesOptions).toEqual([{
      id: InvoicesAggregationType.Candidate,
      text: 'Candidate (Loc - Candidate)',
      tooltip: 'Generate as many invoices as different unique Candidates in the chosen timesheets list.',
    }]);
    expect(component.groupInvoicesBy).toEqual(component.groupInvoicesOptions[0]);
    expect(component.selectedTabId).toBe(0)
    expect(storeSpy.dispatch).toHaveBeenCalledWith([new Invoices.SetTabIndex(tabIdx)]);
    expect(component.gridSelections.selectedInvoiceIds).toEqual([]);
    expect(component.groupingInvoiceRecordsIds).toEqual([]);
    expect(component.canPay).toBeFalse();
    expect(component.tabConfig).toEqual(tabConfig);
    expect(filterSpy).toHaveBeenCalledWith(true);
  });

  it('selectTab method should select tab for agency', () => {
    const tabIdx = OrganizationInvoicesGridTab.PendingRecords;
    const tabConfig = { groupingEnabled: true, manualInvoiceCreationEnabled: true };
    const filterSpy = spyOn(component, 'resetFilters');
    component.isAgency = true;
    component.organizationId = 1;
    component.payInvoiceEnabled = false;
    storeSpy.dispatch.calls.reset();
    invoicesApiServiceSpy.getGroupingOptionsIds.and.returnValue(of([InvoicesAggregationType.Candidate]));
    invoicesContainerServiceSpy.getTabConfig.and.returnValue(tabConfig);

    component.selectTab(tabIdx, []);

    expect(component.selectedTabIdx).toBe(tabIdx);
    expect(component.recordsPerPageOptions).toBe(InvoiceDefaulPerPageOptions);
    expect(component.selectedTabId).toBe(InvoicesAgencyTabId.ManualInvoicePending)
    expect(storeSpy.dispatch).toHaveBeenCalledWith([new Invoices.SetTabIndex(tabIdx)]);
    expect(component.gridSelections.selectedInvoiceIds).toEqual([]);
    expect(component.groupingInvoiceRecordsIds).toEqual([]);
    expect(component.canPay).toBeFalse();
    expect(component.tabConfig).toEqual(tabConfig);
    expect(filterSpy).toHaveBeenCalledWith(true);
  });

  it('openAddDialog method should open AddDialog for agency', () => {
    storeSpy.dispatch.calls.reset();
    component.isAgency = true;

    component.openAddDialog();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.ToggleManualInvoiceDialog(DialogAction.Open));
    expect(storeSpy.dispatch)
      .toHaveBeenCalledWith(new Invoices.GetInvoicesReasons(component.organizationMultiSelectControl?.value?.[0]));
  });

  it('openAddDialog method should open AddDialog for organization', () => {
    const id = 13;
    component.isAgency = false;
    storeSpy.dispatch.calls.reset();
    storeSpy.selectSnapshot.and.returnValue(id);

    component.openAddDialog();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.ToggleManualInvoiceDialog(DialogAction.Open));
    expect(storeSpy.dispatch)
      .toHaveBeenCalledWith(new Invoices.GetInvoicesReasons(id));
  });

  it('changeFiltersAmount method should set appliedFiltersAmount', () => {
    const amount = 13;

    component.changeFiltersAmount(amount);

    expect(component.appliedFiltersAmount).toBe(amount);
  });

  it('resetFilters method should reset Filters', () => {
    storeSpy.dispatch.calls.reset();
    component.isAgency = true;
    component.navigatedInvoiceId = 3;
    component['navigatedOrgId'] = 4;

    component.resetFilters(false);

    expect(storeSpy.dispatch).toHaveBeenCalledWith( new Invoices.UpdateFiltersState({
      pageNumber: GRID_CONFIG.initialPage,
      pageSize: GRID_CONFIG.initialRowsPerPage,
      orderBy: '',
      checkData: false,
      invoiceIds: [component.navigatedInvoiceId],
      organizationId: component['navigatedOrgId'],
    }));
  });

  it('resetFilters method should reset and keep Filters', () => {
    const filters = { orderBy: 'orderBy', checkData: false };
    storeSpy.dispatch.calls.reset();
    filterServiceSpy.composeFilterState.calls.reset();
    filterServiceSpy.composeFilterState.and.returnValue(filters);
    component.isAgency = false;
    component.navigatedInvoiceId = null;
    component['navigatedOrgId'] = 4;

    component.resetFilters(true);

    expect(component['filterState']).toEqual(filters);
    expect(storeSpy.dispatch).toHaveBeenCalledWith( new Invoices.UpdateFiltersState({
      pageNumber: GRID_CONFIG.initialPage,
      pageSize: GRID_CONFIG.initialRowsPerPage,
      ...filters,
    }));
  });

  it('gridReady method should set gridInstance', () => {
    const event = { test: 'test' } as unknown as GridReadyEventModel;

    component.gridReady(event);

    expect(component['gridInstance']).toEqual(event);
  });

  it('updateTableByFilters method should dispatch actions with correct params', () => {
    const agencyOrganizationIds = [3, 4];
    const filters = { agencyOrganizationIds: [1, 2], pageSize: 100 }  as InvoicesFilterState;
    component.agencyOrganizationIds = agencyOrganizationIds;
    component.isAgency = true;
    storeSpy.dispatch.calls.reset();

    component.updateTableByFilters(filters);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.UpdateFiltersState({ ...filters, agencyOrganizationIds }));
    expect(storeSpy.dispatch).toHaveBeenCalledWith(new PreservedFilters.SaveFiltersByPageName(
      FilterPageName.InvoicesVMSAgency,
      { ...filters, agencyOrganizationIds },
    ));
    expect(storeSpy.dispatch).toHaveBeenCalledWith(new ShowFilterDialog(false));
  });

  it('selectRow method should dispatch actions with correct params for Agency', () => {
    const prevId = 13;
    const selectedRowData: SelectedInvoiceRow = {
      data: { invoiceId: 1, organizationId: 2 } as PendingApprovalInvoice,
      rowIndex: 1,
    };
    const invoices = { items: [{ invoiceId: prevId }] };
    component.selectedTabIdx = 4;
    component.isAgency = true;
    storeSpy.dispatch.calls.reset();
    storeSpy.selectSnapshot.and.returnValue(invoices);

    component.selectRow(selectedRowData);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.ToggleInvoiceDialog(
      DialogAction.Open,
      true,
      {
        invoiceIds: [selectedRowData.data!.invoiceId],
        organizationIds: [selectedRowData.data!.organizationId],
      },
      prevId,
      null
    ));
  });

  it('selectRow method should dispatch actions with correct params for Organization', () => {
    const prevId = 13;
    const nextId = 14;
    const organizationId = 2;
    const selectedRowData: SelectedInvoiceRow = {
      data: { invoiceId: 1, organizationId: 2 } as PendingApprovalInvoice,
      rowIndex: 1,
    };
    const invoices = { items: [{ invoiceId: prevId }, { invoiceId: 0 }, { invoiceId: nextId }] };
    component.selectedTabIdx = 4;
    component.organizationId = organizationId;
    component.isAgency = false;
    storeSpy.dispatch.calls.reset();
    storeSpy.selectSnapshot.and.returnValue(invoices);

    component.selectRow(selectedRowData);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.ToggleInvoiceDialog(
      DialogAction.Open,
      false,
      {
        invoiceIds: [selectedRowData.data!.invoiceId],
        organizationIds: [organizationId],
      },
      prevId,
      nextId
    ));
  });

  it('onNextPreviousOrderEvent method should call invoicesService.setNextValue', () => {
    invoicesServiceSpy.setNextValue.calls.reset();

    component.onNextPreviousOrderEvent(true);

    expect(invoicesServiceSpy.setNextValue).toHaveBeenCalledOnceWith(true);
  });

  it('updateTable method should dispatch actions with correct params', () => {
    const invoiceId = 1;
    const status = 1;
    const organizationId = 1;
    const params = { invoiceId, status, organizationId };
    storeSpy.dispatch.calls.reset();
    storeSpy.dispatch.and.returnValue(of(null));

    component.updateTable(params);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.ChangeInvoiceState(invoiceId, status, organizationId));
    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.ToggleInvoiceDialog(DialogAction.Close));
  });

  it('changePage method should work correctly', () => {
    const pageNumber = 1;
    const filterState = { searchTerm: 'test' };
    const changeMultiSelectionSpy = spyOn(component, 'changeMultiSelection');
    component['filterState'] = filterState;
    component.groupingInvoiceRecordsIds = [1];
    storeSpy.dispatch.calls.reset();

    component.changePage(pageNumber);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.UpdateFiltersState({
      ...filterState,
      pageNumber,
    }, true));
    expect(component.groupingInvoiceRecordsIds).toEqual([]);
    expect(changeMultiSelectionSpy).toHaveBeenCalledOnceWith([]);
  });

  it('changePageSize method should work correctly', () => {
    const pageSize = 1;
    const filterState = { searchTerm: 'test' };
    const changeMultiSelectionSpy = spyOn(component, 'changeMultiSelection');
    component['filterState'] = filterState;
    component.groupingInvoiceRecordsIds = [1];
    storeSpy.dispatch.calls.reset();

    component.changePageSize(pageSize);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.UpdateFiltersState({
      ...filterState,
      pageSize,
    }, false));
    expect(component.groupingInvoiceRecordsIds).toEqual([]);
    expect(changeMultiSelectionSpy).toHaveBeenCalledOnceWith([]);
  });

  it('changeSorting method should work correctly', () => {
    const event = 'event';
    storeSpy.dispatch.calls.reset();

    component.changeSorting(event);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.UpdateFiltersState({ orderBy: event }, true));
  });

  it('handleInvoiceRejection method should work correctly', () => {
    const rejectReason = 'rejectReason';
    const rejectInvoiceId = 1;
    component.rejectInvoiceId = rejectInvoiceId;
    component.rejectReasonInputDialogComponent = {
      hide: jasmine.createSpy('hide'),
    } as unknown as RejectReasonInputDialogComponent;
    storeSpy.dispatch.calls.reset();
    storeSpy.dispatch.and.returnValue(of(null));

    component.handleInvoiceRejection(rejectReason);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.RejectInvoice(rejectInvoiceId, rejectReason));
    expect(component.rejectReasonInputDialogComponent.hide).toHaveBeenCalled();
  });

  it('groupInvoices method should work correctly', () => {
    const organizationId = 1;
    const selectedTabIdx = 5;
    const groupInvoicesBy = { id: 2 } as GroupInvoicesOption;
    const groupingInvoiceRecordsIds = [1, 2];
    component.selectedTabIdx = selectedTabIdx;
    component.organizationId = organizationId;
    component.groupInvoicesBy = groupInvoicesBy;
    component.groupingInvoiceRecordsIds = groupingInvoiceRecordsIds;
    component.isAgency = false;
    invoicesContainerServiceSpy.getRowData.calls.reset();
    storeSpy.dispatch.calls.reset();
    storeSpy.dispatch.and.returnValue(of(null));

    component.groupInvoices();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.GroupInvoices({
      organizationId,
      aggregateByType: groupInvoicesBy.id,
      invoiceRecordIds: groupingInvoiceRecordsIds,
    }));
    expect(invoicesContainerServiceSpy.getRowData).toHaveBeenCalledWith(selectedTabIdx, organizationId, null);
  });

  it('selectGroupOption method should work correctly', () => {
    const groupInvoicesOptions = { items: [{ id: InvoicesAggregationType.Region } as GroupInvoicesOption] };
    component.invoiceContainerConfig.groupInvoicesOverlayVisible = true;

    component.selectGroupOption(groupInvoicesOptions);

    expect(component.groupInvoicesBy).toEqual(groupInvoicesOptions.items[0]);
    expect(component.invoiceContainerConfig.groupInvoicesOverlayVisible).toBeFalse();
  });

  it('showGroupingOverlay method should work correctly', fakeAsync(() => {
    component.invoiceContainerConfig.groupInvoicesOverlayVisible = false;

    component.showGroupingOverlay();
    tick();

    expect(component.invoiceContainerConfig.groupInvoicesOverlayVisible).toBeTrue();
  }));

  it('changeMultiSelection method should work correctly for PendingRecords', () => {
    const id = 1;
    const invoiceId = 2;
    const nodes = [{ data: { id, invoiceId } } as RowNode];
    component.selectedTabIdx = OrganizationInvoicesGridTab.PendingRecords;

    component.changeMultiSelection(nodes);

    expect(component.gridSelections.selectedInvoiceIds).toEqual([id]);
  });

  it('changeMultiSelection method should work correctly for Manual', () => {
    const id = 1;
    const invoiceId = 2;
    const nodes = [{ data: { id, invoiceId } } as RowNode];
    component.selectedTabIdx = OrganizationInvoicesGridTab.Manual;

    component.changeMultiSelection(nodes);

    expect(component.gridSelections.selectedInvoiceIds).toEqual([id]);
    expect(component.gridSelections.rowNodes).toEqual(nodes);
  });

  it('changeMultiSelection method should clear gridSelection', () => {
    component.paymentRecords = [{ invoiceId: 1 } as InvoicePaymentData];

    component.changeMultiSelection([]);

    expect(component.gridSelections.selectedInvoiceIds).toEqual([]);
    expect(component.gridSelections.rowNodes).toEqual([]);
    expect(component.paymentRecords).toEqual([]);
  });

  it('printInvoices method should print Invoices for Agency (All)', () => {
    const organizationId = 1;
    const invoiceIds = [3, 4];
    const nodes = [{ data: { organizationId } } as RowNode];
    component.gridSelections = { rowNodes: nodes, selectedInvoiceIds: invoiceIds } as InvoiceGridSelections;
    component.isAgency = true;
    component.selectedTabIdx = OrganizationInvoicesGridTab.All;
    storeSpy.dispatch.calls.reset();
    storeSpy.dispatch.and.returnValue(EMPTY);

    component.printInvoices();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.GetPrintData(
      { organizationIds: [organizationId], invoiceIds },
      true,
      OrganizationInvoicesGridTab.All
    ));
  });

  it('printInvoices method should print Invoices for Agency (PendingRecords)', () => {
    const organizationId = 1;
    const invoiceIds = [3, 4];
    const nodes = [{ data: { organizationId } } as RowNode];
    component.gridSelections = { rowNodes: nodes, selectedInvoiceIds: invoiceIds } as InvoiceGridSelections;
    component.isAgency = true;
    component.selectedTabIdx = OrganizationInvoicesGridTab.PendingRecords;

    storeSpy.dispatch.calls.reset();
    storeSpy.dispatch.and.returnValue(EMPTY);

    component.printInvoices();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.GetPrintData(
      { organizationIds: [organizationId], ids: invoiceIds },
      true,
      OrganizationInvoicesGridTab.PendingRecords
    ));
  });

  it('printInvoices method should print Invoices for Organization', () => {
    const organizationId = 1;
    const invoiceIds = [3, 4];
    component.gridSelections = { selectedInvoiceIds: invoiceIds } as InvoiceGridSelections;
    component.isAgency = false;
    component.organizationId = organizationId;
    component.selectedTabIdx = OrganizationInvoicesGridTab.PendingRecords;

    storeSpy.dispatch.calls.reset();
    storeSpy.dispatch.and.returnValue(EMPTY);

    component.printInvoices();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.GetPrintData(
      { organizationId, ids: invoiceIds },
      false,
      OrganizationInvoicesGridTab.PendingRecords
    ));
  });

  it('printInvoices method should handle success response for Organization', () => {
    const organizationId = 1;
    const invoiceIds = [3, 4];
    const printData = [{ totals: { total: 1 } } as PrintInvoiceData];
    const resetTableSelectionSpy = spyOn(component, 'resetTableSelection');
    component.gridSelections = { selectedInvoiceIds: invoiceIds } as InvoiceGridSelections;
    component.isAgency = false;
    component.organizationId = organizationId;
    component.selectedTabIdx = OrganizationInvoicesGridTab.PendingRecords;

    invoicePrintingServiceSpy.printInvoice.calls.reset();
    storeSpy.dispatch.and.returnValue(of({ invoices: { printData } }));

    component.printInvoices();

    expect(invoicePrintingServiceSpy.printInvoice).toHaveBeenCalledWith(printData, OrganizationInvoicesGridTab.PendingRecords);
    expect(resetTableSelectionSpy).toHaveBeenCalled();
  });

  it('printInvoices method should handle success response for Agency', () => {
    const organizationId = 1;
    const invoiceIds = [3, 4];
    const nodes = [{ data: { organizationId } } as RowNode];
    const printData = [{ totals: { total: 1 } } as PrintInvoiceData];
    component.gridSelections = { rowNodes: nodes, selectedInvoiceIds: invoiceIds } as InvoiceGridSelections;
    component.isAgency = true;

    invoicePrintingServiceSpy.printAgencyInvoice.calls.reset();
    storeSpy.dispatch.and.returnValue(of({ invoices: { printData } }));

    component.printInvoices();

    expect(invoicePrintingServiceSpy.printAgencyInvoice).toHaveBeenCalledWith(printData);
  });

  it('openAddPayment method should open AddPayment', () => {
    component.invoiceContainerConfig.addPaymentOpen = false;

    component.openAddPayment();

    expect(component.invoiceContainerConfig.addPaymentOpen).toBeTrue();
  });

  it('openAddPayment method should open AddPayment and create Records', () => {
    const invoicePaymentData = [{ id: 'id' } as unknown as InvoicePaymentData];
    component.invoiceContainerConfig.addPaymentOpen = false;
    component.paymentRecords = [];
    invoicesServiceSpy.createPaymentRecords.and.returnValue(invoicePaymentData)

    component.openAddPayment(true);

    expect(component.invoiceContainerConfig.addPaymentOpen).toBeTrue();
    expect(component.paymentRecords).toEqual(invoicePaymentData);
  });

  it('closeAddPayment method should close AddPayment', () => {
    component.invoiceContainerConfig.addPaymentOpen = true;

    component.closeAddPayment();

    expect(component.invoiceContainerConfig.addPaymentOpen).toBeFalse();
  });

  it('handleBulkAction method should dispatch action', () => {
    const id = 1;
    const event = { items: [{ data: { id } }], type: BulkTypeAction.APPROVE } as BulkActionDataModel;
    storeSpy.dispatch.calls.reset()

    component.handleBulkAction(event);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new Invoices.ApproveInvoices([id]));
  });

  it('toggleDropdownList method should hide Grouping Overlay', () => {
    component.invoiceContainerConfig.groupInvoicesOverlayVisible = true;
    component.invoiceContainerConfig.groupInvoicesOverlayVisible = true;

    component.toggleDropdownList();

    expect(component.invoiceContainerConfig.groupInvoicesOverlayVisible).toBeFalse();
  });

  it('toggleDropdownList method should show Grouping Overlay', fakeAsync(() => {
    component.invoiceContainerConfig.groupInvoicesOverlayVisible = false;
    component.invoiceContainerConfig.groupInvoicesOverlayVisible = false;

    component.toggleDropdownList();
    tick();

    expect(component.invoiceContainerConfig.groupInvoicesOverlayVisible).toBeTrue();
  }));
});
