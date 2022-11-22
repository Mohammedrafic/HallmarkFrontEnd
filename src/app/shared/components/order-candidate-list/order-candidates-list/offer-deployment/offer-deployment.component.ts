import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import {
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  deployedCandidateMessage,
  DEPLOYED_CANDIDATE,
  SET_READONLY_STATUS,
} from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { ConfirmService } from '@shared/services/confirm.service';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { filter, Observable, Subject, takeUntil, of, take } from 'rxjs';

import { BillRate } from '@shared/models/bill-rate.model';
import { ApplicantStatus, OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import {
  GetOrganisationCandidateJob,
  GetRejectReasonsForOrganisation,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  UpdateOrganisationCandidateJob,
} from '@client/store/order-managment-content.actions';

import { ApplicantStatus as ApplicantStatusEnum, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { BillRatesComponent } from '@shared/components/bill-rates/bill-rates.component';
import { RejectReason } from '@shared/models/reject-reason.model';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import { ShowToast } from 'src/app/store/app.actions';
import PriceUtils from '@shared/utils/price.utils';
import { toCorrectTimezoneFormat } from '@shared/utils/date-time.utils';
import { Comment } from '@shared/models/comment.model';
import { CommentsService } from '@shared/services/comments.service';
import { GetOrderPermissions } from 'src/app/store/user.actions';
import { UserState } from 'src/app/store/user.state';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { hasEditOrderBillRatesPermission } from '../../order-candidate-list.utils';
import { DeployedCandidateOrderInfo } from '@shared/models/deployed-candidate-order-info.model';
import { DateTimeHelper } from '@core/helpers';

@Component({
  selector: 'app-offer-deployment',
  templateUrl: './offer-deployment.component.html',
  styleUrls: ['./offer-deployment.component.scss'],
  providers: [MaskedDateTimeService],
})
export class OfferDeploymentComponent implements OnInit, OnDestroy, OnChanges {
  @Select(OrderManagementContentState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  @Select(UserState.orderPermissions)
  orderPermissions$: Observable<CurrentUserPermission[]>;

  @ViewChild('billRates') billRatesComponent: BillRatesComponent;
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Output() public closeDialogEmitter: EventEmitter<void> = new EventEmitter();

  @Input() candidate: OrderCandidatesList;
  @Input() isTab: boolean = false;
  @Input() isAgency: boolean = false;
  @Input() actionsAllowed: boolean;
  @Input() deployedCandidateOrderInfo: DeployedCandidateOrderInfo[];
  @Input() candidateOrderIds: string[];
  @Input() isOrderOverlapped: boolean;

  public statusesFormControl = new FormControl();
  public openRejectDialog = new Subject<boolean>();
  public billRatesData: BillRate[] = [];
  public formGroup: FormGroup;
  public nextApplicantStatuses: ApplicantStatus[];
  public orderPermissions: CurrentUserPermission[];
  public optionFields = { text: 'statusText', value: 'statusText' };
  public rejectReasons: RejectReason[] = [];
  public isRejected = false;
  public isClosedPosition = false;
  public candidatStatus = CandidatStatus;
  public candidateJob: OrderCandidateJob | null;
  public today = new Date();
  public priceUtils = PriceUtils;
  public hasEditOrderBillRatesPermission: boolean;

  get showYearsOfExperience(): boolean {
    return (
      this.candidate.status === ApplicantStatusEnum.Applied ||
      this.candidate.status === ApplicantStatusEnum.Shortlisted ||
      this.candidate.status === ApplicantStatusEnum.PreOfferCustom
    );
  }

  get showGuaranteedWorkWeek(): boolean {
    return (
      this.candidate.status === ApplicantStatusEnum.Applied ||
      this.candidate.status === ApplicantStatusEnum.Shortlisted ||
      this.candidate.status === ApplicantStatusEnum.PreOfferCustom ||
      this.candidate.status === ApplicantStatusEnum.Offered
    );
  }

  get isReadOnly(): boolean {
    return this.isRejected || this.readOnlyMode;
  }

  get isReadOnlyBillRates(): boolean {
    return (
      this.candidate.status === ApplicantStatusEnum.Withdraw ||
      this.isRejected || (!this.canShortlist && !this.canInterview && !this.canReject && !this.canOffer && !this.canOnboard)
    );
  }

  get isDeployedCandidate(): boolean {
    return !!this.candidate.deployedCandidateInfo && this.candidate.status !== ApplicantStatusEnum.OnBoarded;
  }

  get statusText(): string {
    return this.candidateJob?.applicantStatus.statusText as string;
  }

  get applicationStatus(): ApplicantStatusEnum {
    return this.candidateJob?.applicantStatus.applicantStatus as ApplicantStatusEnum;
  }

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;
  @Select(OrderManagementContentState.applicantStatuses)
  applicantStatuses$: Observable<ApplicantStatus[]>;

  private unsubscribe$: Subject<void> = new Subject();
  private currentApplicantStatus: ApplicantStatus;
  private readOnlyMode: boolean;

  public comments: Comment[] = [];

  public canShortlist = false;
  public canInterview = false;
  public canReject = false;
  public canOffer = false;
  public canOnboard = false;
  public canClose = false;

  get candidateStatus(): ApplicantStatusEnum {
    return this.candidate.status || (this.candidate.candidateStatus as any);
  }

  constructor(
    private store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private commentsService: CommentsService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidate']?.currentValue) {
      this.readOnlyMode =
        this.candidateStatus === ApplicantStatusEnum.Withdraw || this.candidateStatus === ApplicantStatusEnum.Rejected;
      this.isClosedPosition = this.candidateStatus === ApplicantStatusEnum.Offboard;
    }

    this.checkRejectReason();
    this.switchFormState();
  }

  public ngOnInit(): void {
    this.today.setHours(0);
    this.createForm();
    this.subscribeOnInitialData();
    this.subscribeOnSuccessRejection();
    this.subscribeOnReasonsList();
    this.switchFormState();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onClose(): void {
    if (this.formGroup.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => confirm))
        .subscribe(() => {
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
  }

  public onRejectCandidate(event: { rejectReason: number }): void {
    this.isRejected = true;

    if (this.candidateJob) {
      const payload = {
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        rejectReasonId: event.rejectReason,
      };

      const value = this.rejectReasons.find((reason: RejectReason) => reason.id === event.rejectReason)?.reason;
      this.formGroup.patchValue({ rejectReason: value });
      this.store.dispatch(new RejectCandidateJob(payload));
      this.closeDialog();
    }
  }

  public cancelRejectCandidate(): void {
    this.statusesFormControl.reset();
  }

  public updateCandidateJob(event: { itemData: ApplicantStatus }, reloadJob = false): void {
    if (event.itemData?.isEnabled) {
      if (event.itemData?.applicantStatus === ApplicantStatusEnum.Rejected) {
        this.onReject();
      } else {
        this.offerCandidate(event.itemData, reloadJob);
      }
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, SET_READONLY_STATUS));
    }
  }

  private offerCandidate(applicantStatus: ApplicantStatus, reloadJob: boolean): void {
    if (!this.formGroup.errors && this.candidateJob) {
      this.shouldChangeCandidateStatus()
        .pipe(take(1))
        .subscribe((isConfirm) => {
          if (isConfirm && this.candidateJob) {
            const value = this.formGroup.getRawValue();
            this.store
              .dispatch(
                new UpdateOrganisationCandidateJob({
                  orderId: this.candidateJob.orderId,
                  organizationId: this.candidateJob.organizationId,
                  jobId: this.candidateJob.jobId,
                  nextApplicantStatus: applicantStatus,
                  candidateBillRate: this.candidateJob.candidateBillRate,
                  offeredBillRate: value.offeredBillRate,
                  requestComment: this.candidateJob.requestComment,
                  actualStartDate: this.candidateJob.actualStartDate,
                  actualEndDate: this.candidateJob.actualEndDate,
                  clockId: this.candidateJob.clockId,
                  guaranteedWorkWeek: value.guaranteedWorkWeek,
                  offeredStartDate: DateTimeHelper.toUtcFormat(new Date(value.offeredStartDate)),
                  allowDeployWoCredentials: true,
                  billRates: this.billRatesComponent.billRatesControl.value,
                })
              )
              .subscribe(() => {
                this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
                if (reloadJob) {
                  this.store.dispatch(
                    new GetOrganisationCandidateJob(
                      this.candidateJob?.organizationId as number,
                      this.candidate.candidateJobId
                    )
                  );
                }
              });
            if (!reloadJob) {
              this.closeDialog();
            }
          } else {
            this.statusesFormControl.reset();
          }
        });
    }
  }

  private shouldChangeCandidateStatus(): Observable<boolean> {
    const options = {
      title: DEPLOYED_CANDIDATE,
      okButtonLabel: 'Proceed',
      okButtonClass: 'ok-button',
    };

    return this.isDeployedCandidate && this.isAgency && this.isOrderOverlapped
      ? this.confirmService.confirm(deployedCandidateMessage(this.candidateOrderIds), options)
      : of(true);
  }

  public onBillRatesChanged(): void {
    this.updateCandidateJob({ itemData: this.currentApplicantStatus }, true);
  }

  private createForm(): void {
    this.formGroup = new FormGroup({
      jobId: new FormControl(null),
      jobDate: new FormControl(''),
      offeredBillRate: new FormControl(null, [Validators.required]),
      orderBillRate: new FormControl(null),
      locationName: new FormControl(''),
      availableStartDate: new FormControl(''),
      candidateBillRate: new FormControl(null),
      requestComment: new FormControl(''),
      rejectReason: new FormControl(''),
      yearsOfExperience: new FormControl(''),
      expAsTravelers: new FormControl(''),
      guaranteedWorkWeek: new FormControl('', [Validators.maxLength(200)]),
      offeredStartDate: new FormControl(''),
    });
  }

  private setFormValue(data: OrderCandidateJob): void {
    this.formGroup.setValue({
      jobId: `${data.organizationPrefix}-${data.orderPublicId}`,
      jobDate: [DateTimeHelper.formatDateUTC(data.order.jobStartDate.toString(), 'MM/dd/yyyy'), DateTimeHelper.formatDateUTC(data.order.jobEndDate.toString(), 'MM/dd/yyyy')],
      offeredBillRate: PriceUtils.formatNumbers(data.offeredBillRate || data.order.hourlyRate),
      orderBillRate: data.order.hourlyRate && PriceUtils.formatNumbers(data.order.hourlyRate),
      locationName: data.order.locationName,
      availableStartDate: DateTimeHelper.formatDateUTC(data.availableStartDate, 'MM/dd/yyyy'),
      candidateBillRate: PriceUtils.formatNumbers(data.candidateBillRate),
      requestComment: data.requestComment,
      rejectReason: data.rejectReason,
      yearsOfExperience: data.yearsOfExperience,
      expAsTravelers: data.expAsTravelers,
      guaranteedWorkWeek: data.guaranteedWorkWeek,
      offeredStartDate: DateTimeHelper.formatDateUTC(data.offeredStartDate || data.order.jobStartDate.toString(), 'MM/dd/yyyy'),
    });
  }

  private getComments(): void {
    this.commentsService
      .getComments(this.candidateJob?.commentContainerId as number, null)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
        this.changeDetectorRef.markForCheck();
      });
  }

  private subscribeOnInitialData(): void {
    this.candidateJobState$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: OrderCandidateJob) => {
      this.candidateJob = data;

      if (data) {
        this.getComments();
        this.currentApplicantStatus = data.applicantStatus;
        this.billRatesData = [...data.billRates];
        this.setFormValue(data);
        if (!this.isAgency) {
          this.getOrderPermissions(data.orderId);
        }
      }
    });
    this.applicantStatuses$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ApplicantStatus[]) => {
      this.nextApplicantStatuses = data;
      this.hasEditOrderBillRatesPermission = hasEditOrderBillRatesPermission(this.applicationStatus || this.candidate.status, data);
      if (!data.length) {
        this.statusesFormControl.disable();
      } else {
        this.statusesFormControl.enable();
      }
    });
    this.orderPermissions$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: CurrentUserPermission[]) => (this.orderPermissions = data) && this.mapPermissions());
  }

  private getOrderPermissions(orderId: number): void {
    this.store.dispatch(new GetOrderPermissions(orderId));
  }

  private mapPermissions(): void {
    this.canShortlist = false;
    this.canInterview = false;
    this.canReject = false;
    this.canOffer = false;
    this.canOnboard = false;
    this.canClose = false;
    this.orderPermissions.forEach((permission) => {
      this.canShortlist = this.canShortlist || permission.permissionId === PermissionTypes.CanShortlistCandidate;
      this.canInterview = this.canInterview || permission.permissionId === PermissionTypes.CanInterviewCandidate;
      this.canReject = this.canReject || permission.permissionId === PermissionTypes.CanRejectCandidate;
      this.canOffer = this.canOffer || permission.permissionId === PermissionTypes.CanOfferCandidate;
      this.canOnboard = this.canOnboard || permission.permissionId === PermissionTypes.CanOnBoardCandidate;
      this.canClose = this.canClose || permission.permissionId === PermissionTypes.CanCloseCandidate;
    });
    this.disableControlsBasedOnPermissions();
  }

  private disableControlsBasedOnPermissions(): void {
    if (!this.canShortlist && !this.canInterview && !this.canReject && !this.canOffer && !this.canOnboard) {
      this.formGroup.controls['guaranteedWorkWeek'].disable();
    }
    if (!this.canReject && !this.canOffer && !this.canOnboard) {
      this.formGroup.controls['offeredBillRate'].disable();
    }
    if (!this.canReject && !this.canOffer) {
      this.formGroup.controls['offeredStartDate'].disable();
    }
  }

  private subscribeOnSuccessRejection(): void {
    this.actions$
      .pipe(ofActionSuccessful(RejectCandidateForOrganisationSuccess), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.formGroup.disable();
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
  }

  private subscribeOnReasonsList(): void {
    this.rejectionReasonsList$.pipe(takeUntil(this.unsubscribe$)).subscribe((reasons) => {
      this.rejectReasons = reasons;
    });
  }

  private checkRejectReason(): void {
    if (this.candidate.status === ApplicantStatusEnum.Rejected) {
      this.isRejected = true;
    }
  }

  private closeDialog(): void {
    this.closeDialogEmitter.next();
    this.nextApplicantStatuses = [];
    this.billRatesData = [];
    this.candidateJob = null;
    this.isRejected = false;
    this.formGroup.markAsPristine();
  }

  private switchFormState(): void {
    if (this.isReadOnly) {
      this.formGroup?.disable();
    } else {
      this.formGroup?.enable();
    }
  }

  private onReject(): void {
    this.store.dispatch(new GetRejectReasonsForOrganisation());
    this.openRejectDialog.next(true);
  }
}
