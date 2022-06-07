import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { FreezeService, GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { SetHeaderState } from 'src/app/store/app.actions';
import { ORDERS_GRID_CONFIG } from '../../client.config';
import { TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';
import { OrderManagemetTabs } from '@client/order-management/order-management-content/tab-navigation/tab-navigation.component';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { GetIncompleteOrders, GetOrders } from '@client/store/order-managment-content.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { OrderManagementPage } from '@shared/models/order-management.model';

export const ROW_HEIGHT = {
  SCALE_UP_HEIGHT: 140,
  SCALE_DOWN_HEIGHT: 64
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

  public allowWrap = ORDERS_GRID_CONFIG.isWordWrappingEnabled;
  public wrapSettings: TextWrapSettingsModel = ORDERS_GRID_CONFIG.wordWrapSettings;
  public isAllRowButtonsShown = true;

  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();

  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {
    super();
    store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
  }

  ngOnInit(): void {
    this.store.dispatch(new GetOrders({ orderBy: this.orderBy, pageNumber: this.currentPage, pageSize: this.pageSize }));

    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetOrders({ orderBy: this.orderBy, pageNumber: this.currentPage, pageSize: this.pageSize }));
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
        this.isAllRowButtonsShown = true;
        this.store.dispatch(new GetOrders({ orderBy: this.orderBy, pageNumber: this.currentPage, pageSize: this.pageSize }));
        break;
      case OrderManagemetTabs.OrderTemplates:
        // TODO: pending implementation
        break;
      case OrderManagemetTabs.Incomplete:
        this.isAllRowButtonsShown = false;
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
