import {
  ChangeDetectorRef, Component, EventEmitter, Input, OnChanges,
  OnInit, Output, SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { catchError, distinctUntilChanged, filter, Observable, takeUntil } from 'rxjs';

import { CloseOrderService } from '@client/order-management/components/close-order/close-order.service';
import { CloseOrderPayload } from '@client/order-management/components/close-order/models/closeOrderPayload.model';
import { ClosePositionPayload } from '@client/order-management/components/close-order/models/closePositionPayload.model';
import { SaveCloseOrderSucceeded } from '@client/store/order-managment-content.actions';
import { DateTimeHelper } from '@core/helpers';
import { GetClosureReasonsByPage } from '@organization-management/store/reject-reason.actions';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { CLOSE_ORDER_TITLE, DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, MULTI_CLOSE_ORDER } from '@shared/constants';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { MessageTypes } from '@shared/enums/message-types';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { OrderType, OrderTypeTitlesMap } from '@shared/enums/order-type';
import { Comment } from '@shared/models/comment.model';
import { Order, OrderManagement, OrderManagementChild } from '@shared/models/order-management.model';
import { RejectReasonPage, RejectReasonwithSystem } from '@shared/models/reject-reason.model';
import { CommentsService } from '@shared/services/comments.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { getAllErrors } from '@shared/utils/error.utils';
import { UserState } from 'src/app/store/user.state';
import { ShowCloseOrderDialog, ShowToast } from '../../../../store/app.actions';
import { OrderManagementService } from '../order-management-content/order-management.service';
import { PermissionService } from 'src/app/security/services/permission.service';

@Component({
  selector: 'app-close-order',
  templateUrl: './close-order.component.html',
  styleUrls: ['./close-order.component.scss'],
})
export class CloseOrderComponent extends DestroyableDirective implements OnChanges, OnInit {
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
  public minDate: Date | null;

  public dialogTitleType: string;
  public isPosition = false;
  public closeForm: FormGroup;
  public commentContainerId = 0;
  public comments: Comment[] = [];
  public closureReasons: RejectReasonwithSystem[];
  public canCreateOrder: boolean;

  public constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private actions: Actions,
    private closeOrderService: CloseOrderService,
    private confirmService: ConfirmService,
    private commentsService: CommentsService,
    private cd: ChangeDetectorRef,
    private orderManagementService: OrderManagementService,
    private permissionService: PermissionService
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
    this.subscribeToReasons();
    this.subscribeOnPermissions();
    this.onOrganizationChangedClosureReasons();
    this.initForm();
    this.subscribeOnCloseSideBar();
  }

  subscribeToReasons() {
    this.closureReasonsPage$.pipe(
      filter(x => x != undefined && x != null), 
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      if (this.orderManagementService.getOrderManagementSystem() === OrderManagementIRPSystemId.IRP) {        
        this.closureReasons = data.items.filter(f => f.includeInIRP == true);
      }
      if (this.orderManagementService.getOrderManagementSystem() === OrderManagementIRPSystemId.VMS) {
        this.closureReasons = data.items.filter(f => f.includeInVMS == true);
      }
    });
  }

  public onCancel(): void {
    if (this.closeForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => !!confirm),
          takeUntil(this.destroy$)
        ).subscribe(() => {
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
    this.organizationId$.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((e) => {
      this.store.dispatch(new GetClosureReasonsByPage(undefined, undefined, undefined, true, true));      
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
    this.commentsService.getComments(entity.commentContainerId as number, null).pipe(
      takeUntil(this.destroy$)
    ).subscribe((comments: Comment[]) => {
      this.comments = comments;
      this.cd.markForCheck();
    });
  }

  public setCloseDateAvailability(isPosition: boolean): void {
    this.isPosition = isPosition;
    this.setMaxDate();
    // converting jobStartDate to string as it is not a Date object actually and interface is wrong.
    this.minDate = DateTimeHelper.setCurrentTimeZone(this.order.jobStartDate as unknown as string);
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
    formData = { ...formData, closingDate: DateTimeHelper.setUtcTimeZone(DateTimeHelper.setInitDateHours(closingDate)) };

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
        catchError((err) => {
          this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
          return err;
        }),
        takeUntil(this.destroy$),
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

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().subscribe(({ canCreateOrder}) => {
      this.canCreateOrder = canCreateOrder;
    });
  }
}
