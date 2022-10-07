import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Select, Store } from '@ngxs/store';
import { debounceTime, first, Observable, Subject } from 'rxjs';
import { AgencyOrderManagement, Order, OrderManagement, ReOrder } from '@shared/models/order-management.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { AddEditReorderService } from '@client/order-management/add-edit-reorder/add-edit-reorder.service';
import { SidebarDialogTitlesEnum } from '@shared/enums/sidebar-dialog-titles.enum';
import { AppState } from 'src/app/store/app.state';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { OrderManagementService } from '@client/order-management/order-management-content/order-management.service';
import { filter } from 'rxjs/operators';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { UserState } from '../../../store/user.state';

@Component({
  selector: 'app-order-reorders-list',
  templateUrl: './order-re-orders-list.component.html',
  styleUrls: ['./order-re-orders-list.component.scss'],
})
export class OrderReOrdersListComponent extends AbstractGridConfigurationComponent implements OnInit {
  @Select(UserState.currentUserPermissions)
  public currentUserPermissions$: Observable<any[]>;

  public currentReOrders: ReOrder[] | undefined;
  @Input() set reOrders(value: ReOrder[] | any) {
    this.currentReOrders = value;
  }
  @Input() isAgency: boolean = false;
  @Input() order: Order | OrderManagement | AgencyOrderManagement;
  @Output() selectReOrder = new EventEmitter<{
    reOrder: OrderManagement | AgencyOrderManagement;
    order: Order | OrderManagement | AgencyOrderManagement;
  }>();
  @Output() editReorder = new EventEmitter();

  public canCreateOrder: boolean;

  private pageSubject = new Subject<number>();

  constructor(
    private store: Store,
    private orderManagementService: OrderManagementContentService,
    private addEditReOrderService: AddEditReorderService,
    private orderManagementAgencyService: OrderManagementAgencyService,
    private orderService: OrderManagementService
  ) {
    super();
  }

  ngOnInit() {
    this.subscribeOnPageChanges();
    this.subscribeOnPermissions();
  }

  private subscribeOnPageChanges(): void {
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
    });
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  onViewNavigation(reOrder: OrderManagement): void {
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

  edit(order: OrderManagement): void {
    if (!this.canCreateOrder) {
      return;
    }
    this.addEditReOrderService.setReOrderDialogTitle(SidebarDialogTitlesEnum.EditReOrder);
    this.orderManagementService.getOrderById(order.id).subscribe((order) => this.editReorder.emit(order));
  }

  private subscribeOnPermissions(): void {
    this.currentUserPermissions$
      .pipe(
        filter((permissions) => !!permissions?.length),
        first()
      )
      .subscribe((permissions) => {
        const permissionIds = permissions.map(({ permissionId }) => permissionId);
        this.canCreateOrder = permissionIds.includes(PermissionTypes.CanCreateOrder);
      });
  }
}
