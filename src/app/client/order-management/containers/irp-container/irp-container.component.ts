import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, TrackByFunction } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { filter, Subject, takeUntil } from 'rxjs';
import { MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';

import { IrpTabConfig } from '@client/order-management/containers/irp-container/irp-container.constant';
import { IrpTabs } from '@client/order-management/enums';
import { ListOfKeyForms, SelectSystem, TabsConfig } from '@client/order-management/interfaces';
import { Destroyable } from '@core/helpers';
import { OrderCredentialsService } from "@client/order-management/services";
import { IrpContainerStateService } from '@client/order-management/containers/irp-container/irp-container-state.service';
import {
  createOrderDTO,
  getControlsList,
  getFormsList,
  getValuesFromList,
  isFormsValid,
  showInvalidFormControl,
  showMessageForInvalidCredentials,
} from '@client/order-management/helpers';
import { SaveIrpOrder, EditIrpOrder, SaveIrpOrderSucceeded } from '@client/store/order-managment-content.actions';
import { CreateOrderDto, Order } from '@shared/models/order-management.model';
import { IOrderCredentialItem } from "@order-credentials/types";
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { CONFIRM_REVOKE_ORDER, ERROR_CAN_NOT_REVOKED } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { OrderType } from '@shared/enums/order-type';

@Component({
  selector: 'app-irp-container',
  templateUrl: './irp-container.component.html',
  styleUrls: ['./irp-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrpContainerComponent extends Destroyable implements OnInit, OnChanges {
  @Input('handleSaveEvents') public handleSaveEvents$: Subject<void | MenuEventArgs>;
  @Input() public selectedOrder: Order;
  @Input() selectedSystem: SelectSystem;

  public tabsConfig: TabsConfig[] = IrpTabConfig(true);
  public tabs = IrpTabs;
  public orderCredentials: IOrderCredentialItem[] = [];

  constructor(
    private orderCredentialsService: OrderCredentialsService,
    private irpStateService: IrpContainerStateService,
    private store: Store,
    private actions$: Actions,
    private router: Router,
    private confirmService: ConfirmService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForSaveEvents();
    this.watchForSucceededSaveOrder();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedOrder']?.currentValue) {
      this.tabsConfig = IrpTabConfig(this.selectedOrder.orderType !== OrderType.ReOrder);
      this.orderCredentials = [...this.selectedOrder.credentials];
    }
  }

  public trackByFn: TrackByFunction<TabsConfig> = (_: number, tab: TabsConfig) => tab.id;

  public updateOrderCredentials(credential: IOrderCredentialItem): void {
    this.orderCredentialsService.updateOrderCredentials(this.orderCredentials, credential);
  }

  public deleteOrderCredential(credential: IOrderCredentialItem): void {
    this.orderCredentialsService.deleteOrderCredential(this.orderCredentials, credential);
  }

  private watchForSucceededSaveOrder(): void {
    this.actions$.pipe(
      ofActionDispatched(SaveIrpOrderSucceeded),
      takeUntil(this.componentDestroy()),
      ).subscribe(() => {
      this.router.navigate(['/client/order-management']);
    });
  }

  private watchForSaveEvents(): void {
    this.handleSaveEvents$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((saveType: MenuEventArgs | void) => {
      this.irpStateService.saveEvents.next();
      const formState = this.irpStateService.getFormState();
      const formGroupList = getFormsList(formState);

      if(isFormsValid(formGroupList)) {
        this.saveValidOrder(saveType, formState);
      } else {
        showInvalidFormControl(getControlsList(formGroupList));
        formGroupList.forEach((form: FormGroup) => {
          form.markAllAsTouched();
        });
      }
    });
  }

  private saveValidOrder(saveType: MenuEventArgs | void, formState: ListOfKeyForms): void {
    if(saveType) {
      //Todo: add condition, when will be implement save for Template
      this.saveOrder(formState, saveType);
    } else {
      this.checkIsCredentialsValid(formState);
    }
  }

  private checkIsCredentialsValid(formState: ListOfKeyForms): void {
    if(this.orderCredentials?.length || this.selectedOrder?.orderType === OrderType.ReOrder) {
      this.saveOrder(formState);
    } else {
      showMessageForInvalidCredentials();
    }
  }

  private saveOrder(formState: ListOfKeyForms, saveType?: MenuEventArgs): void {
    const createdOrder = {
      ...createOrderDTO(formState, this.orderCredentials),
      contactDetails: getValuesFromList(formState.contactDetailsList),
      workLocations: getValuesFromList(formState.workLocationList as FormGroup[]),
      isSubmit: !saveType,
    };

   if(this.selectedOrder) {
     this.showRevokeMessageForEditOrder(createdOrder);
    } else {
      this.store.dispatch(new SaveIrpOrder(createdOrder,this.irpStateService.getDocuments()));
    }
  }

  private showRevokeMessageForEditOrder(order: CreateOrderDto): void {
    const isExternalLogicInclude = this.irpStateService.getIncludedExternalLogic(order);
    if(!isExternalLogicInclude && !this.selectedOrder.canRevoke) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, ERROR_CAN_NOT_REVOKED));
    } else if(!isExternalLogicInclude && !this.selectedOrder.canProceedRevoke) {
      this.confirmService
        .confirm(CONFIRM_REVOKE_ORDER, {
          title: 'Confirm',
          okButtonLabel: 'Revoke',
          okButtonClass: '',
        }).pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe(() => {
        this.saveEditedOrder(order);
      });
    } else {
      this.saveEditedOrder(order);
    }
  }

  private saveEditedOrder(order: CreateOrderDto): void {
    this.store.dispatch(new EditIrpOrder({
      ...order,
      id: this.selectedOrder.id,
      deleteDocumentsGuids: this.irpStateService.getDeletedDocuments(),
    },this.irpStateService.getDocuments()));
  }
}
