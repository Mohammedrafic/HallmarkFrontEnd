import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Actions, ofActionSuccessful, Select, Store, ofActionDispatched } from '@ngxs/store';

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Order, OrderManagement, OrderManagementChild } from '@shared/models/order-management.model';
import { ShowCloseOrderDialog } from '../../../store/app.actions';
import { OrderType, OrderTypeTitlesMap } from '@shared/enums/order-type';
import { RejectReasonPage } from '@shared/models/reject-reason.model';
import { CloseOrderService } from '@client/order-management/close-order/close-order.service';
import { GetClosureReasonsByPage } from '@organization-management/store/reject-reason.actions';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { CloseOrderPayload } from '@client/order-management/close-order/models/closeOrderPayload.model';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { ClosePositionPayload } from '@client/order-management/close-order/models/closePositionPayload.model';
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';
import { UserState } from 'src/app/store/user.state';
import { toCorrectTimezoneFormat } from '@shared/utils/date-time.utils';
import { UserAgencyOrganization } from '@shared/models/user-agency-organization.model';
import { AlertIdEnum, AlertParameterEnum } from '@admin/alerts/alerts.enum';
import { AlertTriggerDto } from '@shared/models/alerts-template.model';
import { SaveCloseOrderSucceeded } from '@client/store/order-managment-content.actions';
import { OrderStatus } from '@shared/enums/order-management';
import { AlertTrigger } from '@admin/store/alerts.actions';

@Component({
  selector: 'app-close-order',
  templateUrl: './close-order.component.html',
  styleUrls: ['./close-order.component.scss'],
})
export class CloseOrderComponent extends DestroyableDirective implements OnChanges, OnInit,OnDestroy {
  @Input() public order: Order | OrderManagement;
  @Input() candidate: OrderManagementChild;
  @Output() private closeOrderSuccess: EventEmitter<Order | OrderManagement> = new EventEmitter<
    Order | OrderManagement
  >();
  @Output() private closePositionSuccess: EventEmitter<OrderManagementChild> = new EventEmitter<OrderManagementChild>();

  @Select(UserState.lastSelectedOrganizationId)
  public organizationId$: Observable<number>;

  @Select(RejectReasonState.closureReasonsPage)
  public closureReasonsPage$: Observable<RejectReasonPage>;

  public readonly reasonFields: FieldSettingsModel = { text: 'reason', value: 'id' };
  public readonly datepickerMask = { month: 'MM', day: 'DD', year: 'YYYY' };
  public minDate: Date | null;

  public dialogTitleType: string;
  public isPosition: boolean = false;
  public closeForm: FormGroup;
  public commentContainerId: number = 0;
  public comments: Comment[] = [];
  private unsubscribe$: Subject<void> = new Subject();

  public constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private actions: Actions,
    private closeOrderService: CloseOrderService,
    private confirmService: ConfirmService,
    private commentsService: CommentsService,
    private actions$: Actions
  ) {
    super();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['order']?.currentValue) {
      this.dialogTitleType = OrderTypeTitlesMap.get(this.order.orderType) as string;
      this.setMinDate();
    }
  }

  public ngOnInit(): void {
    this.onOrganizationChangedClosureReasons();
    this.initForm();
    this.subscribeOnCloseSideBar();
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(SaveCloseOrderSucceeded)).subscribe((data) => {
      const userAgencyOrganization = this.store.selectSnapshot(UserState.organizations) as UserAgencyOrganization;
      let orgName = userAgencyOrganization?.businessUnits?.find(i => i.id == data?.order?.organizationId)?.name;
      let params: any = {};
      params['@' + AlertParameterEnum[AlertParameterEnum.Organization]] = orgName == null || orgName == undefined ? "" : orgName;
      params['@' + AlertParameterEnum[AlertParameterEnum.OrderID]] =
        data?.order?.organizationPrefix == null
          ? data?.order?.publicId + ''
          : data?.order?.organizationPrefix + '-' + data?.order?.publicId;
      params['@' + AlertParameterEnum[AlertParameterEnum.Location]] = data?.order?.locationName;
      params['@' + AlertParameterEnum[AlertParameterEnum.Skill]] = data?.order?.skillName == null ? "" : data?.order?.skillName;
      //For Future Reference
      // var url = location.origin + '/ui/client/order-management/edit/' + data?.order?.id;
      params['@' + AlertParameterEnum[AlertParameterEnum.ClickbackURL]] = "";
      
      let  alertTriggerDto : AlertTriggerDto = {
          BusinessUnitId: data?.order?.organizationId,
          AlertId: AlertIdEnum['Order Status Update: Closed'],
          Parameters: params,
        };
      
      if (alertTriggerDto.AlertId > 0) {
        this.store.dispatch(new AlertTrigger(alertTriggerDto));
      }

    });
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

  private setMinDate(): void {
    this.minDate = this.order.orderType !== OrderType.OpenPerDiem ? (this.order?.jobStartDate as Date) : null;
  }

  private getComments(): void {
    let entity;
    if (this.isPosition) {
      this.commentContainerId = this.candidate.commentContainerId as number;
      entity = this.candidate;
    } else {
      this.commentContainerId = this.order.commentContainerId as number;
      entity = this.order;
    }
    this.commentsService.getComments(entity.commentContainerId as number, null).subscribe((comments: Comment[]) => {
      this.comments = comments;
    });
  }

  public setCloseDateAvailability(isPosition: boolean): void {
    if (this.order?.orderType === OrderType.ReOrder) {
      this.closeForm.patchValue({ closingDate: new Date(this.order.jobStartDate as Date) });
      this.closeForm.get('closingDate')?.disable();
    } else {
      this.closeForm.get('closingDate')?.enable();
    }
    this.getComments();
  }

  private closeDialog(): void {
    this.store.dispatch(new ShowCloseOrderDialog(false));
  }

  private submit(): void {
    let formData = this.closeForm.getRawValue();
    const { closingDate } = formData;
    formData = { ...formData, closingDate: toCorrectTimezoneFormat(closingDate) };

    if (this.isPosition) {
      this.closePosition(formData);
    } else {
      this.closeOrder(formData);
    }
  }

  private closeOrder(formData: Omit<CloseOrderPayload, 'orderId'>): void {
    this.closeOrderService.closeOrder({ ...formData, orderId: this.order.id }).subscribe(() => {
      this.store.dispatch(new SaveCloseOrderSucceeded(this.order));
      this.closeOrderSuccess.emit(this.order);
      this.closeDialog();
    });
  }

  private closePosition(formData: ClosePositionPayload): void {
    this.closeOrderService.closePosition({ ...formData, jobId: this.candidate.jobId }).subscribe(() => {
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
