import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { FreezeService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { SetHeaderState } from 'src/app/store/app.actions';
import { ORDERS_GRID_CONFIG } from '../../client.config';
import { SelectionSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';
import { OrderManagemetTabs } from '@client/order-management/order-management-content/tab-navigation/tab-navigation.component';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { GetAgencyOrderCandidatesList, GetIncompleteOrders, GetOrderById, GetOrders } from '@client/store/order-managment-content.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { OrderManagement, OrderManagementPage } from '@shared/models/order-management.model';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { UserState } from '../../../store/user.state';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { Order } from '@shared/models/order-management.model';

export const ROW_HEIGHT = {
  SCALE_UP_HEIGHT: 140,
  SCALE_DOWN_HEIGHT: 64
}

export enum MoreMenuType {
  'Edit',
  'Duplicate',
  'Close',
  'Delete'
}

@Component({
  selector: 'app-order-management-content',
  templateUrl: './order-management-content.component.html',
  styleUrls: ['./order-management-content.component.scss'],
  providers: [FreezeService],
})
export class OrderManagementContentComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  @Select(OrderManagementContentState.ordersPage)
  ordersPage$: Observable<OrderManagementPage>;

  @Select(OrderManagementContentState.selectedOrder)
  selectedOrder$: Observable<Order>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public allowWrap = ORDERS_GRID_CONFIG.isWordWrappingEnabled;
  public wrapSettings: TextWrapSettingsModel = ORDERS_GRID_CONFIG.wordWrapSettings;
  public isLockMenuButtonsShown = true;
  public moreMenuWithDeleteButton: ItemModel[] = [
    { text: MoreMenuType[0], id: '0' },
    { text: MoreMenuType[1], id: '1' },
    { text: MoreMenuType[3], id: '3' }
  ];
  public moreMenuWithCloseButton: ItemModel[] = [
    { text: MoreMenuType[0], id: '0' },
    { text: MoreMenuType[1], id: '1' },
    { text: MoreMenuType[2], id: '2' }
  ];

  private openInProgressFilledStatuses = [
    'open',
    'in progress',
    'filled'
  ];
  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();
  public selectedOrder: Order;
  public openDetails = new Subject<boolean>();
  public selectionOptions: SelectionSettingsModel = { type: 'Single', mode: 'Row', checkboxMode: 'ResetOnRowClick' };

  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {
    super();
    store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
  }

  ngOnInit(): void {
    this.selectedOrder$.pipe(takeUntil(this.unsubscribe$)).subscribe((order: Order) => {
      this.selectedOrder = order;
    });
    this.organizationId$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.store.dispatch(new GetOrders({ orderBy: this.orderBy, pageNumber: this.currentPage, pageSize: this.pageSize })));

    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetOrders({ orderBy: this.orderBy, pageNumber: this.currentPage, pageSize: this.pageSize }));
    });

    this.ordersPage$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      if (data && data.items) {
        data.items.forEach(item => {
          item.isMoreMenuWithDeleteButton = !this.openInProgressFilledStatuses.includes(item.statusText.toLowerCase());
        });
      }
    });

    this.openDetails.pipe(takeUntil(this.unsubscribe$)).subscribe((isOpen) => {
      if (!isOpen) {
        this.grid.clearRowSelection();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    const [index] = this.grid.getSelectedRowIndexes();
    const nextIndex = next ? index + 1 : index - 1;
    this.grid.selectRow(nextIndex);
  }

  public onRowClick({ data }: { data: OrderManagement }): void {
    const options = this.getDialogNextPreviousOption(data);
    this.store.dispatch(new GetOrderById(data.id, data.organizationId, options));
    this.store.dispatch(new GetAgencyOrderCandidatesList(data.id, data.organizationId, this.currentPage, this.pageSize));
    this.openDetails.next(true);
  }

  private getDialogNextPreviousOption(selectedOrder: OrderManagement): DialogNextPreviousOption {
    const gridData = this.grid.dataSource as OrderManagement[];
    const first = gridData[0];
    const last = gridData[gridData.length - 1];
    return {
      previous: first.id !== selectedOrder.id,
      next: last.id !== selectedOrder.id,
    };
  }

  public navigateToOrderForm(): void {
    this.router.navigate(['./add'], { relativeTo: this.route });
  }

  public onRowScaleUpClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_UP_HEIGHT;
  }

  public onRowScaleDownClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_DOWN_HEIGHT;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public setRowHighlight(args: any): void {
    // get and highlight rows with status 'open'
    if (Object.values(STATUS_COLOR_GROUP)[0].includes(args.data['status'])) {
      args.row.classList.add('e-success-row');
    }
  }

  public tabSelected(tabIndex: OrderManagemetTabs): void {

    switch (tabIndex) {
      case OrderManagemetTabs.AllOrders:
        this.isLockMenuButtonsShown = true;
        this.store.dispatch(new GetOrders({ orderBy: this.orderBy, pageNumber: this.currentPage, pageSize: this.pageSize }));
        break;
      case OrderManagemetTabs.OrderTemplates:
        // TODO: pending implementation
        break;
      case OrderManagemetTabs.Incomplete:
        this.isLockMenuButtonsShown = false;
        this.store.dispatch(new GetIncompleteOrders({}));
        break;
      case OrderManagemetTabs.PendingApproval:
        // TODO: pending implementation
        break;
    }
  }

  public getOrderTypeName(orderType: number): string {
    return OrderTypeName[OrderType[orderType] as OrderTypeName];
  }

  public menuOptionSelected(event: any, data: OrderManagement): void {
    switch (Number(event.item.properties.id)) {
      case MoreMenuType['Edit']:
        this.router.navigate(['./edit', data.id], { relativeTo: this.route });
        break;
      case MoreMenuType['Duplicate']:
        // TODO: pending implementation
        break;
      case MoreMenuType['Close']:
        // TODO: pending implementation
        break;
      case MoreMenuType['Delete']:
        // TODO: pending implementation
        break;
    }
  }
}

export enum OrderTypeName {
  ContractToPerm = 'ContractToPerm',
  OpenPerDiem = 'OpenPerDiem',
  PermPlacement = 'PermPlacement',
  Traveler = 'Traveler'
}

export enum OrderType {
  ContractToPerm = 0,
  OpenPerDiem = 1,
  PermPlacement = 2,
  Traveler = 3
}
