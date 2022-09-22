import {
  ChangeDetectionStrategy,
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
import {
  CancellationReasonsMap,
  PenaltiesMap
} from "@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants";
import { PenaltyCriteria } from "@shared/enums/candidate-cancellation";
import { JobCancellation } from "@shared/models/candidate-cancellation.model";
import { ConfirmService } from '@shared/services/confirm.service';
import { ChangedEventArgs, MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { filter, merge, Observable, Subject, takeUntil } from 'rxjs';
import { OPTION_FIELDS } from '@shared/components/order-candidate-list/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst';
import { BillRate } from '@shared/models/bill-rate.model';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import {
  ApplicantStatus,
  ApplicantStatus as ApplicantStatusEnum,
  CandidatStatus,
} from '@shared/enums/applicant-status.enum';
import {
  CancelOrganizationCandidateJob,
  CancelOrganizationCandidateJobSuccess,
  GetRejectReasonsForOrganisation,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  SetIsDirtyOrderForm,
  UpdateOrganisationCandidateJob,
} from '@client/store/order-managment-content.actions';
import { RejectReason } from '@shared/models/reject-reason.model';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import PriceUtils from '@shared/utils/price.utils';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, SET_READONLY_STATUS } from '@shared/constants';
import { toCorrectTimezoneFormat } from '@shared/utils/date-time.utils';
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';
import { OrderCandidateListViewService } from '@shared/components/order-candidate-list/order-candidate-list-view.service';
import { Duration } from '@shared/enums/durations';
import { DurationService } from '@shared/services/duration.service';
import { UnsavedFormComponentRef, UNSAVED_FORM_PROVIDERS } from '@shared/directives/unsaved-form.directive';

@Component({
  selector: 'app-onboarded-candidate',
  templateUrl: './onboarded-candidate.component.html',
  styleUrls: ['./onboarded-candidate.component.scss'],
  providers: [MaskedDateTimeService, UNSAVED_FORM_PROVIDERS(OnboardedCandidateComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardedCandidateComponent extends UnsavedFormComponentRef implements OnInit, OnDestroy, OnChanges {
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Select(OrderManagementContentState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  @Select(OrderManagementContentState.applicantStatuses)
  applicantStatuses$: Observable<ApplicantStatus[]>;

  @Output() closeModalEvent = new EventEmitter<never>();

  @Input() candidate: OrderCandidatesList;
  @Input() isTab: boolean = false;
  @Input() isAgency: boolean = false;
  @Input() orderDuration: Duration;

  public override form: FormGroup;
  public jobStatusControl: FormControl;
  public optionFields = OPTION_FIELDS;
  public candidateJob: OrderCandidateJob | null;
  public today = new Date();
  public candidatStatus = CandidatStatus;
  public billRatesData: BillRate[] = [];
  public rejectReasons: RejectReason[] = [];
  public openRejectDialog = new Subject<boolean>();
  public openCandidateCancellationDialog = new Subject<void>();
  public isRejected = false;
  public priceUtils = PriceUtils;
  public nextApplicantStatuses: ApplicantStatus[];
  public isActiveCandidateDialog$: Observable<boolean>;
  public showHoursControl: boolean = false;
  public showPercentage: boolean = false;

  get startDateControl(): AbstractControl | null {
    return this.form.get('startDate');
  }

  get endDateControl(): AbstractControl | null {
    return this.form.get('endDate');
  }

  get isAccepted(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.Accepted;
  }

  get isOnBoarded(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.OnBoarded;
  }

  get isCancelled(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.Cancelled;
  }

  get isDeployedCandidate(): boolean {
    return !!this.candidate?.deployedCandidateInfo && !this.isOnBoarded;
  }

  get candidateStatus(): ApplicantStatusEnum {
    return this.candidate?.status || (this.candidate?.candidateStatus as any);
  }

  get actualStartDateValue(): Date {
    return toCorrectTimezoneFormat(this.form.controls['startDate'].value);
  }

  get showStatusDropdown(): boolean {
    return !this.isRejected && !this.isDeployedCandidate && !this.isCancelled
  }

  private unsubscribe$: Subject<void> = new Subject();

  public comments: Comment[] = [];

  constructor(
    private datePipe: DatePipe,
    private store: Store,
    private actions$: Actions,
    private orderCandidateListViewService: OrderCandidateListViewService,
    private confirmService: ConfirmService,
    private commentsService: CommentsService,
    private durationService: DurationService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.isActiveCandidateDialog$ = this.orderCandidateListViewService.getIsCandidateOpened();
    this.createForm();
    this.patchForm();
    this.subscribeOnDate();
    this.subscribeOnReasonsList();
    this.checkRejectReason();
    this.subscribeOnUpdateOrganisationCandidateJobError();
    this.subscribeOnCancelOrganizationCandidateJobSuccess();
    this.subscribeOnGetStatus();
  }

  ngOnChanges(changes: SimpleChanges) {
    const { candidate } = changes;
    if (candidate?.currentValue && !candidate?.isFirstChange()) {
      this.getComments();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getComments(): void {
    this.commentsService
      .getComments(this.candidateJob?.commentContainerId as number, null)
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
        this.changeDetectorRef.markForCheck();
      });
  }

  public onDropDownChanged(event: { itemData: { applicantStatus: ApplicantStatus; isEnabled: boolean } }): void {
    if (event.itemData?.isEnabled) {
      this.handleOnboardedCandidate(event);
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
      };

      const value = this.rejectReasons.find((reason: RejectReason) => reason.id === event.rejectReason)?.reason;
      this.form.patchValue({ rejectReason: value });
      this.store.dispatch(new RejectCandidateJob(payload)).subscribe(() => {
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
      }));
      this.closeDialog();
    }
  }

  public resetStatusesFormControl(): void {
    this.jobStatusControl.reset();
  }

  public onClose(): void {
    if (this.form.dirty) {
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

  public onBillRatesChanged(bill: BillRate): void {
    this.form.markAllAsTouched();
    if (!this.form.errors && this.candidateJob) {
      this.store
        .dispatch(
          new UpdateOrganisationCandidateJob({
            orderId: this.candidateJob?.orderId as number,
            organizationId: this.candidateJob?.organizationId as number,
            jobId: this.candidateJob?.jobId as number,
            nextApplicantStatus: this.candidateJob?.applicantStatus,
            actualStartDate: toCorrectTimezoneFormat(this.candidateJob?.actualStartDate) as string,
            actualEndDate: toCorrectTimezoneFormat(this.candidateJob?.actualEndDate) as string,
            offeredStartDate: toCorrectTimezoneFormat(this.candidateJob?.availableStartDate as string),
            candidateBillRate: this.candidateJob?.candidateBillRate as number,
            offeredBillRate: this.candidateJob?.offeredBillRate,
            requestComment: this.candidateJob?.requestComment as string,
            clockId: this.candidateJob?.clockId,
            guaranteedWorkWeek: this.candidateJob?.guaranteedWorkWeek,
            billRates: this.getBillRateForUpdate(bill),
          })
        )
        .subscribe(() => {
          this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
          this.closeDialog();
          this.store.dispatch(new SetIsDirtyOrderForm(true));
        });
    }
  }

  public onStartDateChange(event: ChangedEventArgs): void {
    const actualStartDate = new Date(event.value!);
    const actualEndDate = this.durationService.getEndDate(this.orderDuration, actualStartDate);
    this.form.patchValue({
      endDate: actualEndDate,
    });
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

  private onAccept(): void {
    if (this.form.valid && this.candidateJob) {
      const value = this.form.getRawValue();
      this.store
        .dispatch(
          new UpdateOrganisationCandidateJob({
            organizationId: this.candidateJob.organizationId,
            jobId: this.candidateJob.jobId,
            orderId: this.candidateJob.orderId,
            nextApplicantStatus: {
              applicantStatus: 60,
              statusText: 'Onboard',
            },
            candidateBillRate: value.candidateBillRate,
            offeredBillRate: value.offeredBillRate,
            requestComment: value.comments,
            actualStartDate: toCorrectTimezoneFormat(value.startDate),
            actualEndDate: toCorrectTimezoneFormat(value.endDate),
            clockId: value.clockId,
            guaranteedWorkWeek: value.workWeek,
            allowDeployWoCredentials: value.allow,
            billRates: this.billRatesData,
            offeredStartDate: this.candidateJob.offeredStartDate,
          })
        )
        .subscribe(() => {
          this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
        });
      this.closeDialog();
    }
  }

  private patchForm(): void {
    this.candidateJobState$.pipe(takeUntil(this.unsubscribe$)).subscribe((value) => {
      this.candidateJob = value;
      if (value) {
        this.setCancellationControls(value.jobCancellation?.penaltyCriteria || 0);
        this.getComments();
        this.billRatesData = [...value?.billRates];
        this.form.patchValue({
          jobId: `${value.organizationPrefix}-${value.orderPublicId}`,
          date: [value.order.jobStartDate, value.order.jobEndDate],
          billRates: PriceUtils.formatNumbers(value.order.hourlyRate),
          candidates: `${value.candidateProfile.lastName} ${value.candidateProfile.firstName}`,
          candidateBillRate: PriceUtils.formatNumbers(value.candidateBillRate),
          locationName: value.order.locationName,
          avStartDate: this.getDateString(value.availableStartDate),
          yearExp: value.yearsOfExperience,
          travelExp: value.expAsTravelers,
          comments: value.requestComment,
          workWeek: value.guaranteedWorkWeek ? value.guaranteedWorkWeek : '',
          clockId: value.clockId ? value.clockId : '',
          offeredBillRate: value.offeredBillRate ? PriceUtils.formatNumbers(value.offeredBillRate) : null,
          allow: value.allowDeployCredentials,
          startDate: value.actualStartDate ? value.actualStartDate : value.order.jobStartDate,
          endDate: value.actualEndDate ? value.actualEndDate : value.order.jobEndDate,
          rejectReason: value.rejectReason,
          offeredStartDate: this.getDateString(value.offeredStartDate),
          jobCancellationReason: CancellationReasonsMap[value.jobCancellation?.jobCancellationReason || 0],
          penaltyCriteria: PenaltiesMap[value.jobCancellation?.penaltyCriteria || 0],
          rate: value.jobCancellation?.rate,
          hours: value.jobCancellation?.hours,
        });
        this.switchFormState();
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  private getDateString(date: string): string | null {
    return this.datePipe.transform(date, 'MM/dd/yyyy');
  }

  private subscribeOnDate(): void {
    merge(
      (this.startDateControl as AbstractControl).valueChanges,
      (this.endDateControl as AbstractControl).valueChanges
    )
      .pipe(
        filter((value) => !!value),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        const value = this.form.getRawValue();
        this.form.patchValue({ date: [value.startDate, value.endDate] });
      });
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

  private subscribeOnUpdateOrganisationCandidateJobError(): void {
    this.actions$
      .pipe(ofActionSuccessful(ShowToast))
      .pipe(
        filter((error) => error.type === MessageTypes.Error),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => this.jobStatusControl.reset());
  }

  private subscribeOnCancelOrganizationCandidateJobSuccess(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(CancelOrganizationCandidateJobSuccess))
      .subscribe(() => {
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
  }

  private subscribeOnGetStatus(): void {
    this.applicantStatuses$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ApplicantStatus[]) => {
      this.nextApplicantStatuses = data;
      this.changeDetectorRef.markForCheck();
    });
  }

  private handleOnboardedCandidate(event: { itemData: { applicantStatus: ApplicantStatus } }): void {
    if (event.itemData?.applicantStatus === ApplicantStatusEnum.OnBoarded) {
      this.onAccept();
    } else if (event.itemData?.applicantStatus === ApplicantStatusEnum.Cancelled) {
      this.openCandidateCancellationDialog.next();
    } else {
      this.store.dispatch(new GetRejectReasonsForOrganisation());
      this.openRejectDialog.next(true);
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
    });

    this.jobStatusControl = new FormControl('');
  }

  private closeDialog() {
    this.closeModalEvent.emit();
    this.candidateJob = null;
    this.jobStatusControl.reset();
    this.billRatesData = [];
    this.isRejected = false;
    this.nextApplicantStatuses = [];
    this.orderCandidateListViewService.setIsCandidateOpened(false);
    this.form.markAsPristine();
    this.changeDetectorRef.markForCheck();
  }

  private setCancellationControls(value: PenaltyCriteria): void{
    this.showHoursControl = value === PenaltyCriteria.RateOfHours || value === PenaltyCriteria.FlatRateOfHours;
    this.showPercentage = value === PenaltyCriteria.RateOfHours;
  }

  private switchFormState(): void {
    if ((this.isDeployedCandidate && !this.isAgency) || this.isCancelled) {
      this.form?.disable();
    } else {
      this.form?.enable();
    }
  }

  public onReject(): void {
    this.store.dispatch(new GetRejectReasonsForOrganisation());
    this.openRejectDialog.next(true);
  }
}
