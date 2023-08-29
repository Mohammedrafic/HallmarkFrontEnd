import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { filter, Observable, Subject, switchMap, take, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { ItemModel } from '@syncfusion/ej2-angular-navigations';
import { MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';

import { SetHeaderState } from '../../store/app.actions';
import { OrderSystemConfig, SaveForLate, SubmitAsTemplate, SubmitForLater } from '@client/order-management/constants';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { AddEditOrderComponent } from '@client/order-management/components/add-edit-order/add-edit-order.component';
import { IrpContainerComponent } from '@client/order-management/containers/irp-container/irp-container.component';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';

import { Order } from '@shared/models/order-management.model';
import { SystemType } from '@shared/enums/system-type.enum';
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
import { PreservedOrderService } from '@client/order-management/services/preserved-order.service';
import { OrderManagementContentComponent } from './components/order-management-content/order-management-content.component';

@Component({
  selector: 'app-create-edit-order',
  templateUrl: './create-edit-order.component.html',
  styleUrls: ['./create-edit-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEditOrderComponent extends Destroyable implements OnInit {
  @ViewChild(AddEditOrderComponent) vmsOrder: AddEditOrderComponent;
  @ViewChild(IrpContainerComponent) irpOrder: IrpContainerComponent;
  @ViewChild(OrderManagementContentComponent) orderManagement : OrderManagementContentComponent;


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
  public activetab : boolean;
  private orderManagementSystem: OrderManagementIRPSystemId | null;

  @Select(OrderManagementContentState.selectedOrder)
  private selectedOrder$: Observable<Order>;
  @Select(OrganizationManagementState.organization)
  private readonly organization$: Observable<Organization>;
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  public externalCommentConfiguration?:boolean|null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private changeDetection: ChangeDetectorRef,
    private confirmService: ConfirmService,
    private orderManagementService: OrderManagementService,
    private preservedOrderService: PreservedOrderService
  ) {
    super();
    this.setPageHeader();
    const routerState = this.router.getCurrentNavigation()?.extras?.state;
    this.activetab =  routerState?.['isIRP'];
    console.log(this.activetab);
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

  public checkOrderFormState(event: ButtonModel): void {
    if (this.isActiveOrderFormTouched()) {
      this.confirmService.confirm(
        DELETE_CONFIRM_TEXT,
        {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(take(1))
        .subscribe((value: boolean) => {
          this.changeSystem(event.id, value);
        });
    } else {
      this.changeSystem(event.id);
    }
  }

  public save(): void {
    this.saveEvents.next();
    this.selectSystemForOrderManagement();
  }

  public selectTypeSave(saveType: MenuEventArgs): void {
    this.saveEvents.next(saveType);
  }

  private changeSystem(system: OrderSystem, updateSystem = true): void {
    if (updateSystem) {
      this.activeSystem = system;
      this.setSubmitButtonConfig();
      this.getSkillsByActiveSystem();
    } else {
      updateSystemConfig(this.orderSystemConfig, this.activeSystem);
      this.orderSystemConfig = [...this.orderSystemConfig];
    }

    this.preservedOrderService.saveSelectedOrderSystem(this.activeSystem);
    this.changeDetection.markForCheck();
  }

  private isActiveOrderFormTouched(): boolean {
    if (this.activeSystem === OrderSystem.IRP) {
     return this.irpOrder?.isOrderTouched();
    }

    if (this.activeSystem === OrderSystem.VMS) {
      return this.vmsOrder?.isOrderTouched();
    }

    return false;
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
      this.submitButtonConfig = this.activeSystem === OrderSystem.IRP? [SubmitForLater,SubmitAsTemplate] : [SubmitForLater, SubmitAsTemplate];
    } else {
      this.submitButtonConfig = this.activeSystem === OrderSystem.IRP? [SaveForLate,SubmitAsTemplate] : [SaveForLate, SubmitAsTemplate];
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
      this.externalCommentConfiguration=organization.externalCommentsConfiguration;
      this.showSystemToggle =
        this.selectedSystem.isIRP &&
        this.selectedSystem.isVMS &&
        this.selectedSystem.isIRPFlag;
      if( this.orderManagementSystem ) {
        this.orderManagementSystem = null;
      }
    if (this.activetab) {
    this.activeSystem = this.route.snapshot.data['system'] ?? OrderSystem.IRP;
    } else {
    this.activeSystem = this.route.snapshot.data['system'] ?? OrderSystem.VMS;
    }
      this.setSubmitButtonConfig();
      this.getSkillsByActiveSystem();
      updateSystemConfig(this.orderSystemConfig, this.activeSystem);
      this.changeDetection.markForCheck();
    });
  }

  private selectSystemForOrderManagement(): void {
    const system = this.route.snapshot.data['system'] ?? OrderSystem.VMS;
    this.orderManagementService.setOrderManagementSystem(
      system === OrderSystem.IRP ? OrderManagementIRPSystemId.IRP : OrderManagementIRPSystemId.VMS
    );
  }

  private getSkillsByActiveSystem(): void {
    if (this.activeSystem === OrderSystem.VMS) {
      this.store.dispatch(new GetAssignedSkillsByOrganization({ params: { SystemType: SystemType.VMS } }));
    }
  }
}
