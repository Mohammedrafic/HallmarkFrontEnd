import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { combineLatest, distinctUntilChanged, filter, map, Observable, switchMap, takeUntil, tap } from 'rxjs';

import { ColDef, GridOptions, RowNode, RowSelectedEvent } from '@ag-grid-community/core';
import { OutsideZone } from '@core/decorators';
import { DialogAction } from '@core/enums';
import { DataSourceItem } from '@core/interface';
import {
  RejectReasonInputDialogComponent,
} from '@shared/components/reject-reason-input-dialog/reject-reason-input-dialog.component';
import { GRID_CONFIG } from '@shared/constants';
import { PageOfCollections } from '@shared/models/page.model';
import { baseDropdownFieldsSettings } from '@shared/constants/base-dropdown-fields-settings';

import { UserState } from 'src/app/store/user.state';
import { SetHeaderState, ShowFilterDialog } from '../../../../store/app.actions';
import { InvoicesTableTabsComponent } from '../../components/invoices-table-tabs/invoices-table-tabs.component';
import { defaultGroupInvoicesOption, GroupInvoicesOption, GroupInvoicesOptions } from '../../constants';
import { AgencyInvoicesGridTab, InvoicesAgencyTabId, OrganizationInvoicesGridTab } from '../../enums';
import { InvoicesPermissionHelper } from '../../helpers/invoices-permission.helper';
import { InvoicePrintingService, InvoicesService } from '../../services';
import { InvoicesContainerService } from '../../services/invoices-container/invoices-container.service';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesModel } from '../../store/invoices.model';
import { InvoicesState } from '../../store/state/invoices.state';
import { InvoiceTabs, InvoiceTabsProvider } from '../../tokens';
import { InvoicesFiltersDialogComponent } from '../../components/invoices-filters-dialog/invoices-filters-dialog.component';
import * as Interfaces from '../../interfaces';
import ShowRejectInvoiceDialog = Invoices.ShowRejectInvoiceDialog;

@Component({
  selector: 'app-invoices-container',
  templateUrl: './invoices-container.component.html',
  styleUrls: ['./invoices-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesContainerComponent extends InvoicesPermissionHelper implements OnInit, AfterViewInit {
  @ViewChild(InvoicesTableTabsComponent)
  public invoicesTableTabsComponent: InvoicesTableTabsComponent;

  @ViewChild(InvoicesFiltersDialogComponent)
  public invoicesFiltersDialogComponent: InvoicesFiltersDialogComponent;

  @ViewChild(RejectReasonInputDialogComponent)
  public rejectReasonInputDialogComponent: RejectReasonInputDialogComponent;

  @Select(InvoicesState.invoicesOrganizations)
  public readonly organizations$: Observable<DataSourceItem[]>;

  @Select(InvoicesState.pendingInvoicesData)
  public readonly pendingInvoicesData$: Observable<Interfaces.PendingInvoicesData>;

  @Select(InvoicesState.invoicesContainerData)
  public readonly invoicesContainerData$: Observable<PageOfCollections<Interfaces.BaseInvoice>>;

  @Select(InvoicesState.manualInvoicesData)
  public readonly manualInvoicesData$: Observable<Interfaces.ManualInvoicesData>;

  @Select(InvoicesState.pendingApprovalInvoicesData)
  public readonly pendingApprovalInvoicesData$: Observable<Interfaces.PendingApprovalInvoicesData>;

  @Select(InvoicesState.invoicesFilters)
  public readonly invoicesFilters$: Observable<Interfaces.PendingInvoicesData>;

  @Select(UserState.lastSelectedOrganizationId)
  public readonly organizationChangeId$: Observable<number>;

  @Select(UserState.lastSelectedAgencyId)
  public readonly agencyId$: Observable<number>;

  public selectedTabIdx: OrganizationInvoicesGridTab | AgencyInvoicesGridTab = 0;

  public selectedTabId: Interfaces.InvoiceTabId = 0;

  public appliedFiltersAmount = 0;

  public readonly organizationControl: FormControl = new FormControl(null);

  public organizationId$: Observable<number>;

  public colDefs: ColDef[] = [];

  public groupingInvoiceRecordsIds: number[] = [];

  public readonly defaultGridOptions: GridOptions = {
    onRowSelected: (event: RowSelectedEvent): void => {
      this.groupingInvoiceRecordsIds = event.api.getSelectedRows()
        .map(({ invoiceRecords }: Interfaces.PendingInvoice) =>
          invoiceRecords?.map((record: Interfaces.PendingInvoiceRecord) => record.id)
        ).flat();
    },
  };

  public gridOptions: GridOptions = {};

  public readonly groupInvoicesOptions = GroupInvoicesOptions;

  public readonly defaultGroupInvoicesOption: GroupInvoicesOption = defaultGroupInvoicesOption;

  public readonly unitOrganizationsFields = baseDropdownFieldsSettings;

  public groupInvoicesBy: GroupInvoicesOption = defaultGroupInvoicesOption;

  public currentSelectedTableRowIndex: Observable<number>
    = this.invoicesService.getCurrentTableIdxStream();
  public isLoading: boolean;
  
  public rejectInvoiceId: number;
  public tabConfig: Interfaces.GridContainerTabConfig | null;

  public gridSelections: Interfaces.InvoiceGridSelections = {
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

  public paymentRecords: Interfaces.InvoicePaymentData[] = [];

  public businessUnitId?: number;

  public organizationsList: DataSourceItem[];

  public navigatedInvoiceId: number | null;

  private navigatedOrgId: number | null;

  private previousSelectedTabIdx: OrganizationInvoicesGridTab | AgencyInvoicesGridTab;

  private organizationId: number;

  constructor(
    private cdr: ChangeDetectorRef,
    private invoicesService: InvoicesService,
    private actions$: Actions,
    private invoicesContainerService: InvoicesContainerService,
    private printingService: InvoicePrintingService,
    private ngZone: NgZone,
    @Inject(InvoiceTabs) public tabsConfig$: InvoiceTabsProvider,
    @Inject(DOCUMENT) private document: Document,
    store: Store,
    private route: ActivatedRoute,
  ) {
    super(store);

    this.store.dispatch(new SetHeaderState({ iconName: 'dollar-sign', title: 'Invoices' }));
    this.isAgency = (this.store.snapshot().invoices as InvoicesModel).isAgencyArea;

    if (this.isAgency) {
      this.organizationId$ = this.organizationControl.valueChanges
      .pipe(
        tap((id) => {
          this.store.dispatch(new Invoices.GetOrganizationStructure(id, true)); 
        }),
      );
    } else {
      this.organizationId$ = this.organizationChangeId$;
    }

    this.initDefaultSelectedTabId();
    this.checkForNavigatedInvoice();
    this.tabConfig = this.invoicesContainerService.getTabConfig(this.selectedTabIdx);
  }

  public ngOnInit(): void {
    this.businessUnitId = JSON.parse((localStorage.getItem('BussinessUnitID') || '0')) as number;
    if (!this.businessUnitId) {
      this.businessUnitId = 0;
    }

    this.document.defaultView?.localStorage.setItem("BussinessUnitID", JSON.stringify(""));


    if (this.isAgency) {
      this.checkActionsAllowed();
    }
    this.setGridConfig();
    this.watchDialogVisibility();
    this.startFiltersWatching();
    this.watchForInvoiceStatusChange();
    this.setPermissions();
    this.watchAgencyId();
    this.watchForOpenPayment();
    this.watchForSavePaymentAction();
  }

  ngAfterViewInit(): void {
    this.invoicesTableTabsComponent.preselectTab(this.selectedTabIdx);
  }

  public watchAgencyId(): void {
    if (this.isAgency) {
      this.agencyId$
        .pipe(
          distinctUntilChanged(),
          switchMap(() => this.store.dispatch(new Invoices.GetOrganizations())),
          switchMap(() => this.organizations$),
          filter((organizations: DataSourceItem[]) => !!organizations.length),
          tap((organizations: DataSourceItem[]) => {
            this.organizationsList = organizations;
          }),
          map(([firstOrganization]: DataSourceItem[]) => firstOrganization.id),
        )
        .subscribe((orgId: number) => {
          const value = this.businessUnitId
            ? (this.organizationsList || []).filter(org => org.id === this.businessUnitId)[0].id
            : orgId;

          this.organizationControl.setValue(this.navigatedOrgId || value, { emitEvent: true, onlySelf: false });
        });
    }
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

  public startFiltersWatching(): void {
    this.organizationId$
    .pipe(
      distinctUntilChanged(),
      filter((id) => !!id),
    )
    .subscribe((id) => {
      this.organizationId = id;
      this.store.dispatch(new Invoices.SelectOrganization(id));
      this.resetFilters();
      this.navigatedInvoiceId = null;
      this.navigatedOrgId = null;
    });

    this.invoicesFilters$
    .pipe(
      filter(() => {
        if (this.isAgency) {
          return !!this.organizationId;
        }
        return true;
      }),
    ).subscribe(() => {
      this.isAgency = (this.store.snapshot().invoices as InvoicesModel).isAgencyArea;
      this.invoicesContainerService.getRowData(this.selectedTabIdx, this.isAgency ? this.organizationId : null);
      this.setGridConfig();
      this.cdr.markForCheck();
    });
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public selectTab(tabIdx: number, tabsConfig: unknown[] = []): void {
    this.previousSelectedTabIdx = this.selectedTabIdx;
    if (this.selectedTabIdx === tabIdx) {
      return;
    }

    this.selectedTabIdx = tabIdx;

    if (tabsConfig.length) {
      this.selectedTabId = (tabsConfig[tabIdx] as Interfaces.InvoicesTabItem).tabId;
    } else {
      this.initDefaultSelectedTabId();
    }
    this.store.dispatch([
      new Invoices.SetTabIndex(tabIdx),
    ]);

    this.clearSelections();
    this.clearGroupedInvoices();
    this.setGridConfig();

    this.tabConfig = this.invoicesContainerService.getTabConfig(tabIdx);
    this.resetFilters();
    this.cdr.markForCheck();
  }

  public openAddDialog(): void {
    this.store.dispatch(new Invoices.ToggleManualInvoiceDialog(DialogAction.Open));
    this.store.dispatch(new Invoices.GetInvoicesReasons(this.organizationControl.value));
  }

  public changeFiltersAmount(amount: number): void {
    this.appliedFiltersAmount = amount;
  }

  public resetFilters(): void {
    this.store.dispatch(
      new Invoices.UpdateFiltersState({
        pageNumber: GRID_CONFIG.initialPage,
        pageSize: GRID_CONFIG.initialRowsPerPage,
        ...this.navigatedInvoiceId !== null ? { invoiceIds: [this.navigatedInvoiceId] } : {},
        ...this.isAgency && this.navigatedOrgId ? { organizationId: this.navigatedOrgId } : {},
      })
    );
  }

  public updateTableByFilters(filters: Interfaces.InvoicesFilterState): void {
    this.store.dispatch(new Invoices.UpdateFiltersState({ ...filters }));
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public selectRow(selectedRowData: Interfaces.SelectedInvoiceRow): void {
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

  public updateTable({ invoiceId, status, organizationId }: Interfaces.InvoiceUpdateEmmit): void {
    this.store.dispatch(new Invoices.ChangeInvoiceState(invoiceId, status, organizationId))
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.store.dispatch(new Invoices.ToggleInvoiceDialog(DialogAction.Close));
      });
  }

  public changePage(pageNumber: number): void {
    this.store.dispatch(new Invoices.UpdateFiltersState({
      pageNumber,
    }, true));
  }

  public changePageSize(pageSize: number): void {
    const filterstate = this.store.selectSnapshot(InvoicesState.invoicesFilters);
    if (filterstate?.pageSize === pageSize) {
      return;
    }
    const useFilterState = !!this.navigatedInvoiceId;
    this.store.dispatch(new Invoices.UpdateFiltersState({
      pageSize,
    }, useFilterState));
    this.previousSelectedTabIdx = this.selectedTabIdx;
  }

  public changeSorting(event: string): void {
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
      new Invoices.ApproveInvoices(nodes.map((node: RowNode) => (node.data as Interfaces.ManualInvoice).id))
    );
  }

  public bulkExport(event: RowNode[]): void {}

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

  public selectGroupOption({ items }: { items: GroupInvoicesOption[] }): void {
    this.groupInvoicesBy = items[0];
    this.hideGroupingOverlay();
  }

  @OutsideZone
  public showGroupingOverlay(): void {
    setTimeout(() => {
      this.invoiceContainerConfig.groupInvoicesOverlayVisible = true;
      this.cdr.markForCheck();
    });
  }

  public hideGroupingOverlay(): void {
    this.invoiceContainerConfig.groupInvoicesOverlayVisible = false;
  }

  public changeMultiSelection(nodes: RowNode[]): void {
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
    const dto: Interfaces.PrintingPostDto = {
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

  public resetTableSelection(): void {
    this.gridSelections.rowNodes.forEach((node: RowNode) => {
      node.setSelected(false);
    });

    this.clearSelections();
    this.gridSelections.rowNodes = [];
  }

  private clearGroupedInvoices(): void {
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
        const paymentData = this.store.selectSnapshot(InvoicesState.selectedPayment) as Interfaces.InvoicePaymentData;
        this.paymentRecords = [paymentData];
        this.openAddPayment();
      });
  }

  private watchForSavePaymentAction(): void {
    this.actions$.pipe(ofActionSuccessful(Invoices.SavePayment), takeUntil(this.componentDestroy())).subscribe(() => {
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
          null
        )
      );
      this.cdr.markForCheck();
    });
  }

  private setPermissions(): void {
    this.checkPermissions(this.isAgency).pipe(
      takeUntil(this.componentDestroy())
    ).subscribe();
  }

  private setGridConfig(): void {
    this.gridOptions = {
      ...this.defaultGridOptions,
      ...this.invoicesContainerService.getGridOptions(this.selectedTabIdx, this.organizationId),
    };

    this.colDefs = this.invoicesContainerService.getColDefsByTab(this.selectedTabIdx,
      {
        organizationId: this.organizationId,
        canPay: (this.store.snapshot().invoices as InvoicesModel).permissions.agencyCanPay
          || this.invoiceContainerConfig.invoicePayAllowed && this.payInvoiceEnabled,
        canEdit: this.invoiceContainerConfig.agencyActionsAllowed && this.approveInvoiceEnabled,
      });
  }

  private initDefaultSelectedTabId(): void {
    if (!this.navigatedInvoiceId ) {
      this.selectedTabId = this.isAgency ? InvoicesAgencyTabId.ManualInvoicePending : 0;
    }
  }

  private checkForNavigatedInvoice(): void {
    const invoiceId: string | undefined = this.route.snapshot.queryParams['invoiceId'];
    const orgId: string | undefined = this.route.snapshot.queryParams['orgId'];

    this.navigatedInvoiceId = invoiceId ? Number(invoiceId) : null;
    this.navigatedOrgId = orgId ? Number(orgId) : null;
    const tabId = this.navigatedInvoiceId !== null ? this.invoicesContainerService.getAllTabId() : 0;
    this.selectedTabId = this.isAgency ? InvoicesAgencyTabId.AllInvoices : tabId;
    this.selectTab(tabId);
  }
}
