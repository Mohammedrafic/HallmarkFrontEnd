import { Component, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subject, takeWhile } from 'rxjs';
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
import { MyAgencyOrdersColumnsConfig, PerDiemColumnsConfig, ReOrdersColumnsConfig, ROW_HEIGHT, typeValueAccess } from './order-management-grid.constants';
import {
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
  OrderManagementChild
} from '@shared/models/order-management.model';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { DatePipe, Location } from '@angular/common';
import { UserState } from 'src/app/store/user.state';
import { isUndefined } from 'lodash';
import { FilterService } from '@shared/services/filter.service';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { FilteredItem } from '@shared/models/filter.model';
import { AgencyOrderFiltersComponent } from './agency-order-filters/agency-order-filters.component';
import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';

@Component({
  selector: 'app-order-management-grid',
  templateUrl: './order-management-grid.component.html',
  styleUrls: ['./order-management-grid.component.scss'],
  providers: [ChipsCssClass, DetailRowService],
})
export class OrderManagementGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() filteredItems$: Subject<number>;
  @Input() selectedTab: AgencyOrderManagementTabs;

  @ViewChild('grid') override gridWithChildRow: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @ViewChildren('rowCheckbox') rowCheckboxes: QueryList<CheckBoxComponent>;

  @Select(OrderManagementState.ordersPage)
  public ordersPage$: Observable<AgencyOrderManagementPage>;

  @Select(UserState.lastSelectedAgencyId)
  lastSelectedAgencyId$: Observable<number>;

  public wrapSettings: TextWrapSettingsModel = GRID_CONFIG.wordWrapSettings;
  public allowWrap = GRID_CONFIG.isWordWrappingEnabled;
  public selectionOptions: SelectionSettingsModel = { type: 'Single', mode: 'Row', checkboxMode: 'ResetOnRowClick' };
  public selectedOrder: AgencyOrderManagement;
  public openPreview = new Subject<boolean>();
  public openCandidat = new Subject<boolean>();
  public openChildDialog = new Subject<any>();
  public typeValueAccess = typeValueAccess;
  public previousSelectedOrderId: number | null;
  public selectedCandidat: any | null;
  public filters: AgencyOrderFilters = {};
  public filterColumns = AgencyOrderFiltersComponent.generateFilterColumns();
  public OrderFilterFormGroup: FormGroup = AgencyOrderFiltersComponent.generateFiltersForm();

  private statusSortDerection: SortDirection = 'Ascending';
  private isAlive = true;
  private selectedIndex: number | null;

  constructor(private store: Store,
              private location: Location,
              private actions$: Actions,
              private datePipe: DatePipe,
              private filterService: FilterService) {
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
  }

  ngOnDestroy(): void {
    this.isAlive = false;
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
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
      case AgencyOrderManagementTabs.PerDiem:
        // TODO: pending BE
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
      case AgencyOrderManagementTabs.ReOrders:
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
      default:
        this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters));
        break;
    }
  }

  public onGridCreated(): void {
    switch (this.selectedTab) {
      case AgencyOrderManagementTabs.MyAgency:
        this.refreshGridColumns(MyAgencyOrdersColumnsConfig, this.gridWithChildRow);
        break;
      case AgencyOrderManagementTabs.PerDiem:
        this.refreshGridColumns(PerDiemColumnsConfig, this.gridWithChildRow);
        break;
      case AgencyOrderManagementTabs.ReOrders:
        this.refreshGridColumns(ReOrdersColumnsConfig, this.gridWithChildRow);
        break;
      default:
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
    if (!event.isInteracted) {
      this.selectedOrder = event.data;
      const options = this.getDialogNextPreviousOption(event.data);
      this.store.dispatch(new GetOrderById(event.data.orderId, event.data.organizationId, options));
      this.openPreview.next(true);
      this.store.dispatch(
        new GetAgencyOrderCandidatesList(event.data.orderId, event.data.organizationId, this.currentPage, this.pageSize)
      );
      this.store.dispatch(new GetAgencyOrderGeneralInformation(event.data.orderId, event.data.organizationId));
      this.selectedIndex = Number(event.rowIndex);
    }
  }

  public setRowHighlight(args: RowDataBoundEventArgs & { data: AgencyOrderManagement }): void {
    const [colors] = Object.values(STATUS_COLOR_GROUP);
    if (colors.includes(args.data.statusText)) {
      args.row?.classList.add('e-success-row');
    }
  }

  public onRowScaleUpClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_UP_HEIGHT;
  }

  public onRowScaleDownClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_DOWN_HEIGHT;
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    const [index] = this.gridWithChildRow.getSelectedRowIndexes();
    const nextIndex = next ? index + 1 : index - 1;
    this.gridWithChildRow.selectRow(nextIndex);
  }

  public onOpenCandidateDialog(candidat: OrderManagementChild, order: AgencyOrderManagement): void {
    this.selectedCandidat = candidat;
    this.selectedCandidat.selected = {
      order: order.orderId,
      positionId: candidat.positionId
    };
    this.selectedOrder = order;
    const options = this.getDialogNextPreviousOption(order);
    this.store.dispatch(new GetOrderById(order.orderId, order.organizationId, options));
    this.openChildDialog.next([order, candidat]);
    this.selectedIndex = null;
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
      orderTypes: this.filters.orderTypes || [],
      jobTitle: this.filters.jobTitle || null,
      billRateFrom: this.filters.billRateFrom || null,
      billRateTo: this.filters.billRateTo || null,
      openPositions: this.filters.openPositions || null,
      jobStartDate: this.filters.jobStartDate || null,
      jobEndDate: this.filters.jobEndDate || null,
      reOrderDate: this.filters.reOrderDate || null,
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
      } else {
        this.openChildDialog.next(false);
        this.selectedCandidat = null;
      }
    });
  }

  private onChildDialogChange(): void {
    this.openChildDialog.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (!isOpen) {
        this.selectedCandidat = null;
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
    this.actions$.pipe(ofActionSuccessful(ReloadOrderCandidatesLists), takeWhile(() => this.isAlive)).subscribe(() => {
      this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize, this.filters)).subscribe((data) => {
        const order = data.agencyOrders.ordersPage.items.find((item: AgencyOrderManagement) => item.orderId === this.selectedOrder.orderId);
        if (order) {
          this.onRowClick({ data: order, rowIndex: this.selectedIndex });
        }
      });
    });
  }
}

