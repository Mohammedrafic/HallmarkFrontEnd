import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  CancellationReasonsMap,
  PenaltiesMap,
} from '@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants';
import { PenaltyCriteria } from '@shared/enums/candidate-cancellation';
import { JobCancellation } from '@shared/models/candidate-cancellation.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { filter, Observable, Subject, takeUntil, of, take, distinctUntilChanged, switchMap } from 'rxjs';
import {
  OPTION_FIELDS,
} from '@shared/components/order-candidate-list/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst';
import { BillRate } from '@shared/models/bill-rate.model';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ApplicantStatus, Order,
  OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { formatDate, formatNumber } from '@angular/common';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { ApplicantStatus as ApplicantStatusEnum, CandidatStatus } from '@shared/enums/applicant-status.enum';
import {
  CancelOrganizationCandidateJob,
  CancelOrganizationCandidateJobSuccess,
  GetRejectReasonsForOrganisation,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  SetIsDirtyOrderForm,
  UpdateOrganisationCandidateJob,
  UpdateOrganisationCandidateJobSucceed,
  sendOnboardCandidateEmailMessage
} from '@client/store/order-managment-content.actions';
import { RejectReason } from '@shared/models/reject-reason.model';
import { ShowGroupEmailSideDialog, ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import PriceUtils from '@shared/utils/price.utils';
import {
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  deployedCandidateMessage,
  DEPLOYED_CANDIDATE,
  SET_READONLY_STATUS,
  onBoardCandidateMessage,
  ONBOARD_CANDIDATE,
  SEND_EMAIL,
} from '@shared/constants';
import { toCorrectTimezoneFormat } from '@shared/utils/date-time.utils';
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';
import { OrderCandidateListViewService } from '@shared/components/order-candidate-list/order-candidate-list-view.service';
import { Duration } from '@shared/enums/durations';
import { DurationService } from '@shared/services/duration.service';
import { UnsavedFormComponentRef, UNSAVED_FORM_PROVIDERS } from '@shared/directives/unsaved-form.directive';
import { UserState } from 'src/app/store/user.state';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { GetOrderPermissions } from 'src/app/store/user.actions';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { DeployedCandidateOrderInfo } from '@shared/models/deployed-candidate-order-info.model';
import { CheckNumberValue, DateTimeHelper } from '@core/helpers';
import { CandidatePayRateSettings } from '@shared/constants/candidate-pay-rate-settings';
import { OrderType } from '@shared/enums/order-type';
import { OnboardCandidateMessageDialogComponent } from '@shared/components/order-candidate-list/order-candidates-list/onboarded-candidate/onboard-candidate-message-dialog/onboard-candidate-message-dialog.component';
import { RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';
import { PermissionService } from 'src/app/security/services/permission.service';

@Component({
  selector: 'app-onboarded-candidate',
  templateUrl: './onboarded-candidate.component.html',
  styleUrls: ['./onboarded-candidate.component.scss'],
  providers: [MaskedDateTimeService, UNSAVED_FORM_PROVIDERS(OnboardedCandidateComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardedCandidateComponent extends UnsavedFormComponentRef implements OnInit, OnDestroy {
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Select(OrderManagementContentState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  @Select(OrderManagementContentState.applicantStatuses)
  applicantStatuses$: Observable<ApplicantStatus[]>;

  @Select(UserState.orderPermissions)
  orderPermissions$: Observable<CurrentUserPermission[]>;

  @Output() closeModalEvent = new EventEmitter<never>();

  @Input() candidate: OrderCandidatesList;
  @Input() isTab = false;
  @Input() isAgency = false;
  @Input() orderDuration: Duration;
  @Input() actionsAllowed: boolean;
  @Input() deployedCandidateOrderInfo: DeployedCandidateOrderInfo[];
  @Input() candidateOrderIds: string[];
  @Input() isOrderOverlapped: boolean;
  @Input() hasCanEditOrderBillRatePermission: boolean;
  @Input() isCandidatePayRateVisible: boolean;
  @Input() canEditBillRate = false;
  @Input() canEditClosedBillRate = false;
  @Input() order: Order;

  public override form: FormGroup;
  public jobStatusControl: FormControl;
  public optionFields = OPTION_FIELDS;
  public candidateJob: OrderCandidateJob | null;
  public today = new Date();
  public candidatStatus = CandidatStatus;
  public readonly applicantStatus = ApplicantStatusEnum;
  public billRatesData: BillRate[] = [];
  public rejectReasons: RejectReason[] = [];
  public openRejectDialog = new Subject<boolean>();
  public openCandidateCancellationDialog = new Subject<void>();
  public isRejected = false;
  public priceUtils = PriceUtils;
  public nextApplicantStatuses: ApplicantStatus[];
  public isActiveCandidateDialog$: Observable<boolean>;
  public showHoursControl = false;
  public showPercentage = false;
  public verifyNoPenalty = false;
  public orderPermissions: CurrentUserPermission[];
  public canShortlist = false;
  public canInterview = false;
  public canReject = false;
  public canOffer = false;
  public canOnboard = false;
  public canClose = false;
  public selectedApplicantStatus: ApplicantStatus | null = null;
  public payRateSetting = CandidatePayRateSettings;
  public readonly reorderType: OrderType = OrderType.ReOrder;
  public canCreateOrder:boolean;
  public saveStatus: number = 0;

  get isAccepted(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.Accepted;
  }

  get isOnBoarded(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.OnBoarded;
  }

  get isCancelled(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.Cancelled || this.candidateStatus === ApplicantStatusEnum.Offboard;
  }

  get isDeployedCandidate(): boolean {
    return !!this.candidate?.deployedCandidateInfo && !this.isOnBoarded;
  }

  get isReadOnlyBillRates(): boolean {
    return !this.canShortlist && !this.canInterview && !this.canReject && !this.canOffer && !this.canOnboard;
  }

  get candidateStatus(): ApplicantStatusEnum {
    return this.candidate?.status || (this.candidate?.candidateStatus as any);
  }

  get actualStartDateValue(): Date | null {
    if (this.candidateJob?.closeDate) {
      return null;
    }
    return toCorrectTimezoneFormat(this.form.controls['startDate'].value);
  }

  get showStatusDropdown(): boolean {
    return !this.isRejected && !this.isDeployedCandidate && !this.isCancelled;
  }

  get isAcceptedOnboardedCandidate (): boolean {
    return this.candidateStatus === ApplicantStatusEnum.Accepted || this.candidateStatus === ApplicantStatusEnum.OnBoarded;
  }

  get templateEmailTitle(): string {
    return "Onboarding Email";
  }

  private unsubscribe$: Subject<void> = new Subject();
  isSend:boolean = false;
  public sendOnboardMessageEmailFormGroup: FormGroup;

  public candidateComments: Comment[] = [];
  emailTo:any = '';
  isSendOnboardFormInvalid:boolean = false;
  @ViewChild('RTE')
  public rteEle: RichTextEditorComponent;
  @ViewChild(OnboardCandidateMessageDialogComponent, { static: true }) onboardEmailTemplateForm: OnboardCandidateMessageDialogComponent;

  constructor(
    private store: Store,
    private actions$: Actions,
    private orderCandidateListViewService: OrderCandidateListViewService,
    private confirmService: ConfirmService,
    private commentsService: CommentsService,
    private durationService: DurationService,
    private changeDetectorRef: ChangeDetectorRef,
    private permissionService: PermissionService
  ) {
    super();
    this.createForm();
    this.sendOnboardMessageEmailFormGroup = new FormGroup({
      emailSubject: new FormControl('', [Validators.required]),
      emailBody: new FormControl('', [Validators.required]),
      fileUpload: new FormControl(null),
      emailTo: new FormControl('', [Validators.required]),
      orderId: new FormControl('', [Validators.required]),
      candidateId  : new FormControl('', [Validators.required]),
      businessUnitId: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.isActiveCandidateDialog$ = this.orderCandidateListViewService.getIsCandidateOpened();
    this.subscribeOnPermissions();
    this.subscribeOnReasonsList();
    this.checkRejectReason();
    this.subscribeOnUpdateOrganizationCandidateJobError();
    this.subscribeOnCancelOrganizationCandidateJobSuccess();
    this.subscribeOnGetStatus();
    this.observeCandidateJob();
    this.observeStartDate();
    this.subscribeOnJobUpdate();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getComments(): void {
    this.commentsService
      .getComments(this.candidateJob?.commentContainerId as number, null)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((comments: Comment[]) => {
        this.candidateComments = comments;
        this.changeDetectorRef.markForCheck();
      });
  }

  public onSave(): void {
    this.handleOnboardedCandidate({itemData: this.selectedApplicantStatus});
  }

  public onDropDownChanged(event: { itemData: ApplicantStatus }): void {
    if (event.itemData?.isEnabled) {
      this.selectedApplicantStatus = event.itemData;
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, SET_READONLY_STATUS));
    }
  }

  public onRejectCandidate(event: { rejectReason: number }): void {
    this.isRejected = true;

    if (this.candidateJob) {
      const payload = {
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        rejectReasonId: event.rejectReason,
        candidatePayRate: this.candidateJob.candidatePayRate,
      };

      const value = this.rejectReasons.find((reason: RejectReason) => reason.id === event.rejectReason)?.reason;
      this.form.patchValue({ rejectReason: value });
      this.store.dispatch(new RejectCandidateJob(payload)).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        this.form.disable();
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
      this.closeDialog();
    }
  }

  public cancelCandidate(jobCancellationDto: JobCancellation): void {
    if (this.candidateJob) {
      this.store.dispatch(new CancelOrganizationCandidateJob({
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        jobCancellationDto,
        candidatePayRate: this.candidateJob.candidatePayRate,
      }));
      this.closeDialog();
    }
  }

  public resetStatusesFormControl(): void {
    this.jobStatusControl.reset();
    this.selectedApplicantStatus = null;
  }

  public onClose(): void {
    if (this.form.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => confirm),
          take(1)
        ).subscribe(() => {
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
  }

  public onBillRatesChanged(bill: BillRate): void {
    this.form.markAllAsTouched();
    if (!this.form.errors && this.candidateJob) {
      const rates = this.getBillRateForUpdate(bill);

      this.store
        .dispatch(
          new UpdateOrganisationCandidateJob({
            orderId: this.candidateJob?.orderId as number,
            organizationId: this.candidateJob?.organizationId as number,
            jobId: this.candidateJob?.jobId as number,
            nextApplicantStatus: this.candidateJob?.applicantStatus,
            actualStartDate: DateTimeHelper.setUtcTimeZone(this.candidateJob?.actualStartDate),
            actualEndDate: DateTimeHelper.setUtcTimeZone(this.candidateJob?.actualEndDate) as string,
            offeredStartDate: DateTimeHelper.setUtcTimeZone(this.candidateJob?.availableStartDate as string),
            candidateBillRate: this.candidateJob?.candidateBillRate as number,
            offeredBillRate: this.candidateJob?.offeredBillRate,
            requestComment: this.candidateJob?.requestComment as string,
            clockId: this.candidateJob?.clockId,
            guaranteedWorkWeek: this.candidateJob?.guaranteedWorkWeek,
            billRates: rates,
            billRatesUpdated: this.checkForBillRateUpdate(rates),
            candidatePayRate: this.candidateJob.candidatePayRate,
          })
        ).pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe(() => {
          this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
          this.closeDialog();
          this.deleteUpdateFieldInRate();
          this.store.dispatch(new SetIsDirtyOrderForm(true));
        });
    }
  }

  public changeActualEndDate(date: Date | null): void {
    if (date) {
      const endDate: Date = this.getRecalculateActualEndDate(
        date,
        this.orderDuration,
        this.order.jobStartDate,
        this.order.jobEndDate
      );
      const dateWithoutZone = DateTimeHelper.setUtcTimeZone(endDate);

      this.form.patchValue({ endDate: DateTimeHelper.setCurrentTimeZone(dateWithoutZone) });
    }
  }

  getBillRateForUpdate(value: BillRate): BillRate[] {
    let billRates;
    const existingBillRateIndex = this.candidateJob?.billRates.findIndex(
      (billRate) => billRate.id === value.id
    ) as number;

    if (existingBillRateIndex > -1) {
      this.candidateJob?.billRates.splice(existingBillRateIndex, 1, value);
      billRates = this.candidateJob?.billRates;
    } else {
      if (typeof value === 'number') {
        this.candidateJob?.billRates.splice(value, 1);
        billRates = this.candidateJob?.billRates;
      } else {
        billRates = [...(this.candidateJob?.billRates as BillRate[]), value];
      }
    }

    return billRates as BillRate[];
  }

  private displayMessageConfirmation(): Observable<boolean> {
    const options = {
      title: ONBOARD_CANDIDATE,
      okButtonLabel: 'Yes',
      okButtonClass: 'ok-button',
      cancelButtonLabel: 'No',
    };
    if (this.saveStatus === ApplicantStatusEnum.OnBoarded) {
      return this.confirmService.confirm(onBoardCandidateMessage, options)
        .pipe(take(1));
    }
    return of(false);
  }

  private subscribeOnJobUpdate(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(UpdateOrganisationCandidateJobSucceed),
        switchMap(() => this.displayMessageConfirmation()),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((isConfirm) => {
        if (isConfirm) {
          this.onboardEmailTemplateForm.rteCreated();
          this.onboardEmailTemplateForm.disableControls(true);
          this.store.dispatch(new ShowGroupEmailSideDialog(true));
        } else {
          this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
          this.closeDialog();
        }
      });
  }

  private onAccept(): void {
    if (!this.form.errors && this.candidateJob) {
      this.shouldChangeCandidateStatus()
        .pipe(take(1))
        .subscribe((isConfirm) => {
          if (isConfirm && this.candidateJob) {
            const value = this.form.getRawValue();
            this.isSend =  true;
            this.sendOnboardMessageEmailFormGroup.get('emailTo')?.setValue(this.candidateJob?.candidateProfile.email);
            this.sendOnboardMessageEmailFormGroup.get('orderId')?.setValue(this.candidateJob?.orderId);
            this.sendOnboardMessageEmailFormGroup.get('candidateId')?.setValue(this.candidateJob?.candidateProfileId);
            this.sendOnboardMessageEmailFormGroup.get('businessUnitId')?.setValue(this.candidateJob?.organizationId);
            this.emailTo = this.candidateJob?.candidateProfile.email;
            this.store
              .dispatch(
                new UpdateOrganisationCandidateJob({
                  organizationId: this.candidateJob.organizationId,
                  jobId: this.candidateJob.jobId,
                  orderId: this.candidateJob.orderId,
                  nextApplicantStatus: this.selectedApplicantStatus || this.candidateJob.applicantStatus,
                  candidateBillRate: value.candidateBillRate,
                  offeredBillRate: value.offeredBillRate,
                  requestComment: value.comments,
                  actualStartDate: DateTimeHelper.setUtcTimeZone(value.startDate),
                  actualEndDate: DateTimeHelper.setUtcTimeZone(value.endDate),
                  clockId: value.clockId,
                  guaranteedWorkWeek: value.workWeek,
                  allowDeployWoCredentials: value.allow,
                  billRates: this.billRatesData,
                  offeredStartDate: this.candidateJob.offeredStartDate,
                  candidatePayRate: this.candidateJob.candidatePayRate,
                })
              );
            } else {
              this.jobStatusControl.reset();
              this.selectedApplicantStatus = null;
            }
      });
    }
  }

  private saveCandidateJob(){
       this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
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

  private observeCandidateJob(): void {
    this.candidateJobState$
      .pipe(
        takeUntil(this.unsubscribe$),
      ).subscribe((value) => {
        this.candidateJob = value;

        if (value) {
          this.setCancellationControls(value.jobCancellation?.penaltyCriteria || 0);
          this.getComments();
          if (!this.isAgency) {
            this.getOrderPermissions(value.orderId);
          }
          this.billRatesData = [...value?.billRates];

          const actualStart = !value.wasActualStartDateChanged && value.offeredStartDate
          ? value.offeredStartDate : value.actualStartDate;

          const actualEnd = value.actualEndDate ||
          this.durationService.getEndDate(value.order.duration, new Date(actualStart), {
            jobStartDate: value.order.jobStartDate,
            jobEndDate: value.order.jobEndDate,
          }).toString();

          this.form.patchValue({
            jobId: `${value.organizationPrefix}-${value.orderPublicId}`,
            date: [DateTimeHelper.setCurrentTimeZone(actualStart),
              DateTimeHelper.setCurrentTimeZone(actualEnd)],
            billRates: PriceUtils.formatNumbers(value.order.hourlyRate),
            candidates: `${value.candidateProfile.lastName} ${value.candidateProfile.firstName}`,
            candidateBillRate: PriceUtils.formatNumbers(value.candidateBillRate),
            locationName: value.order.locationName,
            avStartDate: DateTimeHelper.formatDateUTC(value.availableStartDate, 'MM/dd/yyyy'),
            yearExp: value.yearsOfExperience,
            travelExp: value.expAsTravelers,
            comments: value.requestComment,
            workWeek: value.guaranteedWorkWeek ? value.guaranteedWorkWeek : '',
            clockId: value.clockId ? value.clockId : '',
            offeredBillRate: formatNumber(CheckNumberValue(value.offeredBillRate), 'en', '0.2-2'),
            allow: value.allowDeployCredentials,
            startDate: DateTimeHelper.setCurrentTimeZone(actualStart),
            endDate: DateTimeHelper.setCurrentTimeZone(actualEnd),
            rejectReason: value.rejectReason,
            offeredStartDate: formatDate(DateTimeHelper.setCurrentTimeZone(value.offeredStartDate).toString(),
            'MM/dd/YYYY', 'en-US'),
            jobCancellationReason: CancellationReasonsMap[value.jobCancellation?.jobCancellationReason || 0],
            penaltyCriteria: PenaltiesMap[value.jobCancellation?.penaltyCriteria || 0],
            rate: value.jobCancellation?.rate,
            hours: value.jobCancellation?.hours,
            candidatePayRate: value.candidatePayRate,
          });

          this.switchFormState();
          this.configureCandidatePayRateField();
        }

        this.changeDetectorRef.markForCheck();
    });
  }

  private configureCandidatePayRateField(): void {
    const candidatePayRateField = this.form.get('candidatePayRate');
    if(this.isAgency && this.candidateStatus === ApplicantStatusEnum.Offered) {
      candidatePayRateField?.enable();
    } else {
      candidatePayRateField?.disable();
    }
    this.changeDetectorRef.markForCheck();
  }

  private subscribeOnReasonsList(): void {
    this.rejectionReasonsList$.pipe(takeUntil(this.unsubscribe$)).subscribe((reasons) => {
      this.rejectReasons = reasons;
      this.changeDetectorRef.markForCheck();
    });
  }

  private checkRejectReason(): void {
    if (this.candidateStatus === ApplicantStatusEnum.Rejected) {
      this.isRejected = true;
      this.form.disable();
    }
  }

  private subscribeOnUpdateOrganizationCandidateJobError(): void {
    this.actions$
      .pipe(ofActionSuccessful(ShowToast))
      .pipe(
        filter((error) => error.type === MessageTypes.Error),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => (this.jobStatusControl.reset(), this.selectedApplicantStatus = null));
  }

  private subscribeOnCancelOrganizationCandidateJobSuccess(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(CancelOrganizationCandidateJobSuccess))
      .subscribe(() => {
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
  }

  private subscribeOnGetStatus(): void {
    this.applicantStatuses$.pipe(takeUntil(this.unsubscribe$))
    .subscribe((data: ApplicantStatus[]) => {
      this.nextApplicantStatuses = data;

      if (!data.length) {
        this.jobStatusControl.disable();
      } else {
        this.jobStatusControl.enable();
      }

      this.changeDetectorRef.markForCheck();
    });

    this.orderPermissions$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: CurrentUserPermission[]) => {
        this.orderPermissions = data;
        this.mapPermissions();
      });
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
    this.changeDetectorRef.detectChanges();
  }

  private disableControlsBasedOnPermissions(): void {
    if (!this.canShortlist && !this.canInterview && !this.canReject && !this.canOffer && !this.canOnboard) {
      this.form.controls['workWeek'].disable();
    } else {
      this.form.controls['workWeek'].enable();
    }
    if (!this.canReject && !this.canOffer && !this.canOnboard) {
      this.form.controls['offeredBillRate'].disable();
    } else {
      this.form.controls['offeredBillRate'].enable();
    }
    if (!this.canReject && !this.canOffer) {
      this.form.controls['offeredStartDate'].disable();
    } else {
      this.form.controls['offeredStartDate'].enable();
    }
    if (!this.canReject && !this.canOnboard) {
      this.form.controls['startDate'].disable();
      this.form.controls['endDate'].disable();
      this.form.controls['clockId'].disable();
    } else {
      this.form.controls['startDate'].enable();
      this.form.controls['endDate'].enable();
      this.form.controls['clockId'].enable();
    }
    if (this.isOnBoarded) {
      this.form.controls['allow'].disable();
    } else {
      this.form.controls['allow'].enable();
    }

    this.disableDatesForClosedPostition();
  }

  onGroupEmailAddCancel(){
    this.isSendOnboardFormInvalid = !this.sendOnboardMessageEmailFormGroup.valid;
    this.saveCandidateJob();
    this.isSend =  false;
    this.store.dispatch(new ShowGroupEmailSideDialog(false));
    this.closeDialog();
  }

  onGroupEmailSend(){
    this.isSendOnboardFormInvalid = !this.sendOnboardMessageEmailFormGroup.valid;
    if(this.sendOnboardMessageEmailFormGroup.valid){
      const emailvalue = this.sendOnboardMessageEmailFormGroup.getRawValue();
      this.saveCandidateJob();
      this.store.dispatch(new sendOnboardCandidateEmailMessage({
            subjectMail : emailvalue.emailSubject,
            bodyMail : emailvalue.emailBody,
            toList : emailvalue.emailTo,
            status : 1,
            stream : emailvalue.fileUpload,
            extension : emailvalue.fileUpload?.type,
            documentName : emailvalue.fileUpload?.name,
            orderId : emailvalue.orderId,
            candidateId : emailvalue.candidateId,
            businessUnitId : emailvalue.businessUnitId,
          })
        )
        .subscribe(() => {
          this.isSend =  false;
          this.store.dispatch(new ShowGroupEmailSideDialog(false));
          this.store.dispatch(new ShowToast(MessageTypes.Success, SEND_EMAIL));
          this.closeDialog();
        });
    }
  }

  private handleOnboardedCandidate(event: { itemData: ApplicantStatus | null }): void {
    this.saveStatus = event.itemData ? event.itemData.applicantStatus : 0;
    if (event.itemData?.applicantStatus === ApplicantStatusEnum.OnBoarded || event.itemData === null) {
      this.onAccept();
    } else if (event.itemData?.applicantStatus === ApplicantStatusEnum.Cancelled) {
      this.openCandidateCancellationDialog.next();
    } else {
      this.onReject();
    }
  }

  private createForm(): void {
    this.form = new FormGroup({
      jobId: new FormControl(''),
      date: new FormControl(''),
      billRates: new FormControl(''),
      candidates: new FormControl(''),
      candidateBillRate: new FormControl(''),
      locationName: new FormControl(''),
      avStartDate: new FormControl(''),
      yearExp: new FormControl(''),
      travelExp: new FormControl(''),
      comments: new FormControl(''),
      workWeek: new FormControl('', [Validators.maxLength(50)]),
      clockId: new FormControl('', [Validators.maxLength(50)]),
      offeredBillRate: new FormControl('', [Validators.required]),
      allow: new FormControl(false),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      rejectReason: new FormControl(''),
      offeredStartDate: new FormControl(''),
      jobCancellationReason: new FormControl(''),
      penaltyCriteria: new FormControl(''),
      rate: new FormControl(''),
      hours: new FormControl(''),
      candidatePayRate: new FormControl(null),
    });

    this.jobStatusControl = new FormControl('');
  }

  private closeDialog() {
    this.form.markAsPristine();
    this.closeModalEvent.emit();
    this.candidateJob = null;
    this.jobStatusControl.reset();
    this.selectedApplicantStatus = null;
    this.billRatesData = [];
    this.isRejected = false;
    this.nextApplicantStatuses = [];
    this.orderCandidateListViewService.setIsCandidateOpened(false);
    this.changeDetectorRef.markForCheck();
  }

  private setCancellationControls(value: PenaltyCriteria): void {
    this.showHoursControl = value === PenaltyCriteria.RateOfHours || value === PenaltyCriteria.FlatRateOfHours;
    this.showPercentage = value === PenaltyCriteria.RateOfHours;
    this.verifyNoPenalty = value === PenaltyCriteria.NoPenalty;
  }

  private switchFormState(): void {
    if (!this.isAgency && !this.isAcceptedOnboardedCandidate || this.isCancelled) {
      this.form?.disable();
    } else {
      this.form?.enable();
    }
  }

  private onReject(): void {
    this.store.dispatch(new GetRejectReasonsForOrganisation());
    this.openRejectDialog.next(true);
  }

  private getRecalculateActualEndDate(
    startDate: Date,
    orderDuration: Duration,
    jobStartDate: Date | string,
    jobEndDate: Date | string
  ): Date {

    return this.durationService.getEndDate(
      orderDuration,
      startDate,
      {
        jobStartDate,
        jobEndDate,
      }
    );
  }

  private disableDatesForClosedPostition(): void {
    if (this.candidateJob?.closeDate) {
      this.form.get('startDate')?.disable();
      this.form.get('endDate')?.disable();
    }
  }

  private deleteUpdateFieldInRate(): void {
    this.candidateJob?.billRates.filter((rate) => Object.prototype.hasOwnProperty.call(rate, 'isUpdated'))
    .forEach((rate) => {
      delete rate.isUpdated;
    });
  }

  private checkForBillRateUpdate(rates: BillRate[]): boolean {
    return rates.some((rate) => !!rate.isUpdated);
  }

  private observeStartDate(): void {
    this.form.get('startDate')?.valueChanges
    .pipe(
      distinctUntilChanged(),
      filter((date) => !!date),
      takeUntil(this.unsubscribe$),
    )
    .subscribe((date: Date) => {
      this.changeActualEndDate(date);
    });
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().subscribe(({ canCreateOrder}) => {
      this.canCreateOrder = canCreateOrder;
    });
  }
}
