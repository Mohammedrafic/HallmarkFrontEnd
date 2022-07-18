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
import { debounceTime, filter, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import {
  DetailRowService,
  GridComponent,
  PagerComponent,
  RowDataBoundEventArgs,
  SelectionSettingsModel,
  SortDirection,
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
  PerDiemColumnsConfig,
  perDiemColumnsToExport,
  reOrdersChildColumnToExport,
  ReOrdersColumnsConfig,
  reOrdersColumnsToExport,
  ROW_HEIGHT,
  typeValueAccess,
} from './order-management-grid.constants';
import {
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
import { NextPreviousOrderEvent } from './preview-order-dialog/preview-order-dialog.component';

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

  @Output() reOrderNumber = new EventEmitter<number>();

  @ViewChild('grid') override gridWithChildRow: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @ViewChildren('rowCheckbox') rowCheckboxes: QueryList<CheckBoxComponent>;

  @Select(OrderManagementState.ordersPage)
  public ordersPage$: Observable<AgencyOrderManagementPage>;

  @Select(UserState.lastSelectedAgencyId)
  lastSelectedAgencyId$: Observable<number>;

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
  public filters: AgencyOrderFilters = {};
  public filterColumns = AgencyOrderFiltersComponent.generateFilterColumns();
  public OrderFilterFormGroup: FormGroup = AgencyOrderFiltersComponent.generateFiltersForm();
  public columnsToExport: ExportColumn[];
  public fileName: string;
  public defaultFileName: string;
  public isRowScaleUp: boolean = true;
  public isSubrowDisplay: boolean = false;
  public ordersPage: AgencyOrderManagementPage;
  public showReOrders = false;
  public AgencyOrderManagementTabs = AgencyOrderManagementTabs;

  private statusSortDerection: SortDirection = 'Ascending';
  private isAlive = true;
  private selectedIndex: number | null;
  private unsubscribe$: Subject<void> = new Subject();
  private excludeDeployed: boolean;

  constructor(
    private store: Store,
    private location: Location,
    private actions$: Actions,
    private datePipe: DatePipe,
    private filterService: FilterService
  ) {
    super();
  }

  ngOnInit(): void {
    this.onOrderPreviewChange();
    this.onAgencyChange();
    this.onChildDialogChange();
    const locationState = this.location.getState() as { orderId: number };
    this.previousSelectedOrderId = locationState.orderId;
    if (!this.previousSelectedOrderId) {
      this.dispatchNewPage();
    }
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
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.dispatchNewPage();
      this.isSubrowDisplay = false;
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
    this.dispatchNewPage();
  }

  private dispatchNewPage(): void {
    switch (this.selectedTab) {
      case AgencyOrderManagementTabs.MyAgency:
        this.columnsToExport = [...myAgencyColumnsToExport, ...myAgencyChildColumnsToExport];
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
      case AgencyOrderManagementTabs.PerDiem:
        // TODO: pending BE
        this.columnsToExport = perDiemColumnsToExport;
        this.filters.orderTypes = [OrderType.OpenPerDiem];
        this.filters.includeReOrders = true;
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
      case AgencyOrderManagementTabs.ReOrders:
        this.columnsToExport = reOrdersColumnsToExport;
        this.filters.orderTypes = [OrderType.ReOrder];
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
      default:
        this.columnsToExport = myAgencyColumnsToExport;
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
    }
  }

  public onGridCreated(): void {
    switch (this.selectedTab) {
      case AgencyOrderManagementTabs.MyAgency:
        this.showReOrders = false;
        this.refreshGridColumns(MyAgencyOrdersColumnsConfig, this.gridWithChildRow);
        break;
      case AgencyOrderManagementTabs.PerDiem:
        this.showReOrders = true;
        this.refreshGridColumns(PerDiemColumnsConfig, this.gridWithChildRow);
        break;
      case AgencyOrderManagementTabs.ReOrders:
        this.showReOrders = false;
        this.refreshGridColumns(ReOrdersColumnsConfig, this.gridWithChildRow);
        break;
      default:
        this.showReOrders = false;
        this.refreshGridColumns(MyAgencyOrdersColumnsConfig, this.gridWithChildRow);
        break;
    }
  }

  public onCompare(): void {
    this.openCandidat.next(true);
  }

  public onSortStatus(): void {
    const direction: SortDirection = this.statusSortDerection === 'Ascending' ? 'Descending' : 'Ascending';
    this.gridWithChildRow.sortColumn('status', direction);
    this.statusSortDerection = direction;
  }

  public onRowClick(event: any): void {
    if (event.target) {
      this.excludeDeployed = false;
    }

    this.rowSelected(event, this.gridWithChildRow);

    if (!event.isInteracted) {
      this.selectedOrder = event.data;
      const options = this.getDialogNextPreviousOption(event.data);
      this.store.dispatch(new GetOrderById(event.data.orderId, event.data.organizationId, options));
      this.openPreview.next(true);
      this.store.dispatch(   
        new GetAgencyOrderCandidatesList(event.data.orderId, event.data.organizationId, this.currentPage, this.pageSize, this.excludeDeployed)
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

  public onNextPreviousOrderEvent(event: NextPreviousOrderEvent): void {
    const [index] = this.gridWithChildRow.getSelectedRowIndexes();
    const nextIndex = event.next ? index + 1 : index - 1;
    this.excludeDeployed = event.excludeDeployed;
    this.gridWithChildRow.selectRow(nextIndex);
  }

  public onOpenReorderDialog(reOrder: AgencyOrderManagement, order: AgencyOrderManagement): void {
    this.selectedReOrder = reOrder;
    this.selectedReOrder.selected = {
      order: order.orderId,
      reOrder: reOrder.orderId,
    };
    const options = this.getDialogNextPreviousOption(order);
    this.store.dispatch(new GetOrderById(order.orderId, order.organizationId, options));
    this.selectedOrder = order;
    //this.openChildDialog.next([order, candidate]); TODO: pending reorder modal
    this.selectedIndex = null;
  }

  public onOpenCandidateDialog(candidat: OrderManagementChild, order: AgencyOrderManagement): void {
    this.selectedCandidate = candidat;
    this.selectedCandidate.selected = {
      order: order.orderId,
      positionId: candidat.positionId,
    };
    this.selectedOrder = order;
    const options = this.getDialogNextPreviousOption(order);
    this.store.dispatch(new GetOrderById(order.orderId, order.organizationId, options));
    this.openChildDialog.next([order, candidat]);
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
      reOrderId: this.filters.reOrderId || null,
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
      departmentsIds: this.filters.departmentsIds || [],
      skillIds: this.filters.skillIds || [],
      orderTypes:
        this.selectedTab === AgencyOrderManagementTabs.PerDiem ||
        this.selectedTab === AgencyOrderManagementTabs.ReOrders
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
    this.filters = {};
    this.filteredItems$.next(this.filteredItems.length);
  }

  private checkSelectedChildrenItem(): void {
    const hasSelectedItemChildren = this.selectedItems.some((itm) => itm.children.length !== 0);

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
      case AgencyOrderManagementTabs.ReOrders:
        this.columnsToExport = hasSelectedItemChildren
          ? [...reOrdersColumnsToExport, ...reOrdersChildColumnToExport]
          : reOrdersColumnsToExport;
        break;
    }
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.dispatchNewPage();
  }

  public onFilterApply(): void {
    this.filters = this.OrderFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.OrderFilterFormGroup, this.filterColumns);
    this.dispatchNewPage();
    this.store.dispatch(new ShowFilterDialog(false));
    this.filteredItems$.next(this.filteredItems.length);
  }
  // End - Filter

  private onOrderPreviewChange(): void {
    this.openPreview.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (!isOpen) {
        this.openCandidat.next(false);
        this.gridWithChildRow?.clearRowSelection();
        this.previousSelectedOrderId = null;
        this.selectedIndex = null;
      } else {
        this.openChildDialog.next(false);
        this.selectedCandidate = null;
      }
    });
  }

  private onChildDialogChange(): void {
    this.openChildDialog.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (!isOpen) {
        this.selectedCandidate = null;
      } else {
        this.openPreview.next(false);
        this.gridWithChildRow?.clearRowSelection();
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
    this.lastSelectedAgencyId$.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
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
}
