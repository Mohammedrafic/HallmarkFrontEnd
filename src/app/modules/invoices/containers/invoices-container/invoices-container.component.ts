import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit,
  ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import {
  combineLatest,
  combineLatestWith, debounceTime, distinctUntilChanged, filter, map, Observable,
  switchMap, takeUntil, tap,
} from 'rxjs';

import { PageOfCollections } from '@shared/models/page.model';
import { Destroyable } from '@core/helpers';
import { DialogAction } from '@core/enums';
import { SetHeaderState, ShowFilterDialog } from '../../../../store/app.actions';
import {
  BaseInvoice, InvoicesFilterState, InvoiceUpdateEmmit, ManualInvoice, ManualInvoicesData,
  PrintingPostDto, SelectedInvoiceRow, GridContainerTabConfig
} from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicePrintingService, InvoicesService } from '../../services';
import { InvoicesState } from '../../store/state/invoices.state';
import { UNIT_ORGANIZATIONS_FIELDS } from 'src/app/modules/timesheets/constants';
import { DataSourceItem, Permission } from '@core/interface';
import { ColDef, GridOptions, RowNode, RowSelectedEvent } from '@ag-grid-community/core';
import { InvoiceTabs, InvoiceTabsProvider } from '../../tokens';
import {
  PendingInvoice,
  PendingInvoiceRecord,
  PendingInvoicesData
} from '../../interfaces/pending-invoice-record.interface';
import { InvoicesTableTabsComponent } from '../../components/invoices-table-tabs/invoices-table-tabs.component';
import { InvoicesContainerService } from '../../services/invoices-container/invoices-container.service';
import {
  RejectReasonInputDialogComponent
} from '@shared/components/reject-reason-input-dialog/reject-reason-input-dialog.component';
import { AgencyInvoicesGridTab, OrganizationInvoicesGridTab } from '../../enums';
import { defaultGroupInvoicesOption, GroupInvoicesOption, groupInvoicesOptions } from '../../constants';
import ShowRejectInvoiceDialog = Invoices.ShowRejectInvoiceDialog;
import { UserState } from 'src/app/store/user.state';
import { PendingApprovalInvoicesData } from '../../interfaces/pending-approval-invoice.interface';
import { InvoicesModel } from '../../store/invoices.model';
import { InvoicesPermissionHelper } from '../../helpers/invoices-permission.helper';

@Component({
  selector: 'app-invoices-container',
  templateUrl: './invoices-container.component.html',
  styleUrls: ['./invoices-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesContainerComponent extends InvoicesPermissionHelper implements OnInit, AfterViewInit {
  @Select(InvoicesState.invoicesOrganizations)
  readonly organizations$: Observable<DataSourceItem[]>;

  @ViewChild(InvoicesTableTabsComponent)
  public invoicesTableTabsComponent: InvoicesTableTabsComponent;

  @ViewChild(RejectReasonInputDialogComponent)
  public rejectReasonInputDialogComponent: RejectReasonInputDialogComponent;

  public selectedTabIdx: OrganizationInvoicesGridTab | AgencyInvoicesGridTab = 0;
  public appliedFiltersAmount = 0;

  public readonly organizationControl: FormControl = new FormControl(null);

  @Select(InvoicesState.pendingInvoicesData)
  public readonly pendingInvoicesData$: Observable<PendingInvoicesData>;

  @Select(InvoicesState.invoicesContainerData)
  public readonly invoicesContainerData$: Observable<PageOfCollections<BaseInvoice>>;

  @Select(InvoicesState.manualInvoicesData)
  public readonly manualInvoicesData$: Observable<ManualInvoicesData>;

  @Select(InvoicesState.pendingApprovalInvoicesData)
  public readonly pendingApprovalInvoicesData$: Observable<PendingApprovalInvoicesData>;

  @Select(InvoicesState.invoicesFilters)
  public readonly invoicesFilters$: Observable<PendingInvoicesData>;

  @Select(UserState.lastSelectedOrganizationId)
  public readonly organizationChangeId$: Observable<number>;

  @Select(UserState.lastSelectedAgencyId)
  public readonly agencyId$: Observable<number>;

  @Select(InvoicesState.manualInvoicesExist)
  public readonly manualInvoicesExist$: Observable<boolean>;

  public organizationId$: Observable<number>;

  public colDefs: ColDef[] = [];

  public groupingInvoiceRecordsIds: number[] = [];

  public readonly defaultGridOptions: GridOptions = {
    onRowSelected: (event: RowSelectedEvent): void => {
      this.groupingInvoiceRecordsIds = event.api.getSelectedRows()
        .map(({ invoiceRecords }: PendingInvoice) => invoiceRecords?.map((record: PendingInvoiceRecord) => record.id))
        .flat();
    }
  };

  public gridOptions: GridOptions = {};

  public readonly groupInvoicesOptions = groupInvoicesOptions;
  public readonly defaultGroupInvoicesOption: GroupInvoicesOption = defaultGroupInvoicesOption;
  public readonly unitOrganizationsFields = UNIT_ORGANIZATIONS_FIELDS;

  public groupInvoicesBy: GroupInvoicesOption = defaultGroupInvoicesOption;

  public currentSelectedTableRowIndex: Observable<number>
    = this.invoicesService.getCurrentTableIdxStream();
  public isLoading: boolean;
  public newSelectedIndex: number;
  public organizationId: number;

  public rejectInvoiceId: number;
  public tabConfig: GridContainerTabConfig | null;
  public groupInvoicesOverlayVisible: boolean = false;
  public selectedInvoiceIds: number[];

  public isAgency: boolean;

  public agencyActionsAllowed = true;

  public invoicePayAllowed = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private invoicesService: InvoicesService,
    private actions$: Actions,
    private invoicesContainerService: InvoicesContainerService,
    private printingService: InvoicePrintingService,
    @Inject(InvoiceTabs) public tabsConfig$: InvoiceTabsProvider,
    store: Store,
  ) {
    super(store);

    this.store.dispatch(new SetHeaderState({ iconName: 'dollar-sign', title: 'Invoices' }));

    this.isAgency = (this.store.snapshot().invoices as InvoicesModel).isAgencyArea;
    this.organizationId$ = this.isAgency ? this.organizationControl.valueChanges : this.organizationChangeId$;
  }

  public ngOnInit(): void {
    if (this.isAgency) {
      this.checkActionsAllowed();
    }

    this.checkPermissions(this.isAgency);
    this.watchDialogVisibility();
    this.startFiltersWatching();
    this.watchForInvoiceStatusChange();

    this.watchOrganizationId();
    this.watchAgencyId();
  }

  public ngAfterViewInit(): void {
    this.setManualInvoicesTabVisibility();
  }

  public watchAgencyId(): void {
    if (this.isAgency) {
      this.agencyId$
        .pipe(
          distinctUntilChanged(),
          switchMap(() => this.store.dispatch(new Invoices.GetOrganizations())),
          switchMap(() => this.organizations$),
          filter((organizations: DataSourceItem[]) => !!organizations.length),
          map(([firstOrganization]: DataSourceItem[]) => firstOrganization.id),
          takeUntil(this.componentDestroy())
        )
        .subscribe((orgId: number) => {
          this.organizationControl.setValue(orgId, {emitEvent: true, onlySelf: false});
        });
    }
  }

  public watchOrganizationId(): void {
    this.organizationId$
      .pipe(
        tap((id: number) => {
          const orgIdSet: boolean = !!this.organizationId;
          this.organizationId = id;

          if (!orgIdSet) {
            this.handleChangeTab(0);
          }
        }),
        takeUntil(this.componentDestroy())
      )
      .subscribe((id: number) => {
        this.store.dispatch(new Invoices.SelectOrganization(id));
      });
  }

  public watchDialogVisibility(): void {
    this.actions$.pipe(
      ofActionSuccessful(Invoices.ShowRejectInvoiceDialog),
      takeUntil(this.componentDestroy()),
    ).subscribe(({ invoiceId }: ShowRejectInvoiceDialog) => {
      this.rejectInvoiceId = invoiceId;
      this.rejectReasonInputDialogComponent.show();
    });
  }

  public setManualInvoicesTabVisibility(): void {
    if (!this.isAgency) {
      this.organizationId$
        .pipe(
          switchMap((orgId: number) => this.store.dispatch(new Invoices.CheckManualInvoicesExist(orgId))),
          switchMap(() => this.manualInvoicesExist$),
          takeUntil(this.componentDestroy()),
        )
        .subscribe((invoicesExist: boolean) =>
          this.invoicesTableTabsComponent.setTabVisibility(0, invoicesExist)
        );
    }
  }

  public startFiltersWatching(): void {
    this.organizationId$.pipe(
      combineLatestWith(this.invoicesFilters$),
      debounceTime(200),
      takeUntil(this.componentDestroy()),
    ).subscribe(([orgId]) => {
      this.organizationId = orgId;
      this.invoicesContainerService.getRowData(this.selectedTabIdx, this.isAgency ? orgId : null);
      this.cdr.markForCheck();
    });
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public handleChangeTab(tabIdx: number): void {
    this.selectedTabIdx = tabIdx;
    this.store.dispatch([
      new Invoices.SetTabIndex(tabIdx),
      new Invoices.CheckManualInvoicesExist(this.organizationId),
    ]);

    this.clearSelections();
    this.clearTab();

    this.gridOptions = {
      ...this.defaultGridOptions,
      ...this.invoicesContainerService.getGridOptions(tabIdx, this.organizationId),
    };

    this.colDefs = this.invoicesContainerService.getColDefsByTab(tabIdx,
      { organizationId: this.organizationId,
        canPay: (this.store.snapshot().invoices as InvoicesModel).permissions.agencyCanPay || this.invoicePayAllowed && this.payInvoiceEnabled,
        canEdit: this.agencyActionsAllowed && this.approveInvoiceEnabled,
      });


    this.tabConfig = this.invoicesContainerService.getTabConfig(tabIdx);

    this.cdr.markForCheck();

    this.resetFilters();
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

  public handleRowSelected(selectedRowData: SelectedInvoiceRow): void {
    const enableSelectionIndex = this.isAgency ? 1 : 2;

    if (this.selectedTabIdx >= enableSelectionIndex) {
      this.invoicesService.setCurrentSelectedIndexValue(selectedRowData.rowIndex);
      const invoices = this.store.selectSnapshot(InvoicesState.pendingApprovalInvoicesData);
      const prevId: number | null = invoices?.items[selectedRowData.rowIndex - 1]?.invoiceId || null;
      const nextId: number | null = invoices?.items[selectedRowData.rowIndex + 1]?.invoiceId || null;

      this.store.dispatch(
        new Invoices.ToggleInvoiceDialog(
          DialogAction.Open,
          this.isAgency,
          {
            invoiceIds: [selectedRowData.data!.invoiceId],
            organizationIds: [this.organizationId],
          },
          prevId,
          nextId
        ));
      this.cdr.markForCheck();
    }
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    this.invoicesService.setNextValue(next);
    this.cdr.markForCheck();
  }

  public handleUpdateTable({ invoiceId, status, organizationId }: InvoiceUpdateEmmit): void {
    this.store.dispatch(new Invoices.ChangeInvoiceState(invoiceId, status, organizationId))
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.store.dispatch(new Invoices.ToggleInvoiceDialog(DialogAction.Close))
        this.getInvoicesByTab();
      });
  }

  public handlePageChange(pageNumber: number): void {
    this.store.dispatch(new Invoices.UpdateFiltersState({
      pageNumber,
    }, true))
      .pipe(
        takeUntil(this.componentDestroy()),
      );
  }

  public handlePageSizeChange(pageSize: number): void {
    this.store.dispatch(new Invoices.UpdateFiltersState({
      pageSize,
    }, true))
      .pipe(
        takeUntil(this.componentDestroy()),
      );
  }

  public handleSortingChange(event: string): void {
    this.store.dispatch(new Invoices.UpdateFiltersState({ orderBy: event }, true));
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
    if (nodes.length) {
      this.selectedInvoiceIds = nodes.map((node) => node.data.invoiceId);
    } else {
      this.selectedInvoiceIds = [];
    }
  }

  public printInvoices(): void {
    const dto: PrintingPostDto = {
      invoiceIds: this.selectedInvoiceIds,
      ...(this.isAgency ? {
        organizationIds: [this.organizationId] as number[],
      } : {
        organizationId: this.organizationId as number,
      })
    };

    this.store.dispatch(new Invoices.GetPrintData(dto, this.isAgency))
    .pipe(
      filter((state) => !!state.invoices.printData),
      map((state) => state.invoices.printData),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((data) => {
      if (this.isAgency) {
        this.printingService.printAgencyInvoice(data);
      } else {
        this.printingService.printInvoice(data);
      }
    });
  }

  private clearTab(): void {
    this.groupingInvoiceRecordsIds = [];
  }

  private getInvoicesByTab(): void {
  }

  private clearSelections(): void {
    this.selectedInvoiceIds = [];
  }

  private watchForInvoiceStatusChange(): void {
    this.actions$
    .pipe(
      ofActionSuccessful(Invoices.ChangeInvoiceState),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.invoicesContainerService.getRowData(this.selectedTabIdx, this.organizationId);
    });
  }

  private checkActionsAllowed(): void {
    combineLatest([
      this.store.select(UserState.agencyActionsAllowed),
      this.store.select(UserState.agencyInvoicesActionsAllowed),
    ])
    .pipe(
      distinctUntilChanged(),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(([agencyActive, payAllowed]) => {
      this.agencyActionsAllowed = agencyActive;
      this.invoicePayAllowed = payAllowed;
    });
  }
}
