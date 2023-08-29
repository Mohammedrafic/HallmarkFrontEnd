import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component, Inject, NgZone, OnInit, ViewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  switchMap,
  take,
  takeUntil,
  tap,
  BehaviorSubject,
  skip,
} from 'rxjs';

import { ColDef, GridOptions, RowNode, RowSelectedEvent } from '@ag-grid-community/core';
import { OutsideZone } from '@core/decorators';
import { DialogAction, FilterPageName, UserPermissions } from '@core/enums';
import { DataSourceItem, Permission, PreservedFiltersByPage } from '@core/interface';
import {
  RejectReasonInputDialogComponent,
} from '@shared/components/reject-reason-input-dialog/reject-reason-input-dialog.component';
import { GRID_CONFIG } from '@shared/constants';
import { PageOfCollections } from '@shared/models/page.model';
import { baseDropdownFieldsSettings } from '@shared/constants/base-dropdown-fields-settings';

import { UserState } from 'src/app/store/user.state';
import { SetHeaderState, ShowFilterDialog, ShowToast } from '../../../../store/app.actions';
import { InvoicesTableTabsComponent } from '../../components/invoices-table-tabs/invoices-table-tabs.component';
import {
  CreatGroupingOptions, DetectFormConfigBySelectedType, GroupInvoicesOption,
  InvoiceDefaulPerPageOptions, InvoicesPerPageOptions,
} from '../../constants';
import { AgencyInvoicesGridTab, InvoicesAgencyTabId, OrganizationInvoicesGridTab } from '../../enums';
import { InvoicesPermissionHelper } from '../../helpers/invoices-permission.helper';
import { InvoicePrintingService, InvoicesApiService, InvoicesService } from '../../services';
import { InvoicesContainerService } from '../../services/invoices-container/invoices-container.service';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesModel } from '../../store/invoices.model';
import { InvoicesState } from '../../store/state/invoices.state';
import { InvoiceTabs, InvoiceTabsProvider } from '../../tokens';
import * as Interfaces from '../../interfaces';
import ShowRejectInvoiceDialog = Invoices.ShowRejectInvoiceDialog;
import { GridReadyEventModel } from '@shared/components/grid/models';
import { BulkActionConfig, BulkActionDataModel } from '@shared/models/bulk-action-data.model';
import { BulkTypeAction } from '@shared/enums/bulk-type-action.enum';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import * as PreservedFilters from 'src/app/store/preserved-filters.actions';
import { FilterService } from '@shared/services/filter.service';
import { ClearOrganizationStructure } from 'src/app/store/user.actions';
import { MessageTypes } from '@shared/enums/message-types';

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

  @Select(PreservedFiltersState.preservedFiltersByPageName)
  private readonly preservedFiltersByPageName$: Observable<PreservedFiltersByPage<Interfaces.InvoicesFilterState>>;

  @Select(InvoicesState.selectedOrgId)
  public selectedOrg$: Observable<number>;

  public selectedTabIdx: OrganizationInvoicesGridTab | AgencyInvoicesGridTab = 0;

  public selectedTabId: Interfaces.InvoiceTabId = 0;

  public appliedFiltersAmount = 0;

  public readonly organizationControl: FormControl = new FormControl(null);
  public readonly organizationMultiSelectControl: FormControl = new FormControl(null);

  public organizationId$: Observable<any>;

  public colDefs: ColDef[] = [];

  public groupingInvoiceRecordsIds: number[] = [];

  public canPay = false;

  public readonly defaultGridOptions: GridOptions = {
    onRowSelected: (event: RowSelectedEvent): void => {
      this.groupingInvoiceRecordsIds = event.api.getSelectedRows()
        .map(({ invoiceRecords }: Interfaces.PendingInvoice) =>
          invoiceRecords?.map((record: Interfaces.PendingInvoiceRecord) => record.id)
        ).flat();
    },
  };

  public gridOptions: GridOptions = {};

  public groupInvoicesOptions: GroupInvoicesOption[] = [];

  public groupInvoicesBy: GroupInvoicesOption;

  public readonly unitOrganizationsFields = baseDropdownFieldsSettings;

  public readonly bulkActionConfig: BulkActionConfig = {
    approve: true,
  };

  public currentSelectedTableRowIndex = this.invoicesService.getCurrentTableIdxStream();
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
  public agencyOrganizationIds:Array<number> = [];

  public organizationsList: DataSourceItem[];

  public navigatedInvoiceId: number | null;

  public recordsPerPageOptions = InvoicesPerPageOptions;

  public organizationId: number;
  public agencyId: number;
  public invoicesOrgIds:number[];

  public populateFilterForm$: BehaviorSubject<PreservedFiltersByPage<Interfaces.InvoicesFilterState> | null>
    = new BehaviorSubject<PreservedFiltersByPage<Interfaces.InvoicesFilterState> | null>(null);

  private navigatedOrgId: number | null;

  private previousSelectedTabIdx: OrganizationInvoicesGridTab | AgencyInvoicesGridTab;

  private gridInstance: GridReadyEventModel;

  private filterState: Interfaces.InvoicesFilterState = {};
  public userPermission: Permission = {};
  public readonly userPermissions = UserPermissions;
  public allOption: string = "All";

  constructor(
    private cdr: ChangeDetectorRef,
    private invoicesService: InvoicesService,
    private actions$: Actions,
    private invoicesContainerService: InvoicesContainerService,
    private printingService: InvoicePrintingService,
    private ngZone: NgZone,
    private invoiceApiService: InvoicesApiService,
    private filterService: FilterService,
    @Inject(InvoiceTabs) public tabsConfig$: InvoiceTabsProvider,
    @Inject(DOCUMENT) private document: Document,
    store: Store,
    private route: ActivatedRoute,
  ) {
    super(store);

    this.store.dispatch(new SetHeaderState({ iconName: 'dollar-sign', title: 'Invoices' }));
    this.isAgency = (this.store.snapshot().invoices as InvoicesModel).isAgencyArea;

    if (this.isAgency) {
      this.organizationId$ = this.organizationMultiSelectControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter(Boolean),
        tap((id) => {
          if(id.length == 0){
            this.store.dispatch(new ShowToast(MessageTypes.Error, 'Please select atleast one Organization'));
            return; 
          }
          this.store.dispatch(new Invoices.GetOrganizationStructure(id[id.length - 1], true));
        }),
      );
      this.recordsPerPageOptions = InvoiceDefaulPerPageOptions;
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
    this.watchForPreservedFilters();
    this.getuserPermission();
  }

  ngAfterViewInit(): void {
    if (this.organizationId) {
      this.invoicesTableTabsComponent.preselectTab(this.selectedTabIdx);
    }
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(new PreservedFilters.ResetPageFilters());
  }

  public watchAgencyId(): void {
    if (this.isAgency) {
      this.agencyId$
        .pipe(
          distinctUntilChanged(),
          filter(Boolean),
          tap(() => {
            this.organizationId = 0;
            this.organizationControl.reset();
            this.organizationsList = [];
            this.store.dispatch(new Invoices.SelectOrganization(0));
          }),
         switchMap(() => this.store.dispatch(new Invoices.GetOrganizations())),
          switchMap(() => this.organizations$),
          filter((organizations: DataSourceItem[]) => !!organizations.length),
          tap((organizations: DataSourceItem[]) => {
            this.organizationsList = organizations;
          }),
          map(([firstOrganization]: DataSourceItem[]) => firstOrganization.id),
          takeUntil(this.componentDestroy()),
        )
        .subscribe((orgId: number) => {
          this.agencyOrganizationIds = [];
          const value = this.businessUnitId
            ? (this.organizationsList || []).filter(org => org.id === this.businessUnitId)[0].id
            : orgId;

          this.organizationControl.setValue(this.navigatedOrgId || value, { emitEvent: true, onlySelf: false });
            if(this.navigatedOrgId){
              this.organizationMultiSelectControl.setValue([this.navigatedOrgId]);
            }else{
              this.organizationMultiSelectControl.setValue([value]);
            }
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
      filter((id) => {
        if (this.navigatedOrgId) {
          return id === this.navigatedOrgId;
        }

        return this.isAgency ? id.length > 0 ? true : false : !!id;
      }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((id) => {
      this.clearStructure();
      this.store.dispatch(new PreservedFilters.ResetPageFilters());
      this.store.dispatch(new PreservedFilters.GetPreservedFiltersByPage(this.getPageName()));
      if (this.isAgency) {
        this.organizationId = id[id.length - 1];
        this.store.dispatch(new Invoices.SelectOrganization(id[id.length - 1]));
      }else{
        this.organizationId = id;
        this.store.dispatch(new Invoices.SelectOrganization(id));
        this.resetFilters(true);
      }
      this.navigatedInvoiceId = null;
      this.navigatedOrgId = null;
      this.getGroupingOptions();
    });
    this.invoicesFilters$
      .pipe(
        distinctUntilChanged(),
        filter(() => !!this.organizationId),
        skip(1),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.invoicesContainerService.getRowData(this.selectedTabIdx, this.isAgency ? this.organizationId : null, this.isAgency ? this.agencyOrganizationIds : null);
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

    if (!this.isAgency && this.selectedTabIdx === OrganizationInvoicesGridTab.PendingRecords) {
      this.recordsPerPageOptions = InvoicesPerPageOptions;
      this.getGroupingOptions();
    } else {
      this.recordsPerPageOptions = InvoiceDefaulPerPageOptions;
    }

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
    this.resetFilters(true);
    this.cdr.markForCheck();
  }

  public openAddDialog(): void {
    this.store.dispatch(new Invoices.ToggleManualInvoiceDialog(DialogAction.Open));
    this.store.dispatch(new Invoices.GetInvoicesReasons(this.organizationControl.value 
      || this.store.selectSnapshot(UserState.lastSelectedOrganizationId)));
  }

  public changeFiltersAmount(amount: number): void {
    this.appliedFiltersAmount = amount;
  }

  public resetFilters(keepFilters = false): void {
    this.gridInstance?.columnApi.resetColumnState();
    let filters = {};

    if (keepFilters) {
      const preservedFilters = this.store.selectSnapshot(
        PreservedFiltersState.preservedFiltersByPageName) as
        PreservedFiltersByPage<Interfaces.InvoicesFilterState>;

      const filtersFormConfig = DetectFormConfigBySelectedType(this.selectedTabId, this.isAgency,this.agencyOrganizationIds?.length);
      this.filterState = this.filterService.composeFilterState(
        filtersFormConfig,
        preservedFilters.state as Record<string, unknown>
      );

      filters = this.filterState;
    }

    this.store.dispatch(
      new Invoices.UpdateFiltersState({
        pageNumber: GRID_CONFIG.initialPage,
        pageSize: GRID_CONFIG.initialRowsPerPage,
        orderBy: '',
        ...this.navigatedInvoiceId !== null ? { invoiceIds: [this.navigatedInvoiceId] } : filters,
        ...this.isAgency && this.navigatedOrgId ? { organizationId: this.navigatedOrgId } : filters,
      })
    );
    this.cdr.markForCheck();
  }

  public gridReady(event: GridReadyEventModel): void {
    this.gridInstance = event;
  }

  public updateTableByFilters(filters: Interfaces.InvoicesFilterState): void {
    filters.agencyOrganizationIds = this.agencyOrganizationIds;
    this.store.dispatch(new Invoices.UpdateFiltersState({ ...filters }));
    this.store.dispatch(new PreservedFilters.SaveFiltersByPageName(
      this.getPageName(),
      { ...filters }),
    );
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
            organizationIds: [this.isAgency ? selectedRowData.data!.organizationId : this.organizationId],
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
      ...this.filterState,
      pageNumber,
    }, true));
    this.changeMultiSelection([]);
    this.clearGroupedInvoices();
  }

  public changePageSize(pageSize: number): void {
    const useFilterState = !!this.navigatedInvoiceId;

    this.store.dispatch(new Invoices.UpdateFiltersState({
      ...this.filterState,
      pageSize,
    }, useFilterState));
    this.previousSelectedTabIdx = this.selectedTabIdx;
    this.changeMultiSelection([]);
    this.clearGroupedInvoices();
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
        this.invoicesContainerService.getRowData(this.selectedTabIdx, this.organizationId, this.isAgency ? this.agencyOrganizationIds : null);
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
      if(this.selectedTabIdx === OrganizationInvoicesGridTab.PendingRecords)
      this.gridSelections.selectedInvoiceIds = nodes.map((node) => node.data.id);
      else
        this.gridSelections.selectedInvoiceIds = nodes.map((node) => node.data.invoiceId);
      this.gridSelections.rowNodes = nodes;
    } else {
      this.gridSelections.selectedInvoiceIds = [];
      this.gridSelections.rowNodes = [];
      this.paymentRecords = [];
    }
  }

  public printInvoices(): void {

    if(this.isAgency){
      this.invoicesOrgIds = [];
      this.gridSelections.rowNodes.forEach(element => {
        if (!this.invoicesOrgIds.includes(element.data.organizationId)) {
          this.invoicesOrgIds.push(element.data.organizationId);
        }
      });
    }
    const dto: Interfaces.PrintingPostDto = {
      invoiceIds: this.gridSelections.selectedInvoiceIds,
      ...(this.isAgency ? {
        organizationIds: this.invoicesOrgIds as number[],
      } : {
        organizationId: this.organizationId as number,
      }),
    };    
    if(this.selectedTabIdx === OrganizationInvoicesGridTab.PendingRecords)
    {
      dto.ids = this.gridSelections.selectedInvoiceIds;
      delete dto.invoiceIds;
    }

    this.store.dispatch(new Invoices.GetPrintData(dto, this.isAgency,this.selectedTabIdx))
      .pipe(
        filter((state) => !!state.invoices.printData),
        map((state) => state.invoices.printData),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((data) => {
        if (this.isAgency) {
          this.printingService.printAgencyInvoice(data);
        } else {
          this.printingService.printInvoice(data,this.selectedTabIdx);
          if(this.selectedTabIdx === OrganizationInvoicesGridTab.PendingRecords){
            this.resetTableSelection();
          }
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

  public handleBulkAction(event: BulkActionDataModel): void {
    if (event.type === BulkTypeAction.APPROVE) {
      this.bulkApprove(event.items);
    }
  }

  public toggleDropdownList(): void {
    if (this.invoiceContainerConfig.groupInvoicesOverlayVisible) {
      this.hideGroupingOverlay();
    } else {
      this.showGroupingOverlay();
    }
  }

  private bulkApprove(nodes: RowNode[]): void {
    this.store.dispatch(
      new Invoices.ApproveInvoices(nodes.map((node: RowNode) => (node.data as Interfaces.ManualInvoice).id))
    );
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
        this.invoicesContainerService.getRowData(this.selectedTabIdx, this.organizationId, this.isAgency ? this.agencyOrganizationIds : null);
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
      this.invoicesContainerService.getRowData(this.selectedTabIdx, this.isAgency ? this.organizationId : null, this.isAgency ? this.agencyOrganizationIds : null);
      const isDialogOpen = this.store.selectSnapshot(InvoicesState.isInvoiceDetailDialogOpen);
      // Update data only for already open invoice dialog.
      if (isDialogOpen.dialogState) {
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
      }

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
    this.canPay = (this.store.snapshot().invoices as InvoicesModel).permissions.agencyCanPay
      || this.invoiceContainerConfig.invoicePayAllowed && this.payInvoiceEnabled;
    this.colDefs = this.invoicesContainerService.getColDefsByTab(this.selectedTabIdx,
      {
        organizationId: this.organizationId,
        canPay: this.canPay,
        canEdit: this.invoiceContainerConfig.agencyActionsAllowed && this.approveInvoiceEnabled,
      });
  }

  private initDefaultSelectedTabId(): void {
    if (!this.navigatedInvoiceId) {
      this.selectedTabId = this.isAgency ? InvoicesAgencyTabId.ManualInvoicePending : 0;
    }
  }

  private checkForNavigatedInvoice(): void {
    const invoiceId: string | undefined = this.route.snapshot.queryParams['invoiceId'];
    const orgId: string | undefined = this.route.snapshot.queryParams['orgId'];

    this.navigatedInvoiceId = invoiceId ? Number(invoiceId) : null;
    this.navigatedOrgId = orgId ? Number(orgId) : null;
    const tabId = this.navigatedInvoiceId !== null ? this.invoicesContainerService.getAllTabId() : 0;
    this.selectedTabId = this.isAgency ? InvoicesAgencyTabId.ManualInvoicePending : tabId;
    this.selectTab(tabId);
  }

  private getGroupingOptions(): void {
    if (!this.isAgency && this.organizationId && this.selectedTabIdx === OrganizationInvoicesGridTab.PendingRecords) {
      this.invoiceApiService.getGroupingOptionsIds(this.organizationId)
      .pipe(
        take(1)
      )
      .subscribe((optionIds) => {
        this.groupInvoicesOptions = CreatGroupingOptions(optionIds);
        this.groupInvoicesBy = this.groupInvoicesOptions[0];
        this.cdr.markForCheck();
      });
    }
  }

  private getPageName(): FilterPageName {
    if (this.isAgency) {
      return FilterPageName.InvoicesVMSAgency;
    } else {
      return FilterPageName.InvoicesVMSOrganization;
    }
  }

  private watchForPreservedFilters(): void {
    this.preservedFiltersByPageName$.pipe(
      filter((filters) => filters.dispatch),
      takeUntil(this.componentDestroy())
    )
    .subscribe((filterState) => {
      let filters: Interfaces.InvoicesFilterState = {};
      if(filterState.isNotPreserved && filterState.state === null){
            filters.agencyOrganizationIds =  this.organizationMultiSelectControl.value;
            this.store.dispatch(new PreservedFilters.SaveFiltersByPageName(this.getPageName(),filters),);
      }else if(filterState.state != null){
        if(this.agencyOrganizationIds.length == 0 && filterState.state.agencyOrganizationIds != null && filterState.state.agencyOrganizationIds.length > 0){
          this.agencyOrganizationIds = filterState.state.agencyOrganizationIds;
          this.organizationMultiSelectControl.setValue(filterState.state.agencyOrganizationIds);
        }else if(filterState.state.agencyOrganizationIds != null && JSON.stringify(filterState.state.agencyOrganizationIds) != JSON.stringify(this.organizationMultiSelectControl.value)){
          filters.agencyOrganizationIds = this.organizationMultiSelectControl.value;
          filterState.state.agencyOrganizationIds = filters.agencyOrganizationIds;
          this.store.dispatch(new PreservedFilters.SaveFiltersByPageName(this.getPageName(),filterState.state),);
        }
        if(this.organizationMultiSelectControl?.value?.length > 1){
          delete filterState.state?.locationIds;
          delete filterState.state?.regionIds;
          delete filterState.state?.departmentIds;
        }
      }
      this.agencyOrganizationIds = this.organizationMultiSelectControl.value;
      this.store.dispatch(new Invoices.UpdateFiltersState({ ...filterState.state }));
    });
  }

  public clearStructure(): void {
    if(this.isAgency) {
      this.store.dispatch(new Invoices.ClearOrganizationStructure());
    } else {
      this.store.dispatch(new ClearOrganizationStructure());
    }
  }
  private getuserPermission(): void {
    this.store.select(UserState.userPermission).pipe(
      filter((permissions: Permission) => !!Object.keys(permissions).length), take(1)
    ).subscribe((permissions: Permission) => {
      this.userPermission = permissions;
    });
  }
}
