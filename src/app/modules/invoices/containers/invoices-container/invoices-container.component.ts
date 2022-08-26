import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
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
import {
  BaseInvoice,
  Invoice,
  InvoicesFilterState,
  ManualInvoice,
  ManualInvoicesData,
  PrintingPostDto,
} from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { InvoicePrintingService, InvoicesService } from '../../services';
import { InvoicesState } from '../../store/state/invoices.state';
import { UNIT_ORGANIZATIONS_FIELDS } from 'src/app/modules/timesheets/constants';
import { DataSourceItem } from '@core/interface';
import { AppState } from '../../../../store/app.state';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { ColDef, GridOptions, RowNode, RowSelectedEvent } from '@ag-grid-community/core';
import { InvoiceTabs, InvoiceTabsProvider, OrganizationId, OrganizationIdProvider } from '../../tokens';
import {
  PendingInvoice,
  PendingInvoiceRecord,
  PendingInvoicesData
} from '../../interfaces/pending-invoice-record.interface';
import { InvoicesTableTabsComponent } from '../../components/invoices-table-tabs/invoices-table-tabs.component';
import {
  GridContainerTabConfig,
  InvoicesContainerService
} from '../../services/invoices-container/invoices-container.service';
import {
  RejectReasonInputDialogComponent
} from '@shared/components/reject-reason-input-dialog/reject-reason-input-dialog.component';
import { AgencyInvoicesGridTab, OrganizationInvoicesGridTab } from '../../enums';
import { defaultGroupInvoicesOption, GroupInvoicesOption, groupInvoicesOptions } from '../../constants';
import ShowRejectInvoiceDialog = Invoices.ShowRejectInvoiceDialog;

@Component({
  selector: 'app-invoices-container',
  templateUrl: './invoices-container.component.html',
  styleUrls: ['./invoices-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesContainerComponent extends Destroyable implements OnInit, AfterViewInit {
  @Select(InvoicesState.invoicesOrganizations)
  readonly organizations$: Observable<DataSourceItem[]>;

  @ViewChild('createInvoiceDialog')
  public createInvoiceDialog: DialogComponent;

  @ViewChild(InvoicesTableTabsComponent)
  public invoicesTableTabsComponent: InvoicesTableTabsComponent;

  @ViewChild(RejectReasonInputDialogComponent)
  public rejectReasonInputDialogComponent: RejectReasonInputDialogComponent;

  public selectedTabIdx: OrganizationInvoicesGridTab | AgencyInvoicesGridTab = 0;
  public appliedFiltersAmount = 0;

  public readonly formGroup: FormGroup = this.fb.group({
    search: ['']
  });

  public readonly organizationControl: FormControl = new FormControl(null);

  @Select(InvoicesState.pendingInvoicesData)
  public readonly pendingInvoicesData$: Observable<PendingInvoicesData>;

  @Select(InvoicesState.invoicesContainerData)
  public readonly invoicesContainerData$: Observable<PageOfCollections<BaseInvoice>>;

  @Select(InvoicesState.manualInvoicesData)
  public readonly manualInvoicesData$: Observable<ManualInvoicesData>;

  @Select(InvoicesState.pendingApprovalInvoicesData)
  public readonly pendingApprovalInvoicesData$: Observable<ManualInvoicesData>;

  @Select(InvoicesState.invoicesFilters)
  public readonly invoicesFilters$: Observable<PendingInvoicesData>;

  @Select(AppState.isOrganizationAgencyArea)
  public readonly isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  public colDefs: ColDef[] = [];

  public groupingInvoiceRecordsIds: number[] = [];

  public readonly defaultGridOptions: GridOptions = {
    onRowSelected: (event: RowSelectedEvent): void => {
      this.groupingInvoiceRecordsIds = event.api.getSelectedRows()
        .map(({ invoiceRecords }: PendingInvoice) => invoiceRecords.map((record: PendingInvoiceRecord) => record.id))
        .flat();
    }
  };

  public gridOptions: GridOptions = {};

  public get dateControl(): FormControl {
    return this.formGroup.get('date') as FormControl;
  }

  public readonly groupInvoicesOptions = groupInvoicesOptions;
  public readonly defaultGroupInvoicesOption: GroupInvoicesOption = defaultGroupInvoicesOption;
  public readonly unitOrganizationsFields = UNIT_ORGANIZATIONS_FIELDS;

  public groupInvoicesBy: GroupInvoicesOption = defaultGroupInvoicesOption;

  public currentSelectedTableRowIndex: Observable<number>
    = this.invoicesService.getCurrentTableIdxStream();
  public isLoading: boolean;
  public newSelectedIndex: number;
  public organizationId: number | null;

  public rejectInvoiceId: number;
  public tabConfig: GridContainerTabConfig = {};
  public groupInvoicesOverlayVisible: boolean = false;
  public selectedInvoiceIds: number[];

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private invoicesService: InvoicesService,
    private actions$: Actions,
    private invoicesContainerService: InvoicesContainerService,
    private printingService: InvoicePrintingService,
    @Inject(InvoiceTabs) public tabsConfig$: InvoiceTabsProvider,
    @Inject(OrganizationId) public organizationId$: OrganizationIdProvider,
  ) {
    super();

    this.store.dispatch(new SetHeaderState({ iconName: 'dollar-sign', title: 'Invoices' }));

    this.actions$.pipe(
      ofActionSuccessful(Invoices.ShowRejectInvoiceDialog),
      takeUntil(this.componentDestroy()),
    ).subscribe(({ invoiceId }: ShowRejectInvoiceDialog) => {
      this.rejectInvoiceId = invoiceId;
      this.rejectReasonInputDialogComponent.show();
    });
  }

  public ngOnInit(): void {
    this.startFiltersWatching();
    this.initOrganizationsList();
    this.startOrganizationWatching();
    this.handleChangeTab(0);
  }

  public ngAfterViewInit(): void {
    this.setTabsVisibility();
  }

  public setTabsVisibility(): void {
    this.pendingInvoicesData$
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      )
      .subscribe(({items}: PageOfCollections<BaseInvoice>) => {
        this.invoicesTableTabsComponent.setTabVisibility(0, !!items.length);
      });
  }

  public startFiltersWatching(): void {
    this.organizationId$.pipe(
      combineLatestWith(this.invoicesFilters$),
      debounceTime(200),
      takeUntil(this.componentDestroy()),
    ).subscribe(([orgId]) => {
      this.organizationId = orgId;
      this.invoicesContainerService.getRowData(this.selectedTabIdx, orgId);
    });
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onExportOptionSelect(event: unknown): void {
  }

  public handleChangeTab(tabIdx: number): void {
    this.selectedTabIdx = tabIdx;
    this.clearSelections();
    this.clearTab();

    this.organizationId$.pipe(
      takeUntil(this.componentDestroy())
    )
      .subscribe((orgId: number | null) => {
        this.organizationId = orgId;
        this.gridOptions = {
          ...this.defaultGridOptions,
          ...this.invoicesContainerService.getGridOptions(tabIdx),
        };
        this.colDefs = this.invoicesContainerService.getColDefsByTab(tabIdx, { organizationId: orgId });
        this.tabConfig = this.invoicesContainerService.getTabConfig(tabIdx);

        this.cdr.markForCheck();

        this.resetFilters();
      });

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

  public handleRowSelected(selectedRowData: { rowIndex: number; data: Invoice }): void {
    this.invoicesService.setCurrentSelectedIndexValue(selectedRowData.rowIndex);
    // TODO: Implement
    // const prevId: string = this.allInvoices.items[selectedRowData.rowIndex - 1]?.id;
    // const nextId: string = this.allInvoices.items[selectedRowData.rowIndex + 1]?.id;

    // this.store.dispatch(
    //   new Invoices.ToggleInvoiceDialog(
    //     DialogAction.Open,
    //     selectedRowData.rowIndex,
    //     prevId,
    //     nextId
    //   ));
    // this.cdr.markForCheck();
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    this.invoicesService.setNextValue(next);
    const index = this.invoicesService.getNextIndex();

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

  public handleInvoiceRejection(rejectReason: string) {
    this.store.dispatch(new Invoices.RejectInvoice(this.rejectInvoiceId, rejectReason))
      .pipe(
        takeUntil(this.componentDestroy()),
      )
      .subscribe(() => this.rejectReasonInputDialogComponent.hide());
  }

  public bulkApprove(nodes: RowNode[]): void {
    this.store.dispatch(
      new Invoices.ApproveInvoices(nodes.map((node: RowNode) => (node.data as ManualInvoice).id))
    );
  }

  public bulkExport(event: RowNode[]): void {

  }

  public groupInvoices(): void {
    this.store.dispatch(new Invoices.GroupInvoices({
      organizationId: this.organizationId,
      aggregateByType: this.groupInvoicesBy.id,
      invoiceRecordIds: this.groupingInvoiceRecordsIds,
    }))
      .pipe(
        takeUntil(this.componentDestroy()),
      )
      .subscribe(() => {
        this.createInvoiceDialog.hide();
        this.invoicesContainerService.getRowData(this.selectedTabIdx, this.organizationId);
      });
  }

  public onInvoiceGrouping({items}: { items: GroupInvoicesOption[] }): void {
    this.groupInvoicesBy = items[0];
    this.hideGroupingOverlay();
  }

  public showGroupingOverlay(): void {
    setTimeout(() => {
      this.groupInvoicesOverlayVisible = true;
      this.cdr.markForCheck();
    });
  }

  public hideGroupingOverlay(): void {
    this.groupInvoicesOverlayVisible = false;
  }

  public handleMultiSelectionChanged(nodes: RowNode[]): void {
    console.log(nodes)
    if (nodes.length) {
      this.selectedInvoiceIds = nodes.map((node) => node.data.invoiceId);
    } else {
      this.selectedInvoiceIds = [];
    }
  }

  public printInvoices(): void {
    const dto: PrintingPostDto = {
      organizationId: this.organizationId as number,
      invoiceIds: this.selectedInvoiceIds,
    }
    this.store.dispatch(new Invoices.GetPrintData(dto))
    .pipe(
      filter((state) => !!state.invoices.printData),
      map((state) => state.invoices.printData),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((data) => {
      this.printingService.printInvoice(data)
    });
  }


  private clearTab(): void {
    this.groupingInvoiceRecordsIds = [];
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

  private clearSelections(): void {
    this.selectedInvoiceIds = [];
  }
}
