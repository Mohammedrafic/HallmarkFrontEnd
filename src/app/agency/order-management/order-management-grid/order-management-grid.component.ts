import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { debounceTime, filter, Observable, skip, Subject, takeUntil, takeWhile, tap } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import {
  DetailRowService,
  GridComponent,
  PagerComponent,
  RowDataBoundEventArgs,
  SelectionSettingsModel,
  TextWrapSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { CheckBoxComponent } from '@syncfusion/ej2-angular-buttons';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { STATUS_COLOR_GROUP } from '@shared/enums/status';
import { GRID_CONFIG } from '@shared/constants';
import {
  myAgencyChildColumnsToExport,
  myAgencyColumnsToExport,
  MyAgencyOrdersColumnsConfig,
  perDiemChildColumnsToExport,
  PerDiemColumnsConfig,
  perDiemColumnsToExport,
  PermPlacementColumnsConfig,
  reOrdersChildColumnToExport,
  ReOrdersColumnsConfig,
  reOrdersColumnsToExport,
  ROW_HEIGHT,
  typeValueAccess,
} from './order-management-grid.constants';
import {
  ClearOrders,
  ExportAgencyOrders,
  GetAgencyFilterOptions,
  GetAgencyOrderCandidatesList,
  GetAgencyOrderGeneralInformation,
  GetAgencyOrdersPage,
  GetOrderById,
  ReloadOrderCandidatesLists,
} from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import {
  AgencyOrderFilters,
  AgencyOrderManagement,
  AgencyOrderManagementPage,
  Order,
  OrderManagementChild,
} from '@shared/models/order-management.model';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { DatePipe, Location } from '@angular/common';
import { UserState } from 'src/app/store/user.state';
import { isUndefined } from 'lodash';
import { FilterService } from '@shared/services/filter.service';
import { ShowExportDialog, ShowFilterDialog } from 'src/app/store/app.actions';
import { FilteredItem } from '@shared/models/filter.model';
import { AgencyOrderFiltersComponent } from './agency-order-filters/agency-order-filters.component';
import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderType } from '@shared/enums/order-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { PreviewOrderDialogComponent } from '@agency/order-management/order-management-grid/preview-order-dialog/preview-order-dialog.component';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { UpdateGridCommentsCounter } from '@shared/components/comments/store/comments.actions';

@Component({
  selector: 'app-order-management-grid',
  templateUrl: './order-management-grid.component.html',
  styleUrls: ['./order-management-grid.component.scss'],
  providers: [ChipsCssClass, DetailRowService],
})
export class OrderManagementGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() filteredItems$: Subject<number>;
  @Input() selectedTab: AgencyOrderManagementTabs;
  @Input() exportButtonClicked: boolean;
  @Input() onExportClicked$: Subject<any>;
  @Input() search$: Subject<string>;
  @Output() selectTab = new EventEmitter<number>();

  @Output() reOrderNumber = new EventEmitter<number>();

  @ViewChild('grid') override gridWithChildRow: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @ViewChildren('rowCheckbox') rowCheckboxes: QueryList<CheckBoxComponent>;
  @ViewChild('detailsDialog') detailsDialog: PreviewOrderDialogComponent;

  @Select(OrderManagementState.ordersPage)
  public ordersPage$: Observable<AgencyOrderManagementPage>;

  @Select(UserState.lastSelectedAgencyId)
  lastSelectedAgencyId$: Observable<number>;

  @Select(OrderManagementState.ordersTab)
  ordersTab$: Observable<AgencyOrderManagementTabs>;

  public wrapSettings: TextWrapSettingsModel = GRID_CONFIG.wordWrapSettings;
  public allowWrap = GRID_CONFIG.isWordWrappingEnabled;
  public selectionOptions: SelectionSettingsModel = {
    type: 'Single',
    mode: 'Row',
    checkboxMode: 'ResetOnRowClick',
    persistSelection: true,
  };
  public selectedOrder: AgencyOrderManagement;
  public openPreview = new Subject<boolean>();
  public openCandidat = new Subject<boolean>();
  public openChildDialog = new Subject<any>();
  public typeValueAccess = typeValueAccess;
  public previousSelectedOrderId: number | null;
  public selectedCandidate: any | null;
  public selectedReOrder: any | null;
  public filters: AgencyOrderFilters = {
    includeReOrders: true,
  };
  public filterColumns = AgencyOrderFiltersComponent.generateFilterColumns();
  public OrderFilterFormGroup: FormGroup = AgencyOrderFiltersComponent.generateFiltersForm();
  public columnsToExport: ExportColumn[];
  public fileName: string;
  public defaultFileName: string;
  public isRowScaleUp: boolean = true;
  public isSubrowDisplay: boolean = false;
  public ordersPage: AgencyOrderManagementPage;
  public AgencyOrderManagementTabs = AgencyOrderManagementTabs;
  public isLockMenuButtonsShown = true;
  public orderTypes = OrderType;
  public selectedRowRef: any;
  public openDetailsTab = false;

  private isAlive = true;
  private selectedIndex: number | null;
  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();

  constructor(
    private store: Store,
    private location: Location,
    private actions$: Actions,
    private datePipe: DatePipe,
    private filterService: FilterService,
    private orderManagementAgencyService: OrderManagementAgencyService
  ) {
    super();
  }

  ngOnInit(): void {
    this.onOrderPreviewChange();
    this.onAgencyChange();
    this.onChildDialogChange();
    const locationState = this.location.getState() as { orderId: number };
    this.previousSelectedOrderId = locationState.orderId;
    this.onReloadOrderCandidatesLists();
    this.onExportSelectedSubscribe();
    this.idFieldName = 'orderId';
    this.search$.pipe(takeUntil(this.unsubscribe$), debounceTime(300)).subscribe((value: string) => {
      if (value.length >= 2) {
        this.OrderFilterFormGroup.controls['jobTitle'].setValue(value);
        this.onFilterApply();
      } else if (value.length === 0 && this.filters.jobTitle?.length) {
        this.OrderFilterFormGroup.controls['jobTitle'].setValue('');
        this.onFilterApply();
      }
    });
    this.ordersPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.ordersPage = data;
      this.reOrderNumber.emit(data?.items[0]?.reOrderCount || 0);
    });
    this.subscribeOnPageChanges();
    this.onTabChange();
    this.onCommentRead();
    this.listenRedirectFromExtension();
  }

  ngOnDestroy(): void {
    this.orderManagementAgencyService.selectedOrderAfterRedirect = null;
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private onCommentRead(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(UpdateGridCommentsCounter))
      .subscribe((data) => {
        if (data.orderId && this.selectedRowRef) {
          this.selectedRowRef.data.unreadComments -= data.readComments;
          this.gridWithChildRow.setRowData(data.orderId, this.selectedRowRef.data);
        }
      });
  }

  public onExportSelectedSubscribe(): void {
    this.onExportClicked$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((event: any) => this.exportSelected(event));
  }

  public override customExport(): void {
    this.defaultFileName = `Order Management/${this.selectedTab} ` + this.generateDateTime(this.datePipe);
    this.fileName = this.defaultFileName;
    this.store.dispatch(new ShowExportDialog(true));
  }

  public closeExport(): void {
    this.clearSelection(this.gridWithChildRow);
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.defaultFileName = `Order Management/${this.selectedTab} ` + this.generateDateTime(this.datePipe);
    this.store.dispatch(
      new ExportAgencyOrders(
        new ExportPayload(
          fileType,
          {
            ...this.filters,
            offset: Math.abs(new Date().getTimezoneOffset()),
            isAgency: this.selectedTab === AgencyOrderManagementTabs.ReOrders ? true : null,
            ids: this.selectedItems.length ? this.selectedItems.map((val) => val[this.idFieldName]) : null,
          },
          options ? options.columns.map((val) => val.column) : this.columnsToExport.map((val) => val.column),
          null,
          options?.fileName || this.defaultFileName
        ),
        this.selectedTab
      )
    );
    this.closeExport();
  }

  public onDataBound(): void {
    this.subrowsState.clear();
    if (this.previousSelectedOrderId) {
      const [data, index] = this.store.selectSnapshot(OrderManagementState.lastSelectedOrder)(
        this.previousSelectedOrderId
      );
      if (data && !isUndefined(index)) {
        this.gridWithChildRow.selectRow(index);
        this.onRowClick({ data });
      }
    }
    if (this.selectedIndex) {
      this.gridWithChildRow.selectRow(this.selectedIndex);
    }

    this.openPerDiemDetails();
    this.openMyAgencyTabWithCandidate();
  }

  private openMyAgencyTabWithCandidate(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
    if (selectedOrderAfterRedirect && this.ordersPage) {
      const orderMyAgency = this.ordersPage.items.find(
        (order: AgencyOrderManagement) => order.orderId === selectedOrderAfterRedirect.orderId
      );
      if (orderMyAgency) {
        const candidate = orderMyAgency.children.find(
          (candidate: OrderManagementChild) => candidate.candidateId === selectedOrderAfterRedirect.candidateId
        );
        this.gridWithChildRow.detailRowModule.expand(0);
        this.onOpenCandidateDialog(candidate as OrderManagementChild, orderMyAgency);
        this.orderManagementAgencyService.selectedOrderAfterRedirect = null;
      }
    }
  }

  /* Trigger when user redirect to per diem order from re-order */
  private openPerDiemDetails(): void {
    const { orderPerDiemId } = this.orderManagementAgencyService;
    if (orderPerDiemId && this.ordersPage) {
      const orderPerDiem = this.ordersPage.items.find(
        (order: AgencyOrderManagement) => order.orderId === orderPerDiemId
      );

      if (orderPerDiem) {
        const index = (this.gridWithChildRow.dataSource as Order[])?.findIndex(
          (order: Order) => order.orderId === orderPerDiemId
        );
        this.onRowClick({ data: orderPerDiem });
        this.gridWithChildRow.selectRow(index);
        this.orderManagementAgencyService.orderPerDiemId = null;
      }
    }
  }

  public onGoToClick(event: any): void {
    if ((event.currentPage && event.currentPage !== this.currentPage) || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
      this.isSubrowDisplay = false;
    }
  }

  public onRowsDropDownChanged(): void {
    if (this.pageSize !== parseInt(this.activeRowsPerPageDropDown)) {
      this.pageSize = parseInt(this.activeRowsPerPageDropDown);
      this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
      this.dispatchNewPage();
    }
  }

  private onTabChange(): void {
    this.ordersTab$
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((selected) => {
          const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
          this.selectedTab = selected;
          if (!selectedOrderAfterRedirect) {
            this.onGridCreated();
          }
          this.clearFilters();
          this.store.dispatch(new ClearOrders());
          this.selectedIndex = null;
          this.dispatchNewPage();
        })
      )
      .subscribe();
  }

  private dispatchNewPage(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;

    switch (this.selectedTab) {
      case AgencyOrderManagementTabs.MyAgency:
        this.filters.includeReOrders = true;
        this.hasOrderMyAgencyId();
        selectedOrderAfterRedirect?.orderType !== OrderType.ReOrder &&
          this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
      case AgencyOrderManagementTabs.PerDiem:
        this.filters.orderTypes = [OrderType.OpenPerDiem];
        this.filters.includeReOrders = true;
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
      case AgencyOrderManagementTabs.PermPlacement:
        this.filters.orderTypes = [OrderType.PermPlacement];
        this.filters.includeReOrders = false;
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
      case AgencyOrderManagementTabs.ReOrders:
        this.hasOrderMyAgencyId();
        this.filters.includeReOrders = false;
        this.filters.orderTypes = [OrderType.ReOrder];
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
      default:
        this.hasOrderMyAgencyId();
        this.filters.includeReOrders = false;
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
    }

    this.checkSelectedChildrenItem();
  }

  public onGridCreated(): void {
    switch (this.selectedTab) {
      case AgencyOrderManagementTabs.MyAgency:
        this.isLockMenuButtonsShown = true;
        this.refreshGridColumns(MyAgencyOrdersColumnsConfig, this.gridWithChildRow);
        break;
      case AgencyOrderManagementTabs.PerDiem:
        this.isLockMenuButtonsShown = true;
        this.refreshGridColumns(PerDiemColumnsConfig, this.gridWithChildRow);
        break;
      case AgencyOrderManagementTabs.PermPlacement:
        this.isLockMenuButtonsShown = true;
        this.refreshGridColumns(PermPlacementColumnsConfig, this.gridWithChildRow);
        break;
      case AgencyOrderManagementTabs.ReOrders:
        this.isLockMenuButtonsShown = false;
        this.refreshGridColumns(ReOrdersColumnsConfig, this.gridWithChildRow);
        break;
      default:
        this.isLockMenuButtonsShown = true;
        this.refreshGridColumns(MyAgencyOrdersColumnsConfig, this.gridWithChildRow);
        break;
    }
  }

  public onCompare(): void {
    this.openCandidat.next(true);
  }

  public onRowClick(event: any): void {
    if (event.target) {
      this.orderManagementAgencyService.excludeDeployed = false;
    }

    this.rowSelected(event, this.gridWithChildRow);

    if (!event.isInteracted) {
      this.selectedOrder = event.data;
      const options = this.getDialogNextPreviousOption(event.data);
      this.store.dispatch(new GetOrderById(event.data.orderId, event.data.organizationId, options));
      this.openPreview.next(true);
      this.store.dispatch(
        new GetAgencyOrderCandidatesList(
          event.data.orderId,
          event.data.organizationId,
          1,
          30,
          this.orderManagementAgencyService.excludeDeployed
        )
      );
      this.store.dispatch(new GetAgencyOrderGeneralInformation(event.data.orderId, event.data.organizationId));
      this.selectedIndex = Number(event.rowIndex);
    }

    this.checkSelectedChildrenItem();
  }

  public onRowDeselect(event: any, grid: any) {
    this.rowDeselected(event, grid);
    this.checkSelectedChildrenItem();
  }

  public setRowHighlight(args: RowDataBoundEventArgs & { data: AgencyOrderManagement }): void {
    const [colors] = Object.values(STATUS_COLOR_GROUP);
    if (colors.includes(args.data.statusText)) {
      args.row?.classList.add('e-success-row');
    }
  }

  public onRowScaleUpClick(): void {
    this.isRowScaleUp = false;
    this.rowHeight = ROW_HEIGHT.SCALE_UP_HEIGHT;
    this.isSubrowDisplay = false;
  }

  public onRowScaleDownClick(): void {
    this.isRowScaleUp = true;
    this.rowHeight = ROW_HEIGHT.SCALE_DOWN_HEIGHT;
    this.isSubrowDisplay = false;
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    const [index] = this.gridWithChildRow.getSelectedRowIndexes();
    const nextIndex = next ? index + 1 : index - 1;
    this.gridWithChildRow.selectRow(nextIndex);
  }

  public onOpenReorderDialog(reOrder: AgencyOrderManagement, order: AgencyOrderManagement): void {
    this.selectedReOrder = reOrder;
    this.selectedReOrder.selected = {
      order: order.orderId || order.id,
      reOrder: reOrder.orderId || reOrder.id,
    };
    this.clearSelection(this.gridWithChildRow);
    this.store.dispatch(new GetOrderById(reOrder.orderId || (reOrder.id as number), order.organizationId));
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(
        reOrder.orderId || (reOrder.id as number),
        order.organizationId,
        this.currentPage,
        this.pageSize,
        this.orderManagementAgencyService.excludeDeployed
      )
    );
    this.store.dispatch(
      new GetAgencyOrderGeneralInformation(reOrder.orderId || (reOrder.id as number), order.organizationId)
    );
    this.selectedOrder = reOrder;
    this.selectedIndex = null;
    this.openPreview.next(true);
  }

  selectReOrder(event: { reOrder: AgencyOrderManagement; order: Order | AgencyOrderManagement }): void {
    const tabSwitchAnimation = 400;
    const { reOrder, order } = event;
    const tabId = Object.values(AgencyOrderManagementTabs).indexOf(AgencyOrderManagementTabs.ReOrders);
    this.selectTab.emit(tabId);
    setTimeout(() => {
      this.onOpenReorderDialog(reOrder, order as AgencyOrderManagement);
      this.detailsDialog.tab.select(0);
    }, tabSwitchAnimation);
  }

  public onOpenCandidateDialog(candidate: OrderManagementChild, order: AgencyOrderManagement): void {
    this.selectedCandidate = candidate;
    this.selectedCandidate.selected = {
      order: order.orderId,
      positionId: candidate.positionId,
    };
    this.selectedOrder = order;
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(
        order.orderId || (order.id as number),
        order.organizationId,
        this.currentPage,
        this.pageSize,
        this.orderManagementAgencyService.excludeDeployed
      )
    );
    const options = this.getDialogNextPreviousOption(order);
    this.store.dispatch(new GetOrderById(order.orderId, order.organizationId, options));
    this.openChildDialog.next([order, candidate]);
    this.selectedIndex = null;
  }

  public expandAll(): void {
    this.isSubrowDisplay = true;
    this.ordersPage.items.forEach((item: AgencyOrderManagement, index: number): void => {
      super.onSubrowAllToggle(index + 1);
    });
  }

  public collapseAll(): void {
    this.isSubrowDisplay = false;
    super.onSubrowAllToggle();
  }

  // Filter
  public onFilterClose() {
    this.OrderFilterFormGroup.setValue({
      orderId: this.filters.orderId || null,
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
      departmentsIds: this.filters.departmentsIds || [],
      skillIds: this.filters.skillIds || [],
      orderTypes:
        this.selectedTab === AgencyOrderManagementTabs.PerDiem ||
        this.selectedTab === AgencyOrderManagementTabs.ReOrders ||
        this.selectedTab === AgencyOrderManagementTabs.PermPlacement
          ? []
          : this.filters.orderTypes || [],
      jobTitle: this.filters.jobTitle || null,
      billRateFrom: this.filters.billRateFrom || null,
      billRateTo: this.filters.billRateTo || null,
      openPositions: this.filters.openPositions || null,
      jobStartDate: this.filters.jobStartDate || null,
      jobEndDate: this.filters.jobEndDate || null,
      candidateStatuses: this.filters.candidateStatuses || [],
      candidatesCountFrom: this.filters.candidatesCountFrom || null,
      candidatesCountTo: this.filters.candidatesCountTo || null,
      organizationIds: this.filters.organizationIds || [],
      orderStatuses: this.filters.orderStatuses || [],
      annualSalaryRangeFrom: this.filters.annualSalaryRangeFrom || null,
      annualSalaryRangeTo: this.filters.annualSalaryRangeTo || null,
    });
    this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns, this.datePipe);
    this.filteredItems$.next(this.filteredItems.length);
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.OrderFilterFormGroup, this.filterColumns);
  }

  private clearFilters(): void {
    this.OrderFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {
      includeReOrders: true,
    };
    this.filteredItems$.next(this.filteredItems.length);
  }

  private checkSelectedChildrenItem(): void {
    const hasSelectedItemChildren = this.selectedItems.some((itm) => itm.children.length !== 0);
    const hasSelectedChildReorders = this.selectedItems.some((itm) => itm.reOrders?.length !== 0);

    switch (this.selectedTab) {
      case AgencyOrderManagementTabs.MyAgency:
        if (this.selectedItems.length === 0) {
          this.columnsToExport = [...myAgencyColumnsToExport, ...myAgencyChildColumnsToExport];
          return;
        }
        this.columnsToExport = hasSelectedItemChildren
          ? [...myAgencyColumnsToExport, ...myAgencyChildColumnsToExport]
          : myAgencyColumnsToExport;
        break;
      case AgencyOrderManagementTabs.PerDiem:
        if (this.selectedItems.length === 0) {
          this.columnsToExport = [...perDiemColumnsToExport, ...perDiemChildColumnsToExport];
          return;
        }
        this.columnsToExport = hasSelectedChildReorders
          ? [...perDiemColumnsToExport, ...perDiemChildColumnsToExport]
          : perDiemColumnsToExport;
        break;
      case AgencyOrderManagementTabs.ReOrders:
        if (this.selectedItems.length === 0) {
          this.columnsToExport = [...reOrdersColumnsToExport, ...reOrdersChildColumnToExport];
          return;
        }
        this.columnsToExport = hasSelectedItemChildren
          ? [...reOrdersColumnsToExport, ...reOrdersChildColumnToExport]
          : reOrdersColumnsToExport;
        break;
    }
  }

  public onFilterClearAll(): void {
    this.orderManagementAgencyService.selectedOrderAfterRedirect = null;
    this.clearFilters();
    this.dispatchNewPage();
  }

  public onFilterApply(): void {
    this.filters = this.OrderFilterFormGroup.getRawValue();
    this.filters.orderId = this.filters.orderId || null;
    this.filters.billRateFrom = this.filters.billRateFrom || null;
    this.filters.billRateTo = this.filters.billRateTo || null;
    this.filters.jobStartDate = this.filters.jobStartDate || null;
    this.filters.jobEndDate = this.filters.jobEndDate || null;
    this.filters.annualSalaryRangeFrom = this.filters.annualSalaryRangeFrom || null;
    this.filters.annualSalaryRangeTo = this.filters.annualSalaryRangeTo || null;
    this.filters.candidatesCountFrom = this.filters.candidatesCountFrom || null;
    this.filters.candidatesCountTo = this.filters.candidatesCountTo || null;
    this.filters.openPositions = this.filters.openPositions || null;
    this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
    this.dispatchNewPage();
    this.store.dispatch(new ShowFilterDialog(false));
    this.filteredItems$.next(this.filteredItems.length);
  }
  // End - Filter

  private listenRedirectFromExtension(): void {
    this.orderManagementAgencyService.orderId$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((id: number) => {
        const index = (this.gridWithChildRow.dataSource as Order[])?.findIndex((order: Order) => order.orderId === id);
        this.gridWithChildRow.selectRow(index);
      });
  }

  private onOrderPreviewChange(): void {
    this.openPreview.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (!isOpen) {
        this.openCandidat.next(false);
        this.clearSelection(this.gridWithChildRow);
        this.previousSelectedOrderId = null;
        this.selectedIndex = null;
        const table = document.getElementsByClassName('e-virtualtable')[0] as HTMLElement;
        if (table) {
          table.style.transform = 'translate(0px, 0px)';
        }
      } else {
        this.openDetailsTab = false;
        this.openChildDialog.next(false);
        this.selectedCandidate = null;
        if (this.selectedReOrder?.selected.reOrder !== this.selectedOrder.orderId) {
          this.selectedReOrder = null;
        }
      }
    });
  }

  private onChildDialogChange(): void {
    this.openChildDialog.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (!isOpen) {
        this.selectedCandidate = null;
      } else {
        this.openPreview.next(false);
        this.clearSelection(this.gridWithChildRow);
      }
    });
  }

  private getDialogNextPreviousOption(selectedOrder: AgencyOrderManagement): DialogNextPreviousOption {
    const gridData = this.gridWithChildRow.dataSource as AgencyOrderManagement[];
    const first = gridData[0];
    const last = gridData[gridData.length - 1];
    return {
      previous: first.orderId !== selectedOrder.orderId,
      next: last.orderId !== selectedOrder.orderId,
    };
  }

  private onAgencyChange(): void {
    this.lastSelectedAgencyId$
      .pipe(
        takeWhile(() => this.isAlive),
        skip(1)
      )
      .subscribe(() => {
        this.openPreview.next(false);
        this.openCandidat.next(false);
        this.clearFilters();
        this.dispatchNewPage();
        this.store.dispatch(new GetAgencyFilterOptions());
      });
  }

  private onReloadOrderCandidatesLists(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(ReloadOrderCandidatesLists),
        takeWhile(() => this.isAlive)
      )
      .subscribe(() => {
        this.store
          .dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters))
          .subscribe((data) => {
            const order = data.agencyOrders.ordersPage.items.find(
              (item: AgencyOrderManagement) => item.orderId === this.selectedOrder.orderId
            );
            if (order) {
              this.onRowClick({ data: order, rowIndex: this.selectedIndex });
            }
          });
      });
  }

  private hasOrderMyAgencyId(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
    if (selectedOrderAfterRedirect) {
      this.OrderFilterFormGroup.patchValue({ orderId: selectedOrderAfterRedirect.orderId.toString() });
      this.filters = this.OrderFilterFormGroup.getRawValue();
      this.filters.orderId = selectedOrderAfterRedirect.orderId;
      this.filters.includeReOrders = false;
      this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
      this.filteredItems$.next(this.filteredItems.length);

      if (selectedOrderAfterRedirect.orderType === OrderType.ReOrder) {
        this.filters.orderTypes = [10];
      }
    }
  }

  private subscribeOnPageChanges(): void {
    this.pageSubject.pipe(debounceTime(1)).subscribe((page: number) => {
      this.currentPage = page;
      this.dispatchNewPage();
    });
  }
}
