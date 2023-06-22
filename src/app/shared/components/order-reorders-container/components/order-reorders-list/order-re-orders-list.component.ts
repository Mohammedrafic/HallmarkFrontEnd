import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { debounceTime, filter, Observable, Subject, takeUntil } from 'rxjs';

import { AgencyOrderManagement, Order, OrderManagement, ReOrder } from '@shared/models/order-management.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { AbstractGridConfigurationComponent } from
  '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { AddEditReorderService } from '@client/order-management/components/add-edit-reorder/add-edit-reorder.service';
import { SidebarDialogTitlesEnum } from '@shared/enums/sidebar-dialog-titles.enum';
import { AppState } from 'src/app/store/app.state';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { OrderManagementService } from
  '@client/order-management/components/order-management-content/order-management.service';
import { PermissionService } from '../../../../../security/services/permission.service';
import { GetReOrdersByOrderId, SaveReOrderPageSettings } from '../../store/re-order.actions';
import { PageSettings, ReOrderPage } from '../../interfaces';
import { TakeUntilDestroy } from '@core/decorators';
import { ReOrderState } from '../../store/re-order.state';


@TakeUntilDestroy
@Component({
  selector: 'app-order-reorders-list',
  templateUrl: './order-re-orders-list.component.html',
  styleUrls: ['./order-re-orders-list.component.scss'],
})
export class OrderReOrdersListComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() public isAgency = false;
  @Input() public order: Order | OrderManagement | AgencyOrderManagement;
  @Input() public set reOrders(value: ReOrderPage | null) {
    this.reOrdersList = value?.items || [];
    this.totalCountRecords = value?.totalCount || 0;
  }

  @Output() public editReorder = new EventEmitter();
  @Output() public selectReOrder = new EventEmitter<{
    reOrder: OrderManagement | AgencyOrderManagement;
    order: Order | OrderManagement | AgencyOrderManagement;
  }>();

  @Select(ReOrderState.GetReOrderPageSettings) private reorderPageSettings$: Observable<PageSettings>;

  public reOrdersList: ReOrder[];
  public totalCountRecords: number;
  public canCreateOrder: boolean;

  private pageSubject = new Subject<number>();
  protected componentDestroy: () => Observable<unknown>;

  constructor(
    private store: Store,
    private orderManagementService: OrderManagementContentService,
    private addEditReOrderService: AddEditReorderService,
    private orderManagementAgencyService: OrderManagementAgencyService,
    private orderService: OrderManagementService,
    private permissionService: PermissionService,
  ) {
    super();
  }

  ngOnInit() {
    this.subscribeOnPageChanges();
    this.subscribeOnPermissions();
    this.subscribeOnPagerState();
  }

  ngOnDestroy(): void { /**@TakeUntilDestro**/ }

  public onRowsDropDownChanged(event: number): void {
    this.pageSize = event;
    this.currentPage = 1;
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onViewNavigation(reOrder: OrderManagement): void {
    this.selectReOrder.emit({ reOrder: reOrder, order: this.order });
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);

    if (reOrder.publicId) {
      if (isAgencyArea) {
        this.orderManagementAgencyService.reorderId$.next({
          id: reOrder.publicId,
          prefix: reOrder.organizationPrefix,
        });
      } else {
        this.orderService.reorderId$.next({
          id: reOrder.publicId,
          prefix: reOrder.organizationPrefix,
        });
      }
    }
  }

  public edit(order: OrderManagement): void {
    if (!this.canCreateOrder) {
      return;
    }
    this.addEditReOrderService.setReOrderDialogTitle(SidebarDialogTitlesEnum.EditReOrder);
    this.orderManagementService.getOrderById(order.id).subscribe((order) => this.editReorder.emit(order));
  }

  public gridPageChanged(page: number): void {
    this.pageSubject.next(page);
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().subscribe(({ canCreateOrder }) => {
      this.canCreateOrder = canCreateOrder;
    });
  }

  private subscribeOnPageChanges(): void {
    this.pageSubject
      .pipe(
        debounceTime(1),
        takeUntil(this.componentDestroy())
      ).subscribe((page) => {
        this.currentPage = page;
        this.saveReorderGridPageSettings();
        this.getReOrdersByPageSettings();
      });
  }

  private getReOrdersByPageSettings(): void {
    const organizationId = this.isAgency ? this.order.organizationId : undefined;
    this.store.dispatch(new GetReOrdersByOrderId(this.order.id as number, this.currentPage, this.pageSize, organizationId));
  }

  private saveReorderGridPageSettings(): void {
    this.store.dispatch(new SaveReOrderPageSettings(this.currentPage, this.pageSize));
  }

  private subscribeOnPagerState(): void {
    this.reorderPageSettings$
      .pipe(
        filter(({ refreshPager }) => refreshPager),
        takeUntil(this.componentDestroy())
      ).subscribe(({ pageNumber, pageSize }) => {
        this.currentPage = pageNumber;
        this.pageSize = pageSize;
        this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
      });
  }
}
