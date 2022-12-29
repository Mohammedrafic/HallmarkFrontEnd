import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component, Inject, OnInit, ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import {
  combineLatest, combineLatestWith, debounceTime, distinctUntilChanged, filter,
  map, Observable, switchMap, takeUntil, tap,
} from 'rxjs';

import { ColDef, GridOptions, RowNode, RowSelectedEvent } from '@ag-grid-community/core';
import { DialogAction } from '@core/enums';
import { DataSourceItem } from '@core/interface';
import {
  RejectReasonInputDialogComponent,
} from '@shared/components/reject-reason-input-dialog/reject-reason-input-dialog.component';
import { GRID_CONFIG } from '@shared/constants';
import { PageOfCollections } from '@shared/models/page.model';
import { UNIT_ORGANIZATIONS_FIELDS } from 'src/app/modules/timesheets/constants';
import { UserState } from 'src/app/store/user.state';
import { SetHeaderState, ShowFilterDialog } from '../../../../store/app.actions';
import { InvoicesTableTabsComponent } from '../../components/invoices-table-tabs/invoices-table-tabs.component';
import { defaultGroupInvoicesOption, GroupInvoicesOption, groupInvoicesOptions } from '../../constants';
import { AgencyInvoicesGridTab, OrganizationInvoicesGridTab } from '../../enums';
import { InvoicesPermissionHelper } from '../../helpers/invoices-permission.helper';
import {
  BaseInvoice, GridContainerTabConfig, InvoiceGridSelections, InvoicePaymentData, InvoicesFilterState, InvoiceUpdateEmmit,
  ManualInvoice, ManualInvoicesData, PrintingPostDto, SelectedInvoiceRow,
} from '../../interfaces';
import { PendingApprovalInvoicesData } from '../../interfaces/pending-approval-invoice.interface';
import {
  PendingInvoice, PendingInvoiceRecord,
  PendingInvoicesData
} from '../../interfaces/pending-invoice-record.interface';
import { InvoicePrintingService, InvoicesService } from '../../services';
import { InvoicesContainerService } from '../../services/invoices-container/invoices-container.service';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesModel } from '../../store/invoices.model';
import { InvoicesState } from '../../store/state/invoices.state';
import { InvoiceTabs, InvoiceTabsProvider } from '../../tokens';
import ShowRejectInvoiceDialog = Invoices.ShowRejectInvoiceDialog;
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoices-container',
  templateUrl: './invoices-container.component.html',
  styleUrls: ['./invoices-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesContainerComponent extends InvoicesPermissionHelper implements OnInit, AfterViewInit {
  @ViewChild(InvoicesTableTabsComponent)
  public invoicesTableTabsComponent: InvoicesTableTabsComponent;

  @ViewChild(RejectReasonInputDialogComponent)
  public rejectReasonInputDialogComponent: RejectReasonInputDialogComponent;

  @Select(InvoicesState.invoicesOrganizations)
  public readonly organizations$: Observable<DataSourceItem[]>;

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

  public selectedTabIdx: OrganizationInvoicesGridTab | AgencyInvoicesGridTab = 0;

  public appliedFiltersAmount = 0;

  public readonly organizationControl: FormControl = new FormControl(null);

  public organizationId$: Observable<number>;

  public colDefs: ColDef[] = [];

  public groupingInvoiceRecordsIds: number[] = [];

  /**
   * TODO: move to const file
   */
  public readonly defaultGridOptions: GridOptions = {
    onRowSelected: (event: RowSelectedEvent): void => {
      this.groupingInvoiceRecordsIds = event.api.getSelectedRows()
        .map(({ invoiceRecords }: PendingInvoice) => invoiceRecords?.map((record: PendingInvoiceRecord) => record.id))
        .flat();
    },
  };

  public gridOptions: GridOptions = {};

  public readonly groupInvoicesOptions = groupInvoicesOptions;

  public readonly defaultGroupInvoicesOption: GroupInvoicesOption = defaultGroupInvoicesOption;

  public readonly unitOrganizationsFields = UNIT_ORGANIZATIONS_FIELDS;

  public groupInvoicesBy: GroupInvoicesOption = defaultGroupInvoicesOption;

  public currentSelectedTableRowIndex: Observable<number>
    = this.invoicesService.getCurrentTableIdxStream();
  public isLoading: boolean;
  public organizationId: number;
  public rejectInvoiceId: number;
  public tabConfig: GridContainerTabConfig | null;

  public gridSelections: InvoiceGridSelections = {
    selectedInvoiceIds: [],
    rowNodes: [],
  };

  public isAgency: boolean;

  public invoiceContainerConfig = {
    agencyActionsAllowed: true,
    invoicePayAllowed: true,
    groupInvoicesOverlayVisible: false,
    addPaymentOpen: false,
  };

  public paymentRecords: InvoicePaymentData[] = [];

  public businessUnitId?: number;
  public Org: DataSourceItem[];
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
    this.businessUnitId = JSON.parse(localStorage.getItem('BussinessUnitID') || '') as number;
    window.localStorage.setItem("BussinessUnitID", JSON.stringify(""));
    if (this.isAgency) {
      this.checkActionsAllowed();
    }

    this.checkPermissions(this.isAgency).pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => this.handleChangeTab(0));
    this.watchDialogVisibility();
    this.startFiltersWatching();
    this.watchForInvoiceStatusChange();

    this.watchOrganizationId();
    this.watchAgencyId();
    this.watchForOpenPayment();
    this.watchForSavePaymentAction();
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
          tap((organizations: DataSourceItem[]) => this.Org = organizations,
          ),
          map(([firstOrganization]: DataSourceItem[]) => firstOrganization.id),
          //takeUntil(this.componentDestroy())
        )
        .subscribe((orgId: number) => {
          if (this.businessUnitId) {
            this.organizationControl.setValue((this.Org || []).filter(f => f.id == this.businessUnitId)[0].id, { emitEvent: true, onlySelf: false });
          } else {
            this.organizationControl.setValue(orgId, { emitEvent: true, onlySelf: false });
          }
        });
    }
  }

  public watchOrganizationId(): void {
    this.organizationId$
      .pipe(
        tap((id: number) => {
          const orgIdSet = !!this.organizationId;
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
      {
        organizationId: this.organizationId,
        canPay: (this.store.snapshot().invoices as InvoicesModel).permissions.agencyCanPay
          || this.invoiceContainerConfig.invoicePayAllowed && this.payInvoiceEnabled,
        canEdit: this.invoiceContainerConfig.agencyActionsAllowed && this.approveInvoiceEnabled,
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
      pageNumber: GRID_CONFIG.initialPage,
      pageSize: GRID_CONFIG.initialRowsPerPage,
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
        this.store.dispatch(new Invoices.ToggleInvoiceDialog(DialogAction.Close));
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

  public onInvoiceGrouping({ items }: { items: GroupInvoicesOption[] }): void {
    this.groupInvoicesBy = items[0];
    this.hideGroupingOverlay();
  }

  public showGroupingOverlay(): void {
    setTimeout(() => {
      this.invoiceContainerConfig.groupInvoicesOverlayVisible = true;
      this.cdr.markForCheck();
    });
  }

  public hideGroupingOverlay(): void {
    this.invoiceContainerConfig.groupInvoicesOverlayVisible = false;
  }

  public handleMultiSelectionChanged(nodes: RowNode[]): void {
    if (nodes.length) {
      this.gridSelections.selectedInvoiceIds = nodes.map((node) => node.data.invoiceId);
      this.gridSelections.rowNodes = nodes;
    } else {
      this.gridSelections.selectedInvoiceIds = [];
      this.gridSelections.rowNodes = [];
      this.paymentRecords = [];
    }
  }

  public printInvoices(): void {
    const dto: PrintingPostDto = {
      invoiceIds: this.gridSelections.selectedInvoiceIds,
      ...(this.isAgency ? {
        organizationIds: [this.organizationId] as number[],
      } : {
        organizationId: this.organizationId as number,
      }),
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

  public openAddPayment(createRecords = false): void {
    if (createRecords) {
      this.createInvoicesForPayment();
    }
    this.invoiceContainerConfig.addPaymentOpen = true;
  }

  public closeAddPayment(): void {
    this.invoiceContainerConfig.addPaymentOpen = false;
  }

  private clearTab(): void {
    this.groupingInvoiceRecordsIds = [];
  }

  private clearSelections(): void {
    this.gridSelections.selectedInvoiceIds = [];
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
        this.invoiceContainerConfig.agencyActionsAllowed = agencyActive;
        this.invoiceContainerConfig.invoicePayAllowed = payAllowed;
      });
  }

  private createInvoicesForPayment(): void {
    this.paymentRecords = this.invoicesService.createPaymentRecords(this.gridSelections.rowNodes);
  }

  private watchForOpenPayment(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(Invoices.OpenPaymentAddDialog),
        takeUntil(this.componentDestroy()),
      )
      .subscribe(() => {
        const paymentData = this.store.selectSnapshot(InvoicesState.selectedPayment) as InvoicePaymentData;
        this.paymentRecords = [paymentData];
        this.openAddPayment();
      });
  }

  private watchForSavePaymentAction(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(Invoices.SavePayment),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.invoicesContainerService.getRowData(this.selectedTabIdx, this.isAgency ? this.organizationId : null);
        this.store.dispatch(
          new Invoices.ToggleInvoiceDialog(
            DialogAction.Open,
            this.isAgency,
            {
              invoiceIds: this.gridSelections.selectedInvoiceIds,
              organizationIds: [this.organizationId],
            },
            null,
            null,
          ));
        this.cdr.markForCheck();
      });
  }
}
