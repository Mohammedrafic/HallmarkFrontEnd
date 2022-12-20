import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, TrackByFunction } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { Subject, takeUntil } from 'rxjs';
import { MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';

import { IrpTabConfig } from '@client/order-management/containers/irp-container/irp-container.constant';
import { IrpTabs } from '@client/order-management/enums';
import { ListOfKeyForms, TabsConfig } from '@client/order-management/interfaces';
import { Destroyable } from '@core/helpers';
import { OrderCredentialsService } from "@client/order-management/services";
import { IrpContainerStateService } from '@client/order-management/containers/irp-container/irp-container-state.service';
import {
  createOrderDTO,
  getControlsList,
  getFormsList,
  getValuesFromList,
  isFormsValid,
  showInvalidFormControl, showMessageForInvalidCredentials,
} from '@client/order-management/helpers';
import { SaveIrpOrder, EditIrpOrder, SaveIrpOrderSucceeded } from '@client/store/order-managment-content.actions';
import { IrpOrderType } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.enum';
import { Order } from '@shared/models/order-management.model';
import { IOrderCredentialItem } from "@order-credentials/types";

@Component({
  selector: 'app-irp-container',
  templateUrl: './irp-container.component.html',
  styleUrls: ['./irp-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrpContainerComponent extends Destroyable implements OnInit, OnChanges {
  @Input('handleSaveEvents') public handleSaveEvents$: Subject<void | MenuEventArgs>;
  @Input() public selectedOrder: Order;

  public tabsConfig: TabsConfig[] = IrpTabConfig;
  public tabs = IrpTabs;
  public orderCredentials: IOrderCredentialItem[] = [];

  constructor(
    private orderCredentialsService: OrderCredentialsService,
    private irpStateService: IrpContainerStateService,
    private store: Store,
    private actions$: Actions,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForSaveEvents();
    this.watchForSucceededSaveOrder();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedOrder'].currentValue) {
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
    if(this.orderCredentials?.length) {
      this.saveOrder(formState);
    } else {
      showMessageForInvalidCredentials();
    }
  }

  private saveOrder(formState: ListOfKeyForms, saveType?: MenuEventArgs): void {
    const { orderType } = formState.orderType.getRawValue();
    let createdOrder;
    
    if(orderType === IrpOrderType.LongTermAssignment) {
      createdOrder = {
        ...createOrderDTO(formState, this.orderCredentials),
        contactDetails: getValuesFromList(formState.contactDetailsList),
        isSubmit: !saveType,
      };
    } else {
      createdOrder = {
        ...createOrderDTO(formState, this.orderCredentials),
        contactDetails: getValuesFromList(formState.contactDetailsList),
        workLocations: getValuesFromList(formState.workLocationList as FormGroup[]),
        isSubmit: false,
      };
    }

    if(this.selectedOrder) {
      this.store.dispatch(new EditIrpOrder({
        ...createdOrder,
        id: this.selectedOrder.id,
        deleteDocumentsGuids: this.irpStateService.getDeletedDocuments(),
      },this.irpStateService.getDocuments()));
    } else {
      this.store.dispatch(new SaveIrpOrder(createdOrder,this.irpStateService.getDocuments()));
    }
  }
}
