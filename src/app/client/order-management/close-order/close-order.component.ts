import { Observable, takeUntil } from 'rxjs';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Order } from '@shared/models/order-management.model';
import { ShowCloseOrderDialog } from '../../../store/app.actions';
import { OrderTypeTitlesMap } from '@shared/enums/order-type';
import { RejectReason } from '@shared/models/reject-reason.model';
import { GetRejectReasonsForOrganisation } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { CloseOrderService } from '@client/order-management/close-order/close-order.service';

@Component({
  selector: 'app-close-order',
  templateUrl: './close-order.component.html',
  styleUrls: ['./close-order.component.scss'],
})
export class CloseOrderComponent extends DestroyableDirective implements OnChanges, OnInit {
  @Input() public order: Order;

  @Select(OrderManagementContentState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  public readonly reasonFields: FieldSettingsModel = { text: 'reason', value: 'id' };
  public readonly datepickerMask = { month: 'MM', day: 'DD', year: 'YYYY' };
  public startDate: Date;

  public dialogTitleType: string;
  public closeForm: FormGroup;

  public constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private actions: Actions,
    private closeOrderService: CloseOrderService
  ) {
    super();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['order']?.currentValue) {
     this.dialogTitleType = OrderTypeTitlesMap.get(this.order.orderType) as string;
      this.startDate = this.order?.jobStartDate;
    }
  }

  public ngOnInit(): void {
    this.store.dispatch(new GetRejectReasonsForOrganisation());
    this.initForm();
  }

  public onCancel(): void {
    this.closeDialog();
  }

  public onSave(): void {
    if (this.closeForm.invalid) {
      this.closeForm.markAllAsTouched();
    } else {
      this.closeOrder();
    }
  }

  private initForm(): void {
    this.closeForm = this.formBuilder.group({
        reason: [null, Validators.required],
        date: [null, Validators.required],
      });
    this.subscribeOnCloseSideBar();
  }

  private closeDialog(): void {
    this.store.dispatch(new ShowCloseOrderDialog(false));
  }

  private closeOrder(): void {
    //TODO
    console.error("not implemented");
    // const order = this.closeForm.getRawValue();
    //
    // this.closeOrderService
    //   .close(order)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(() => {
    //     this.onCancel();
    //   });
  }

  private subscribeOnCloseSideBar(): void {
    this.actions.pipe(
      ofActionSuccessful(ShowCloseOrderDialog),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.closeForm.reset();
    });
  }
}
