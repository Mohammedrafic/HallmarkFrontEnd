import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Order, OrderManagement, OrderManagementChild } from '@shared/models/order-management.model';
import { ShowCloseOrderDialog } from '../../../../store/app.actions';
import { OrderType, OrderTypeTitlesMap } from '@shared/enums/order-type';
import { RejectReasonPage } from '@shared/models/reject-reason.model';
import { CloseOrderService } from '@client/order-management/components/close-order/close-order.service';
import { GetClosureReasonsByPage } from '@organization-management/store/reject-reason.actions';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { CloseOrderPayload } from '@client/order-management/components/close-order/models/closeOrderPayload.model';
import { CLOSE_ORDER_TITLE, DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, MULTI_CLOSE_ORDER } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { ClosePositionPayload } from '@client/order-management/components/close-order/models/closePositionPayload.model';
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';
import { UserState } from 'src/app/store/user.state';
import { SaveCloseOrderSucceeded } from '@client/store/order-managment-content.actions';
import { DateTimeHelper } from '@core/helpers';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';

@Component({
  selector: 'app-close-order',
  templateUrl: './close-order.component.html',
  styleUrls: ['./close-order.component.scss'],
})
export class CloseOrderComponent extends DestroyableDirective implements OnChanges, OnInit, OnDestroy {
  @Input() public order: Order | OrderManagement;
  @Input() candidate: OrderManagementChild;
  @Input() currentSystem: OrderManagementIRPSystemId;
  @Output() private closeOrderSuccess: EventEmitter<Order | OrderManagement> = new EventEmitter<
    Order | OrderManagement>();
  @Output() private closePositionSuccess: EventEmitter<OrderManagementChild> = new EventEmitter<OrderManagementChild>();

  @Select(UserState.lastSelectedOrganizationId)
  public organizationId$: Observable<number>;

  @Select(RejectReasonState.closureReasonsPage)
  public closureReasonsPage$: Observable<RejectReasonPage>;

  public readonly reasonFields: FieldSettingsModel = { text: 'reason', value: 'id' };
  public readonly datepickerMask = { month: 'MM', day: 'DD', year: 'YYYY' };
  public readonly systemTypes = OrderManagementIRPSystemId;
  public maxDate: Date | null;

  public dialogTitleType: string;
  public isPosition = false;
  public closeForm: FormGroup;
  public commentContainerId = 0;
  public comments: Comment[] = [];
  private unsubscribe$: Subject<void> = new Subject();

  public constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private actions: Actions,
    private closeOrderService: CloseOrderService,
    private confirmService: ConfirmService,
    private commentsService: CommentsService,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (!changes['currentValue']) {
      return;
    }
    const {
      order: { currentValue },
    } = changes;

    if (currentValue) {
      this.dialogTitleType = OrderTypeTitlesMap.get(currentValue.orderType) as string;
    }
  }

  public ngOnInit(): void {
    this.onOrganizationChangedClosureReasons();
    this.initForm();
    this.subscribeOnCloseSideBar();
  }

  public override ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  public onCancel(): void {
    if (this.closeForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
  }

  public onSave(): void {
    if (this.closeForm.invalid) {
      this.closeForm.markAllAsTouched();
    } else {
      this.submit();
    }
  }

  private onOrganizationChangedClosureReasons(): void {
    this.organizationId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.store.dispatch(new GetClosureReasonsByPage(undefined, undefined, undefined, true));
    });
  }

  private initForm(): void {
    this.closeForm = this.formBuilder.group({
      reasonId: [null, Validators.required],
      closingDate: [null, Validators.required],
    });
  }

  private setMaxDate(): void {
    let maxDate;
    if (this.order.orderType === OrderType.ReOrder) {
      maxDate = this.order.jobStartDate;
    } else if (this.isPosition) {
      maxDate = new Date(this.candidate.actualEndDate || 0);
    } else {
      maxDate = this.order.jobEndDate;
    }
    this.maxDate = maxDate || null;
  }

  private getComments(): void {
    let entity;
    this.comments = [];
    if (this.isPosition) {
      this.commentContainerId = this.candidate.commentContainerId as number;
      entity = this.candidate;
    } else {
      this.commentContainerId = this.order.commentContainerId as number;
      entity = this.order;
    }
    this.commentsService.getComments(entity.commentContainerId as number, null).subscribe((comments: Comment[]) => {
      this.comments = comments;
      this.cd.markForCheck();
    });
  }

  public setCloseDateAvailability(isPosition: boolean): void {
    this.isPosition = isPosition;
    this.setMaxDate();
    this.getComments();
  }

  private closeDialog(): void {
    this.store.dispatch(new ShowCloseOrderDialog(false));
  }

  private submit(): void {
    const currentOrder = this.order as Order;
    const isIrpOrder = !!currentOrder.irpOrderMetadata;

    let formData = this.closeForm.getRawValue();
    const { closingDate } = formData;
    formData = { ...formData, closingDate: DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(closingDate)) };

    if (this.isPosition) {
      this.closePosition(formData);
    } else {

    if (currentOrder.irpOrderMetadata && !currentOrder.isIRPOnly) {
      this.confirmService.confirm(MULTI_CLOSE_ORDER, {
        title: CLOSE_ORDER_TITLE,
        okButtonLabel: 'Close',
        okButtonClass: 'delete-button',
      })
      .pipe(
        filter((confirm) => !!confirm)
      )
      .subscribe(() => {
        this.closeOrder(formData, isIrpOrder);
      });
    } else {
      this.closeOrder(formData, isIrpOrder);
    }
      
    }
  }

  private closeOrder(formData: Omit<CloseOrderPayload, 'orderId'>, isIrpOrder: boolean): void {
    this.closeOrderService.closeOrder({ ...formData, orderId: this.order.id }, isIrpOrder)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe(() => {
      this.store.dispatch(new SaveCloseOrderSucceeded(this.order));
      this.closeOrderSuccess.emit(this.order);
      this.closeDialog();
    });
  }

  private closePosition(formData: ClosePositionPayload): void {
    this.closeOrderService.closePosition({ ...formData, jobId: this.candidate.jobId })
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe(() => {
      this.closePositionSuccess.emit(this.candidate);
      this.closeDialog();
    });
  }

  private subscribeOnCloseSideBar(): void {
    this.actions.pipe(ofActionSuccessful(ShowCloseOrderDialog), takeUntil(this.destroy$)).subscribe((res) => {
      if (!res.isDialogShown) {
        this.closeForm.reset();
      }
    });
  }
}
