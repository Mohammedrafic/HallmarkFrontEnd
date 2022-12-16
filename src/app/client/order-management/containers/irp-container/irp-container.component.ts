import { ChangeDetectionStrategy, Component, Input, OnInit, TrackByFunction } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';

import { IrpTabConfig } from '@client/order-management/containers/irp-container/irp-container.constant';
import { IrpTabs } from '@client/order-management/enums';
import { ListOfKeyForms, TabsConfig } from '@client/order-management/interfaces';
import { Destroyable } from '@core/helpers';
import { IrpContainerStateService } from '@client/order-management/containers/irp-container/irp-container-state.service';
import {
  createOrderDTO,
  getControlsList,
  getFormsList,
  getValuesFromList,
  isFormsValid,
  showInvalidFormControl,
} from '@client/order-management/helpers';
import { SaveIrpOrder, SaveOrderSucceeded } from '@client/store/order-managment-content.actions';
import { FormGroup } from '@angular/forms';
import { IrpOrderType } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.enum';

@Component({
  selector: 'app-irp-container',
  templateUrl: './irp-container.component.html',
  styleUrls: ['./irp-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrpContainerComponent extends Destroyable implements OnInit {
  @Input('handleSaveEvents') public handleSaveEvents$: Subject<void | MenuEventArgs>;

  public tabsConfig: TabsConfig[] = IrpTabConfig;
  public tabs = IrpTabs;

  constructor(
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

  public trackByFn: TrackByFunction<TabsConfig> = (_: number, tab: TabsConfig) => tab.id;

  private watchForSucceededSaveOrder(): void {
    this.actions$.pipe(
      ofActionDispatched(SaveOrderSucceeded),
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
      this.saveOrder(formState);
    } else {
      this.saveOrder(formState);
    }
  }

  private saveOrder(formState: ListOfKeyForms): void {
    const { orderType } = formState.orderType.getRawValue();
    let createdOrder;

    if(orderType === IrpOrderType.LongTermAssignment) {
      createdOrder = {
        ...createOrderDTO(formState),
        contactDetails: getValuesFromList(formState.contactDetailsList),
      };
    } else {
      createdOrder = {
        ...createOrderDTO(formState),
        contactDetails: getValuesFromList(formState.contactDetailsList),
        workLocations: getValuesFromList(formState.workLocationList as FormGroup[]),
        isSubmit: false,
      };
    }

    this.store.dispatch(new SaveIrpOrder(createdOrder,this.irpStateService.getDocuments()));
  }
}
