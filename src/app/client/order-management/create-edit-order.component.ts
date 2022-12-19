import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { filter, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { ItemModel } from '@syncfusion/ej2-angular-navigations';
import { MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';

import { SetHeaderState } from '../../store/app.actions';
import { OrderSystemConfig, SubmitAsTemplate, SubmitForLater } from '@client/order-management/constants';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { Order } from '@shared/models/order-management.model';
import { Destroyable } from '@core/helpers';
import {
  GetAssociateAgencies,
  GetOrganizationStatesWithKeyCode,
  GetProjectSpecialData,
  GetSelectedOrderById,
} from '@client/store/order-managment-content.actions';
import { OrderSystem, OrderTitle } from '@client/order-management/enums';
import { ButtonModel } from '@shared/models/buttons-group.model';
import {
  GetAssignedSkillsByOrganization,
  GetOrganizationById,
  GetRegions,
} from '@organization-management/store/organization-management.actions';
import { GetOrderRequisitionByPage } from '@organization-management/store/reject-reason.actions';
import { AppState } from '../../store/app.state';
import { Organization } from '@shared/models/organization.model';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { UserState } from '../../store/user.state';
import { SelectSystem } from '@client/order-management/interfaces';

@Component({
  selector: 'app-create-edit-order',
  templateUrl: './create-edit-order.component.html',
  styleUrls: ['./create-edit-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEditOrderComponent extends Destroyable implements OnInit {
  public saveEvents: Subject<void | MenuEventArgs> = new Subject<void | MenuEventArgs>();
  public title: string;
  public readonly orderSystemConfig:ButtonModel[] = OrderSystemConfig;
  public submitButtonConfig: ItemModel[];
  public selectedOrder: Order;
  public activeSystem: OrderSystem;
  public orderSystem = OrderSystem;
  public showSystemToggle = false;
  public selectedSystem: SelectSystem = {
    isIRP: false,
    isVMS: false,
    isIRPFlag: false,
  };

  @Select(OrderManagementContentState.selectedOrder)
  private selectedOrder$: Observable<Order>;
  @Select(OrganizationManagementState.organization)
  private readonly organization$: Observable<Organization>;
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private changeDetection: ChangeDetectorRef
  ) {
    super();
    this.setPageHeader();
  }

  ngOnInit(): void {
    this.watchForOrganizationChnage();
    this.setSelectedOrder();
    this.setSubmitButtonConfig();
    this.getInitialData();
  }

  public navigateBack(): void {
    this.router.navigate(['/client/order-management']);
  }

  public changeSystem(event: ButtonModel): void {
    this.activeSystem = event.id;
    this.setSubmitButtonConfig();
  }

  public save(): void {
    this.saveEvents.next();
  }

  public selectTypeSave(saveType: MenuEventArgs): void {
    this.saveEvents.next(saveType);
  }

  private setPageHeader(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
  }

  private setSelectedOrder(): void {
    const selectedOrderId = this.route.snapshot.paramMap.get('orderId');

    if(selectedOrderId) {
      this.store.dispatch(new GetSelectedOrderById(+selectedOrderId))
        .pipe(
          switchMap(() => this.selectedOrder$),
          filter(Boolean),
          takeUntil(this.componentDestroy())
        ).subscribe((selectedOrder: Order) => {
          this.selectedOrder = selectedOrder;
          this.activeSystem = selectedOrder?.isIRPOnly ? OrderSystem.IRP : OrderSystem.VMS;
          this.showSystemToggle = false;
          this.changeDetection.markForCheck();
      });
    }

    this.setTitle(selectedOrderId);
  }

  private setTitle(isSelectedOrder: string | null): void {
    this.title = isSelectedOrder ? OrderTitle[OrderTitle.Edit] : OrderTitle[OrderTitle.Create];
  }

  private setSubmitButtonConfig(): void {
    this.submitButtonConfig = this.activeSystem === OrderSystem.IRP? [SubmitForLater] : [SubmitForLater, SubmitAsTemplate] ;
  }

  private getInitialData(): void {
    this.store.dispatch([
      new GetRegions(),
      new GetAssignedSkillsByOrganization(),
      new GetOrderRequisitionByPage(),
      new GetAssociateAgencies(),
      new GetOrganizationStatesWithKeyCode(),
      new GetProjectSpecialData(),
    ]);
  }

  private watchForOrganizationChnage(): void {
    this.organizationId$.pipe(
      switchMap((id: number) => {
        return this.store.dispatch(new GetOrganizationById(id));
      }),
      switchMap(() => this.organization$),
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((organization: Organization) => {
      const isIRPFlag = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
      this.selectedSystem = {
        isIRP: !!organization.preferences.isIRPEnabled,
        isVMS: !!organization.preferences.isVMCEnabled,
        isIRPFlag,
      };

      this.showSystemToggle =
        this.selectedSystem.isIRP &&
        this.selectedSystem.isVMS &&
        this.selectedSystem.isIRPFlag;

      this.setSubmitButtonConfig();
      this.activeSystem = this.selectedSystem.isIRP ? OrderSystem.IRP : OrderSystem.VMS;
      this.changeDetection.markForCheck();
    });
  }
}
