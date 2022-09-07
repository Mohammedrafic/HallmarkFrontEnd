import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { RejectReason } from '@shared/models/reject-reason.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { OrderManagementState } from '@agency/store/order-management.state';
import { ApplicantStatus, OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { BillRate } from '@shared/models/bill-rate.model';
import {
  GetRejectReasonsForAgency,
  RejectCandidateForAgencySuccess,
  RejectCandidateJob,
  ReloadOrderCandidatesLists,
  UpdateAgencyCandidateJob,
} from '@agency/store/order-management.actions';
import { DatePipe } from '@angular/common';
import { ApplicantStatus as ApplicantStatusEnum, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import PriceUtils from '@shared/utils/price.utils';
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';

@Component({
  selector: 'app-accept-candidate',
  templateUrl: './accept-candidate.component.html',
  styleUrls: ['./accept-candidate.component.scss'],
  providers: [MaskedDateTimeService],
})
export class AcceptCandidateComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Output() closeModalEvent: EventEmitter<void> = new EventEmitter();

  @Input() candidate: OrderCandidatesList;
  @Input() isTab: boolean = false;
  @Input() isAgency: boolean = false;

  @Select(OrderManagementState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  @Select(OrderManagementState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  form: FormGroup;

  public candidateJob: OrderCandidateJob;
  public candidatStatus = CandidatStatus;
  public billRatesData: BillRate[] = [];
  public rejectReasons: RejectReason[] = [];
  public isReadOnly = false;
  public openRejectDialog = new Subject<boolean>();
  public priceUtils = PriceUtils;

  get isRejected(): boolean {
    return this.isReadOnly && this.candidateStatus === ApplicantStatusEnum.Rejected;
  }

  get isApplied(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.Applied;
  }

  get isOnboard(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.OnBoarded;
  }

  get candidateStatus(): ApplicantStatusEnum {
    return this.candidate.status || (this.candidate.candidateStatus as any);
  }

  get isDeployedCandidate(): boolean {
    return !!this.candidate.deployedCandidateInfo && this.candidate.status !== ApplicantStatusEnum.OnBoarded;
  }

  get showGuaranteedWorkWeek(): boolean {
    return (
      this.candidateStatus === ApplicantStatusEnum.Shortlisted ||
      this.candidateStatus === ApplicantStatusEnum.PreOfferCustom ||
      this.candidateStatus === ApplicantStatusEnum.Offered ||
      this.isOnboard
    );
  }

  get showWithdrawAction(): boolean {
    return (
      (!this.isWithdraw &&
        [ApplicantStatusEnum.Shortlisted, ApplicantStatusEnum.PreOfferCustom, ApplicantStatusEnum.Applied].includes(
          this.candidateStatus
        ) &&
        !this.isDeployedCandidate) ||
      (this.isAgency &&
        [ApplicantStatusEnum.Shortlisted, ApplicantStatusEnum.PreOfferCustom].includes(this.candidateStatus))
    );
  }

  private unsubscribe$: Subject<void> = new Subject();
  private isWithdraw: boolean;

  public comments: Comment[] = [];

  constructor(
    private store: Store,
    private actions$: Actions,
    private datePipe: DatePipe,
    private confirmService: ConfirmService,
    private commentsService: CommentsService
  ) {}

  ngOnChanges(): void {
    this.switchFormState();
    this.checkReadOnlyStatuses();
  }

  ngOnInit(): void {
    this.createForm();
    this.switchFormState();
    this.patchForm();
    this.subscribeOnReasonsList();
    this.subscribeOnSuccessRejection();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  public onAccept(): void {
    this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Accepted, statusText: 'Accepted' });
  }

  public onApply(): void {
    if (this.form.valid) {
      this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Applied, statusText: 'Applied' });
    }
  }

  public onWithdraw(): void {
    this.isWithdraw = true;
    this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Withdraw, statusText: 'Withdraw' });
  }

  public onReject(): void {
    this.store.dispatch(new GetRejectReasonsForAgency());
    this.openRejectDialog.next(true);
  }

  public rejectCandidateJob(event: { rejectReason: number }): void {
    this.isReadOnly = true;
    this.candidate.status = ApplicantStatusEnum.Rejected;

    if (this.candidateJob) {
      const payload = {
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        rejectReasonId: event.rejectReason,
      };

      const value = this.rejectReasons.find((reason: RejectReason) => reason.id === event.rejectReason)?.reason;
      this.form.patchValue({ rejectReason: value });
      this.store.dispatch(new RejectCandidateJob(payload)).subscribe(() => {
        this.store.dispatch(new ReloadOrderCandidatesLists());
      });

      this.closeDialog();
    }
  }

  private updateAgencyCandidateJob(applicantStatus: ApplicantStatus): void {
    const value = this.form.getRawValue();
    this.store
      .dispatch(
        new UpdateAgencyCandidateJob({
          organizationId: this.candidateJob.organizationId,
          jobId: this.candidateJob.jobId,
          orderId: this.candidateJob.orderId,
          nextApplicantStatus: applicantStatus,
          candidateBillRate: value.candidateBillRate,
          offeredBillRate: value.offeredBillRate || null,
          requestComment: value.comments,
          expAsTravelers: value.expAsTravelers,
          availableStartDate: value.availableStartDate,
          actualStartDate: this.candidateJob.actualStartDate,
          actualEndDate: this.candidateJob.actualEndDate,
          clockId: this.candidateJob.clockId,
          guaranteedWorkWeek: this.candidateJob.guaranteedWorkWeek,
          allowDeployWoCredentials: false,
          billRates: this.billRatesData,
          offeredStartDate: this.candidateJob.offeredStartDate,
        })
      )
      .subscribe(() => {
        this.store.dispatch(new ReloadOrderCandidatesLists());
      });
    this.closeDialog();
  }

  private createForm(): void {
    this.form = new FormGroup({
      jobId: new FormControl(''),
      date: new FormControl(''),
      billRates: new FormControl(''),
      availableStartDate: new FormControl('', [Validators.required]),
      candidateBillRate: new FormControl('', [Validators.required]),
      locationName: new FormControl(''),
      yearExp: new FormControl(''),
      expAsTravelers: new FormControl(''),
      offeredBillRate: new FormControl(''),
      comments: new FormControl(''),
      rejectReason: new FormControl(''),
      guaranteedWorkWeek: new FormControl(''),
      offeredStartDate: new FormControl(''),
      clockId: new FormControl(''),
      actualStartDate: new FormControl(''),
      actualEndDate: new FormControl(''),
    });
  }

  private getDateString(date: string): string | null {
    return this.datePipe.transform(date, 'MM/dd/yyyy');
  }

  private getComments(): void {
    this.commentsService
      .getComments(this.candidateJob?.commentContainerId as number, null)
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
      });
  }

  private patchForm(): void {
    this.candidateJobState$.pipe(takeUntil(this.unsubscribe$)).subscribe((value) => {
      this.candidateJob = value;
      if (value) {
        this.getComments();
        this.billRatesData = [...value.billRates];
        this.form.patchValue({
          jobId: `${value.organizationPrefix}-${value.orderPublicId}`,
          date: [value.order.jobStartDate, value.order.jobEndDate],
          billRates: value.order.hourlyRate && PriceUtils.formatNumbers(value.order.hourlyRate),
          availableStartDate: value.availableStartDate,
          candidateBillRate: PriceUtils.formatNumbers(value.candidateBillRate),
          locationName: value.order.locationName,
          yearExp: value.yearsOfExperience,
          expAsTravelers: value.expAsTravelers,
          offeredBillRate: PriceUtils.formatNumbers(value.offeredBillRate),
          comments: value.requestComment,
          rejectReason: value.rejectReason,
          guaranteedWorkWeek: value.guaranteedWorkWeek,
          offeredStartDate: this.getDateString(value.offeredStartDate),
          clockId: value.clockId,
          actualStartDate: this.getDateString(value.actualStartDate),
          actualEndDate: this.getDateString(value.actualEndDate),
        });
      }
    });
  }

  private subscribeOnReasonsList(): void {
    this.rejectionReasonsList$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((reasons) => (this.rejectReasons = reasons));
  }

  private subscribeOnSuccessRejection(): void {
    this.actions$
      .pipe(ofActionSuccessful(RejectCandidateForAgencySuccess), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.form.disable();
        this.store.dispatch(new ReloadOrderCandidatesLists());
      });
  }

  private checkReadOnlyStatuses(): void {
    const readOnlyStatuses = [
      ApplicantStatusEnum.Rejected,
      ApplicantStatusEnum.Applied,
      ApplicantStatusEnum.Shortlisted,
      ApplicantStatusEnum.OnBoarded,
      ApplicantStatusEnum.PreOfferCustom,
    ];
    if (readOnlyStatuses.includes(this.candidateStatus) || this.isDeployedCandidate) {
      this.isReadOnly = true;
    }
  }

  private switchFormState(): void {
    if (this.isApplied && !this.candidate.deployedCandidateInfo) {
      this.form?.enable();
    } else {
      this.form?.disable();
    }
  }

  private closeDialog(): void {
    this.closeModalEvent.emit();
    this.billRatesData = [];
    this.isReadOnly = false;
    this.isWithdraw = false;
    this.form.markAsPristine();
  }
}
