import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { takeWhile, Observable, Subject } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import {
  CheckBoxChangeEventArgs,
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
import { ROW_HEIGHT, typeValueAccess } from './order-management-grid.constants';
import {
  GetAgencyOrdersPage,
  GetOrderById,
  GetAgencyOrderCandidatesList,
  GetAgencyOrderGeneralInformation,
  ReloadOrderCandidatesLists,
} from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { AgencyOrderManagement, OrderManagementChild, AgencyOrderManagementPage } from '@shared/models/order-management.model';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { Location } from '@angular/common';
import { UserState } from 'src/app/store/user.state';
import { isUndefined } from 'lodash';

enum AllCheckedStatus {
  None,
  Indeterminate,
  All,
}

@Component({
  selector: 'app-order-management-grid',
  templateUrl: './order-management-grid.component.html',
  styleUrls: ['./order-management-grid.component.scss'],
  providers: [ChipsCssClass, DetailRowService],
})
export class OrderManagementGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') override gridWithChildRow: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @ViewChildren('rowCheckbox') rowCheckboxes: QueryList<CheckBoxComponent>;

  @Select(OrderManagementState.ordersPage)
  public ordersPage$: Observable<AgencyOrderManagementPage>;

  @Select(UserState.lastSelectedAgencyId)
  lastSelectedAgencyId$: Observable<number>;

  public wrapSettings: TextWrapSettingsModel = GRID_CONFIG.wordWrapSettings;
  public allowWrap = GRID_CONFIG.isWordWrappingEnabled;
  public selectionOptions: SelectionSettingsModel = { type: 'Single', mode: 'Row' };
  public allCheckedStatus = AllCheckedStatus;
  public selectedOrder: AgencyOrderManagement;
  public openPreview = new Subject<boolean>();
  public openCandidat = new Subject<boolean>();
  public openChildDialog = new Subject<any>();
  public typeValueAccess = typeValueAccess;
  public previousSelectedOrderId: number | null;
  public selectedCandidat: any | null;

  get checkedStatus(): AllCheckedStatus {
    const itemsLength = this.rowCheckboxes.length;
    const checked = this.rowCheckboxes.filter((item) => item.checked);
    if (itemsLength > 0 && !!checked.length) {
      return checked.length < itemsLength ? AllCheckedStatus.Indeterminate : AllCheckedStatus.All;
    }
    return AllCheckedStatus.None;
  }

  private statusSortDerection: SortDirection = 'Ascending';
  private isAlive = true;

  constructor(private store: Store,
              private location: Location,
              private actions$: Actions) {
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
    this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize));
  }

  public onCompare(): void {
    this.openCandidat.next(true);
  }

  public onSortStatus(): void {
    const direction: SortDirection = this.statusSortDerection === 'Ascending' ? 'Descending' : 'Ascending';
    this.gridWithChildRow.sortColumn('status', direction);
    this.statusSortDerection = direction;
  }

  public onRowClick({ data }: { data: AgencyOrderManagement }): void {
    this.selectedOrder = data;
    const options = this.getDialogNextPreviousOption(data);
    this.store.dispatch(new GetOrderById(data.orderId, data.organizationId, options));
    this.openPreview.next(true);
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(data.orderId, data.organizationId, this.currentPage, this.pageSize)
    );
    this.store.dispatch(new GetAgencyOrderGeneralInformation(data.orderId, data.organizationId));
  }

  public onCheckAll(event: CheckBoxChangeEventArgs): void {
    this.rowCheckboxes.forEach((item) => {
      item.writeValue(event.checked);
    });
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
  }

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
      this.dispatchNewPage();
    });
  }

  private onReloadOrderCandidatesLists(): void {
    this.actions$.pipe(ofActionSuccessful(ReloadOrderCandidatesLists), takeWhile(() => this.isAlive)).subscribe(() => {
      this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize)).subscribe((data) => {
        const order = data.agencyOrders.ordersPage.items.find((item: AgencyOrderManagement) => item.orderId === this.selectedOrder.orderId);
        if (order) {
          this.onRowClick({ data: order });
        }
      });
    });
  }
}

