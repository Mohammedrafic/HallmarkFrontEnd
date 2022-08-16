import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import {
  combineLatestWith,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  switchMap,
  takeUntil
} from 'rxjs';

import { PageOfCollections } from '@shared/models/page.model';
import { Destroyable } from '@core/helpers';
import { DialogAction } from '@core/enums';
import { SetHeaderState, ShowFilterDialog } from '../../../../store/app.actions';
import { GroupInvoicesBy, Invoice, InvoicePage, InvoiceRecord, InvoicesFilterState, } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { ItemModel } from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { InvoiceRecordsTableComponent } from '../../components/invoice-records-table/invoice-records-table.component';
import { InvoicesService } from '../../services';
import { AllInvoicesTableComponent } from '../../components/all-invoices-table/all-invoices-table.component';
import { InvoicesState } from '../../store/state/invoices.state';
import { UNIT_ORGANIZATIONS_FIELDS } from 'src/app/modules/timesheets/constants';
import { DataSourceItem } from '@core/interface';
import { AppState } from '../../../../store/app.state';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { ColDef, GridApi, GridOptions, RowNode } from '@ag-grid-community/core';
import { GridReadyEventModel } from '@shared/components/grid/models';
import { InvoiceTabs, InvoiceTabsProvider, OrganizationId, OrganizationIdProvider } from '../../tokens';
import { PendingInvoice, PendingInvoicesData } from '../../interfaces/pending-invoice-record.interface';
import { GridComponent } from '@shared/components/grid/grid.component';
import { PendingInvoicesGridHelper } from '../../helpers/pending-invoices-grid.helper';
import { InvoiceRecordsGridHelper } from '../../helpers';

@Component({
  selector: 'app-invoices-container',
  templateUrl: './invoices-container.component.html',
  styleUrls: ['./invoices-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesContainerComponent extends Destroyable implements OnInit {
  @Select(InvoicesState.invoicesOrganizations)
  readonly organizations$: Observable<DataSourceItem[]>;

  @ViewChild('createInvoiceDialog')
  public createInvoiceDialog: DialogComponent;

  @ViewChild('invoiceRecordsTable')
  public invoiceRecordsTable: InvoiceRecordsTableComponent;

  @ViewChild('allInvoicesTable')
  public allInvoicesTable: AllInvoicesTableComponent;

  @ViewChild(GridComponent)
  public gridComponent: GridComponent;

  public selectedTabIdx: number = 0;
  public appliedFiltersAmount = 0;

  public readonly formGroup: FormGroup = this.fb.group({
    search: ['']
  });

  public readonly organizationControl: FormControl = new FormControl(null);

  @Select(InvoicesState.pendingInvoicesData)
  public readonly pendingInvoicesData$: Observable<PendingInvoicesData>;

  @Select(InvoicesState.invoicesFilters)
  public readonly invoicesFilters$: Observable<PendingInvoicesData>;

  @Select(AppState.isOrganizationAgencyArea)
  public readonly isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  public readonly isAgency$: Observable<boolean>;

  public allInvoices: InvoicePage;

  public colDefs: ColDef[] = [];
  public gridOptions: GridOptions = InvoiceRecordsGridHelper.getRowNestedGridOptions();

  public get dateControl(): FormControl {
    return this.formGroup.get('date') as FormControl;
  }

  public fieldValues: { text: 'text', value: 'value' };
  public invoicesGroupByOptions: (ItemModel & { value: GroupInvoicesBy })[] = [
    {
      text: 'Location',
      id: 'location',
      value: 'location',
    },
    {
      text: 'Department',
      id: 'department',
      value: 'location',
    }
  ];
  public invoiceRecords: PageOfCollections<InvoiceRecord>;

  public groupInvoicesBy: GroupInvoicesBy = this.invoicesGroupByOptions[0].value;

  public currentSelectedTableRowIndex: Observable<number>
    = this.invoicesService.getCurrentTableIdxStream();
  public isLoading: boolean;
  public newSelectedIndex: number;
  public api: GridApi;
  public organizationId: number | null;

  public isAgency = false;

  public readonly unitOrganizationsFields = UNIT_ORGANIZATIONS_FIELDS;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private invoicesService: InvoicesService,
    @Inject(InvoiceTabs) public tabsConfig$: InvoiceTabsProvider,
    @Inject(OrganizationId) public organizationId$: OrganizationIdProvider,
  ) {
    super();

    this.store.dispatch(new SetHeaderState({ iconName: 'dollar-sign', title: 'Invoices' }));

    this.isAgency$ = this.isOrganizationAgencyArea$
      .pipe(
        map(({isAgencyArea}) => isAgencyArea),
      );
  }

  public ngOnInit(): void {
    this.startFiltersWatching();
    this.initOrganizationsList();
    this.startOrganizationWatching();
  }

  public startFiltersWatching(): void {
    this.organizationId$.pipe(
      combineLatestWith(this.invoicesFilters$),
      debounceTime(100),
      takeUntil(this.componentDestroy()),
    ).subscribe(([orgId]) => {
      this.organizationId = orgId;
      this.store.dispatch(new Invoices.GetPendingInvoices(orgId));
    });
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onExportOptionSelect(event: unknown): void {
  }

  public handleChangeTab(tabIdx: number): void {
    this.selectedTabIdx = tabIdx;

    if (this.organizationId) {
      this.setAgencyTable(tabIdx);
    } else {
      this.setOrganizationTable(tabIdx);
    }

    this.resetFilters();
  }

  public setAgencyTable(tabIndex: number): void {
    switch (tabIndex) {
      case 0:
        this?.api.setColumnDefs(PendingInvoicesGridHelper.getAgencyPendingInvoicesColDefs());
        this.resetFilters();
        return;
      default:
        break;
    }
  }

  public setOrganizationTable(tabIndex: number): void {
    switch (tabIndex) {
      case 0:
        this.api?.setColumnDefs(PendingInvoicesGridHelper.getOrganizationPendingInvoicesColDefs({
          approveInvoice: (data: PendingInvoice) => this.invoicesService.approveInvoice(data.id).subscribe(),
          rejectInvoice: (data: PendingInvoice) => this.invoicesService.rejectInvoice(data.id).subscribe(),
        }));

        this.api.sizeColumnsToFit();

        break;
      case 1:
        this.api?.setColumnDefs(InvoiceRecordsGridHelper.getInvoiceRecordsGridColumnDefinitions());
        this.api.sizeColumnsToFit();
        break;
      default:
        break;
    }
  }

  public openAddDialog(): void {
    this.store.dispatch(new Invoices.ToggleManualInvoiceDialog(DialogAction.Open));
    this.store.dispatch(new Invoices.GetInvoicesReasons(this.organizationControl.value));
  }

  public changeFiltersAmount(amount: number): void {
    this.appliedFiltersAmount = amount;
  }

  public resetFilters(): void {
    this.store.dispatch(new Invoices.UpdateFiltersState({
      pageNumber: 1,
      pageSize: 30,
    }));
  }

  public updateTableByFilters(filters: InvoicesFilterState): void {
    this.store.dispatch(new Invoices.UpdateFiltersState({ ...filters }));
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public onInvoiceGrouping({itemData: {id}}: { itemData: { id: GroupInvoicesBy } }): void {
    this.groupInvoicesBy = id;
  }

  public handleRowSelected(selectedRowData: { rowIndex: number; data: Invoice }): void {
    this.invoicesService.setCurrentSelectedIndexValue(selectedRowData.rowIndex);
    const prevId: string = this.allInvoices.items[selectedRowData.rowIndex - 1]?.id;
    const nextId: string = this.allInvoices.items[selectedRowData.rowIndex + 1]?.id;

    this.store.dispatch(
      new Invoices.ToggleInvoiceDialog(
        DialogAction.Open,
        selectedRowData.rowIndex,
        prevId,
        nextId
      ));
    this.cdr.markForCheck();
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    this.invoicesService.setNextValue(next);
    const index = this.invoicesService.getNextIndex();
    this.allInvoicesTable.selectRow(index);

    this.cdr.markForCheck();
  }

  public handleUpdateTable(): void {
    this.getInvoicesByTab();
  }

  public handlePageChange(page: number): void {
    this.store.dispatch(new Invoices.UpdateFiltersState({
      pageNumber: page,
    }))
      .pipe(
        takeUntil(this.componentDestroy()),
      );
  }

  public handlePageSizeChange(pageSize: number): void {
    this.store.dispatch(new Invoices.UpdateFiltersState({
      pageSize,
    }))
      .pipe(
        takeUntil(this.componentDestroy()),
      );
  }

  public handleSortingChange(event: string): void {

  }

  public gridReady(event: GridReadyEventModel): void {
    this.api = event.api;
    this.handleChangeTab(0);
  }

  public bulkApprove(event: RowNode[]): void {

  }

  public bulkExport(event: RowNode[]): void {

  }

  public selectedRow(event: any): void {

  }

  private getInvoicesByTab(): void {
  }

  private startOrganizationWatching(): void {
    this.organizationControl.valueChanges.pipe(
      filter(Boolean),
      distinctUntilChanged(),
      switchMap((organizationId: number) => this.store.dispatch(
        [
          new Invoices.SelectOrganization(organizationId),
        ]
      )),
      takeUntil(this.componentDestroy()),
    ).subscribe();
  }

  private initOrganizationsList(): void {
    this.store.dispatch(new Invoices.GetOrganizations())
    .pipe(
      switchMap(() => this.organizations$.pipe(
        filter((res: DataSourceItem[]) => !!res.length),
      )),
      takeUntil(this.componentDestroy()),
    ).subscribe(res => {
      this.organizationControl.setValue(res[0].id, { emitEvent: false });
      this.store.dispatch(new Invoices.SelectOrganization(res[0].id),
      )
    });
  }
}
