import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { filter, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { ItemModel } from '@syncfusion/ej2-angular-navigations';
import { MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';

import { SetHeaderState } from '../../store/app.actions';
import { OrderSystemConfig, SaveForLate, SubmitAsTemplate, SubmitForLater } from '@client/order-management/constants';
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
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { createSystem, updateSystemConfig } from '@client/order-management/helpers';
import { GetOrganizationStructure } from '../../store/user.actions';

@Component({
  selector: 'app-create-edit-order',
  templateUrl: './create-edit-order.component.html',
  styleUrls: ['./create-edit-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEditOrderComponent extends Destroyable implements OnInit {
  public saveEvents: Subject<void | MenuEventArgs> = new Subject<void | MenuEventArgs>();
  public title: string;
  public orderSystemConfig:ButtonModel[] = OrderSystemConfig;
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

  private orderManagementSystem: OrderManagementIRPSystemId | null;

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
    private changeDetection: ChangeDetectorRef,
    private orderManagementService: OrderManagementService,
  ) {
    super();
    this.setPageHeader();
  }

  ngOnInit(): void {
    this.setOrderManagementSystem();
    this.watchForOrganizationChnage();
    this.setSelectedOrder();
    this.getInitialData();
  }

  public navigateBack(): void {
    this.router.navigate(['/client/order-management']);
    this.selectSystemForOrderManagement();
  }

  public changeSystem(event: ButtonModel): void {
    this.activeSystem = event.id;
    this.setSubmitButtonConfig();
    this.getSkillsByActiveSystem();
  }

  public save(): void {
    this.saveEvents.next();
    this.selectSystemForOrderManagement();
  }

  public selectTypeSave(saveType: MenuEventArgs): void {
    this.saveEvents.next(saveType);
  }

  private setOrderManagementSystem(): void {
    this.orderManagementSystem = this.orderManagementService.getOrderManagementSystem();
  }

  private setPageHeader(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
  }

  private setSelectedOrder(): void {
    const selectedOrderId = this.route.snapshot.paramMap.get('orderId');

    if(selectedOrderId) {
      this.store.dispatch(new GetSelectedOrderById(
        +selectedOrderId,
        this.orderManagementSystem === OrderManagementIRPSystemId.IRP
      )).pipe(
          switchMap(() => this.selectedOrder$),
          filter(Boolean),
          takeUntil(this.componentDestroy())
        ).subscribe((selectedOrder: Order) => {
          this.selectedOrder = selectedOrder;
          this.showSystemToggle = false;
          this.setSubmitButtonConfig();

          this.changeDetection.markForCheck();
      });
    }

    this.setTitle(selectedOrderId);
  }

  private setTitle(isSelectedOrder: string | null): void {
    this.title = isSelectedOrder ? OrderTitle[OrderTitle.Edit] : OrderTitle[OrderTitle.Create];
  }

  private setSubmitButtonConfig(): void {
    if(!this.selectedOrder) {
      this.submitButtonConfig = this.activeSystem === OrderSystem.IRP? [SubmitForLater] : [SubmitForLater, SubmitAsTemplate];
    } else {
      this.submitButtonConfig = this.activeSystem === OrderSystem.IRP? [SaveForLate] : [SaveForLate, SubmitAsTemplate];
    }
  }

  private getInitialData(): void {
    this.store.dispatch([
      new GetRegions(),
      new GetOrderRequisitionByPage(),
      new GetAssociateAgencies(),
      new GetOrganizationStatesWithKeyCode(),
      new GetProjectSpecialData(),
      new GetOrganizationStructure(),
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
      this.selectedSystem = {...createSystem(organization, isIRPFlag)};

      this.showSystemToggle =
        this.selectedSystem.isIRP &&
        this.selectedSystem.isVMS &&
        this.selectedSystem.isIRPFlag;

      if( this.orderManagementSystem ) {
        this.activeSystem =
          this.orderManagementSystem === OrderManagementIRPSystemId.IRP ? OrderSystem.IRP : OrderSystem.VMS;
        this.orderManagementSystem = null;
      } else {
        this.activeSystem =
          this.selectedSystem.isIRP && this.activeSystem === OrderSystem.IRP ? OrderSystem.IRP : OrderSystem.VMS;
      }

      this.setSubmitButtonConfig();
      this.getSkillsByActiveSystem();
      updateSystemConfig(this.orderSystemConfig, this.activeSystem);
      this.changeDetection.markForCheck();
    });
  }

  private selectSystemForOrderManagement(): void {
    this.orderManagementService.setOrderManagementSystem(
      this.activeSystem === OrderSystem.IRP ? OrderManagementIRPSystemId.IRP : OrderManagementIRPSystemId.VMS
    );
  }

  private getSkillsByActiveSystem(): void {
    this.store.dispatch(new GetAssignedSkillsByOrganization({
      params: { SystemType: this.activeSystem === OrderSystem.IRP ? OrderSystem.VMS : OrderSystem.IRP },
    }));
  }
}
