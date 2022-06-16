import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { Select, Store } from "@ngxs/store";
import { Observable, Subject, takeUntil } from "rxjs";

import { BillRate } from "@shared/models/bill-rate.model";
import { ApplicantStatus, OrderCandidateJob, OrderCandidatesList } from "@shared/models/order-management.model";
import { OrderManagementContentState } from "@client/store/order-managment-content.state";
import { ReloadOrganisationOrderCandidatesLists, UpdateOrganisationCandidateJob } from "@client/store/order-managment-content.actions";


@Component({
  selector: 'app-offer-deployment',
  templateUrl: './offer-deployment.component.html',
  styleUrls: ['./offer-deployment.component.scss']
})
export class OfferDeploymentComponent implements OnInit, OnDestroy {
  @Output() public closeDialogEmitter: EventEmitter<void> = new EventEmitter();

  @Input() candidate: OrderCandidatesList;
  @Input() billRatesData: BillRate[] = [];

  public formGroup: FormGroup;
  public nextApplicantStatuses: ApplicantStatus[];
  public optionFields = { text: 'statusText', value: 'applicantStatus' };

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;
  @Select(OrderManagementContentState.applicantStatuses)
  applicantStatuses$: Observable<ApplicantStatus[]>;

  private unsubscribe$: Subject<void> = new Subject();
  private candidateJob: OrderCandidateJob | null;

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.createForm();
    this.subscribeOnInitialData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onCloseDialog(): void {
    this.closeDialogEmitter.next();
    this.nextApplicantStatuses = [];
    this.candidateJob = null;
  }

  public updateCandidateJob(event: { itemData: ApplicantStatus }): void {
    if (this.formGroup.valid && this.candidateJob) {
      const value = this.formGroup.getRawValue();
      this.store.dispatch( new UpdateOrganisationCandidateJob({
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        nextApplicantStatus: event.itemData,
        candidateBillRate: this.candidateJob.candidateBillRate,
        offeredBillRate: value.offeredBillRate,
        requestComment: this.candidateJob.requestComment,
        actualStartDate: this.candidateJob.actualStartDate,
        actualEndDate: this.candidateJob.actualEndDate,
        clockId: this.candidateJob.clockId,
        guaranteedWorkWeek: this.candidateJob.guaranteedWorkWeek,
        allowDeplayWoCredentials: true
      })).subscribe((data) => {
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
        this.onCloseDialog();
      });

    }
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
    });
  }

  private setFormValue(data: OrderCandidateJob): void {
    this.formGroup.setValue({
      jobId: data.jobId,
      jobDate: [data.order.jobStartDate, data.order.jobEndDate],
      offeredBillRate: data.order.hourlyRate,
      orderBillRate: data.order.hourlyRate,
      locationName: data.order.locationName,
      availableStartDate: data.availableStartDate,
      candidateBillRate: data.candidateBillRate,
      requestComment: data.requestComment
    });
  }

  private subscribeOnInitialData(): void {
    this.candidateJobState$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: OrderCandidateJob) => {
      this.candidateJob = data;

      if (data) {
        this.setFormValue(data);
      }
    });
    this.applicantStatuses$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: ApplicantStatus[]) => this.nextApplicantStatuses = data);
  }
}
