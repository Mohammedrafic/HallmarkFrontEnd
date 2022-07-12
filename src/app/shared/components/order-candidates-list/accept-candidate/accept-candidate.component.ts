import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';

import { RejectReason } from "@shared/models/reject-reason.model";
import { Observable, Subject, takeUntil } from "rxjs";
import { FormControl, FormGroup} from "@angular/forms";
import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { OrderManagementState } from "@agency/store/order-management.state";
import { OrderCandidateJob, OrderCandidatesList } from "@shared/models/order-management.model";
import { BillRate } from "@shared/models/bill-rate.model";
import {
  GetRejectReasonsForAgency,
  RejectCandidateForAgencySuccess,
  RejectCandidateJob,
  ReloadOrderCandidatesLists,
  UpdateAgencyCandidateJob
} from "@agency/store/order-management.actions";
import { DatePipe } from '@angular/common';
import { ApplicantStatus as ApplicantStatusEnum, CandidatStatus } from '@shared/enums/applicant-status.enum';

@Component({
  selector: 'app-accept-candidate',
  templateUrl: './accept-candidate.component.html',
  styleUrls: ['./accept-candidate.component.scss']
})
export class AcceptCandidateComponent implements OnInit, OnDestroy, OnChanges {
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

  get isRejected(): boolean {
    return this.isReadOnly && this.candidate.status === ApplicantStatusEnum.Rejected;
  }

  get isOnboard(): boolean {
    return this.candidate.status === ApplicantStatusEnum.OnBoarded;
  }

  get showGuaranteedWorkWeek(): boolean {
    return this.candidate.status === ApplicantStatusEnum.Shortlisted
      || this.candidate.status === ApplicantStatusEnum.PreOfferCustom
      || this.candidate.status === ApplicantStatusEnum.Offered
      || this.isOnboard;
  }

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store, private actions$: Actions, private datePipe: DatePipe) { }

  ngOnChanges(): void {
    this.checkReadOnlyStatuses();
  }

  ngOnInit(): void {
    this.createForm();
    this.form.disable();
    this.patchForm();
    this.subscribeOnReasonsList();
    this.subscribeOnSuccessRejection();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onClose(): void {
    this.closeModalEvent.emit();
    this.billRatesData = [];
    this.isReadOnly = false;
  }

  public onAccept(): void {
    const value = this.form.getRawValue();
    this.store.dispatch(new UpdateAgencyCandidateJob({
      organizationId: this.candidateJob.organizationId,
      jobId: this.candidateJob.jobId,
      orderId: this.candidateJob.orderId,
      nextApplicantStatus: {
        applicantStatus: 50,
        statusText: "Accepted"
      },
      candidateBillRate: value.candidateBillRate,
      offeredBillRate: value.offeredBillRate,
      requestComment: value.comments,
      actualStartDate: this.candidateJob.actualStartDate,
      actualEndDate: this.candidateJob.actualEndDate,
      clockId: this.candidateJob.clockId,
      guaranteedWorkWeek: this.candidateJob.guaranteedWorkWeek,
      allowDeplayWoCredentials: false,
      billRates: this.billRatesData,
      offeredStartDate: this.candidateJob.offeredStartDate
    })).subscribe(() => {
      this.store.dispatch(new ReloadOrderCandidatesLists());
    });
  }

  public onReject(): void {
    this.store.dispatch(new GetRejectReasonsForAgency());
    this.openRejectDialog.next(true);
  }

  public rejectCandidateJob(event: {rejectReason: number}): void {
    this.isReadOnly = true;
    this.candidate.status = ApplicantStatusEnum.Rejected;

    if(this.candidateJob) {
      const payload = {
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        rejectReasonId: event.rejectReason
      };

      const value = this.rejectReasons.find((reason: RejectReason) => reason.id === event.rejectReason)?.reason;
      this.form.patchValue({ rejectReason: value });
      this.store.dispatch( new RejectCandidateJob(payload));
    }
  }

  private createForm() : void {
    this.form = new FormGroup({
      jobId: new FormControl(''),
      date: new FormControl(''),
      billRates: new FormControl(''),
      avStartDate: new FormControl(''),
      candidateBillRate: new FormControl(''),
      locationName: new FormControl(''),
      yearExp: new FormControl(''),
      travelExp: new FormControl(''),
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

  private onCloseDialog(): void {
    this.closeModalEvent.next();
  }

  private  getDateString(date: string): string | null {
    return this.datePipe.transform(date, 'MM/dd/yyyy');
  }

  private patchForm(): void {
    this.candidateJobState$.pipe(takeUntil(this.unsubscribe$)).subscribe((value) => {
      this.candidateJob = value;
      if(value) {
        this.billRatesData = [...value.billRates];
        this.form.patchValue({
          jobId: value.orderId,
          date: [value.order.jobStartDate, value.order.jobEndDate],
          billRates: value.order.hourlyRate,
          avStartDate: this.getDateString(value.availableStartDate),
          candidateBillRate: value.candidateBillRate,
          locationName: value.order.locationName,
          yearExp: value.yearsOfExperience,
          travelExp: value.expAsTravelers,
          offeredBillRate: value.offeredBillRate,
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
    this.rejectionReasonsList$.pipe(takeUntil(this.unsubscribe$)).subscribe(reasons => this.rejectReasons = reasons);
  }

  private subscribeOnSuccessRejection(): void {
    this.actions$.pipe(
      ofActionSuccessful(RejectCandidateForAgencySuccess),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
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
      ApplicantStatusEnum.PreOfferCustom
    ];
    if (readOnlyStatuses.includes(this.candidate.status) || this.candidate.deployedCandidateInfo) {
      this.isReadOnly = true;
    }
  }
}
