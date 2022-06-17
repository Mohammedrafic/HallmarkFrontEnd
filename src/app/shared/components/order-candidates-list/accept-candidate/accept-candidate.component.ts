import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject, takeUntil } from "rxjs";
import { FormControl, FormGroup} from "@angular/forms";
import { Select, Store } from "@ngxs/store";
import { OrderManagementState } from "@agency/store/order-management.state";
import { OrderCandidateJob, OrderCandidatesList } from "@shared/models/order-management.model";
import { BillRate } from "@shared/models/bill-rate.model";
import {
  ReloadOrderCandidatesLists,
  UpdateAgencyCandidateJob
} from "@agency/store/order-management.actions";

@Component({
  selector: 'app-accept-candidate',
  templateUrl: './accept-candidate.component.html',
  styleUrls: ['./accept-candidate.component.scss']
})
export class AcceptCandidateComponent implements OnInit, OnDestroy {
  @Output() closeModalEvent: EventEmitter<void> = new EventEmitter();

  @Input() billRatesData: BillRate[] = [];
  @Input() candidate: OrderCandidatesList;

  @Select(OrderManagementState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  form: FormGroup;

  public candidateJob: OrderCandidateJob;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.createForm();
    this.form.disable();
    this.patchForm();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onClose(): void {
    this.closeModalEvent.emit();
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
      allowDeplayWoCredentials: false
    })).subscribe(() => {
      this.store.dispatch(new ReloadOrderCandidatesLists());
    });
  }

  public onReject(): void {}

  private createForm() : void {
    this.form = new FormGroup({
      jobId: new FormControl(''),
      date: new FormControl(''),
      billRates: new FormControl(''),
      candidates: new FormControl(''),
      candidateBillRate: new FormControl(''),
      locationName: new FormControl(''),
      yearExp: new FormControl(''),
      travelExp: new FormControl(''),
      offeredBillRate: new FormControl(''),
      comments: new FormControl('')
    });
  }

  private onCloseDialog(): void {
    this.closeModalEvent.next();
  }

  private patchForm(): void {
    this.candidateJobState$.pipe(takeUntil(this.unsubscribe$)).subscribe((value) => {
      this.candidateJob = value;
      if(value) {
        this.form.patchValue({
          jobId: value.orderId,
          date: [value.order.jobStartDate, value.order.jobEndDate],
          billRates: value.order.hourlyRate,
          candidates: `${value.candidateProfile.lastName} ${value.candidateProfile.firstName}`,
          candidateBillRate: value.candidateBillRate,
          locationName: value.order.locationName,
          yearExp: value.yearsOfExperience,
          travelExp: value.expAsTravelers,
          offeredBillRate: value.offeredBillRate,
          comments: value.requestComment
        });
      }
    });
  }
}
