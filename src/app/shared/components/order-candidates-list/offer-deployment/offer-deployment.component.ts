import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { Observable, Subject, takeUntil } from "rxjs";

import { BillRate } from "@shared/models/bill-rate.model";
import { ApplicantStatus, OrderCandidateJob, OrderCandidatesList } from "@shared/models/order-management.model";
import { OrderManagementContentState } from "@client/store/order-managment-content.state";
import {
  GetRejectReasonsForOrganisation,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  UpdateOrganisationCandidateJob,
  UpdateOrganisationCandidateJobSucceed
} from "@client/store/order-managment-content.actions";
import { ApplicantStatus as ApplicantStatusEnum, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { BillRatesComponent } from "@shared/components/bill-rates/bill-rates.component";
import { RejectReason } from "@shared/models/reject-reason.model";

@Component({
  selector: 'app-offer-deployment',
  templateUrl: './offer-deployment.component.html',
  styleUrls: ['./offer-deployment.component.scss']
})
export class OfferDeploymentComponent implements OnInit, OnDestroy, OnChanges {
  @Select(OrderManagementContentState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  @ViewChild('billRates') billRatesComponent: BillRatesComponent;

  @Output() public closeDialogEmitter: EventEmitter<void> = new EventEmitter();

  @Input() candidate: OrderCandidatesList;
  @Input() isTab: boolean = false;

  public openRejectDialog = new Subject<boolean>();
  public billRatesData: BillRate[] = [];
  public formGroup: FormGroup;
  public nextApplicantStatuses: ApplicantStatus[];
  public optionFields = { text: 'statusText', value: 'applicantStatus' };
  public readOnlyMode: boolean;
  public rejectReasons: RejectReason[] = [];
  public isRejected = false;
  public candidatStatus = CandidatStatus;

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;
  @Select(OrderManagementContentState.applicantStatuses)
  applicantStatuses$: Observable<ApplicantStatus[]>;

  private unsubscribe$: Subject<void> = new Subject();
  private candidateJob: OrderCandidateJob | null;
  private isOfferedStatus: boolean;
  private currentApplicantStatus: ApplicantStatus;

  constructor(private store: Store, private actions$: Actions) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.readOnlyMode =
      changes['candidate']?.currentValue.status === ApplicantStatusEnum.Offered ||
      changes['candidate']?.currentValue.status === ApplicantStatusEnum.Rejected;

    this.checkRejectReason();
  }

  public ngOnInit(): void {
    this.createForm();
    this.subscribeOnInitialData();
    this.subscribeOnSuccessRejection();
    this.subscribeOnReasonsList();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onCloseDialog(): void {
    this.closeDialogEmitter.next();
    this.nextApplicantStatuses = [];
    this.billRatesData = [];
    this.candidateJob = null;
    this.isOfferedStatus = false;
    this.isRejected = false;
  }

  public onRejectCandidate(event: {rejectReason: number}): void {
    this.isRejected = true;

    if(this.candidateJob) {
      const payload = {
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        rejectReasonId: event.rejectReason
      };

      const value = this.rejectReasons.find((reason: RejectReason) => reason.id === event.rejectReason)?.reason;
      this.formGroup.patchValue({rejectReason: value})
      this.store.dispatch( new RejectCandidateJob(payload))
    }
  }

  public updateCandidateJob(event: { itemData: ApplicantStatus }): void {
    if (event.itemData.applicantStatus === ApplicantStatusEnum.Rejected) {
      this.store.dispatch(new GetRejectReasonsForOrganisation());
      this.openRejectDialog.next(true);
    } else {
      if (this.formGroup.valid && this.candidateJob) {
        const value = this.formGroup.getRawValue();
        this.isOfferedStatus = event.itemData.applicantStatus === ApplicantStatusEnum.Offered;
        this.store.dispatch(new UpdateOrganisationCandidateJob({
          orderId: this.candidateJob.orderId,
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
          allowDeplayWoCredentials: true,
          billRates: this.billRatesComponent.billRatesControl.value
        })).subscribe(() => this.store.dispatch(new ReloadOrganisationOrderCandidatesLists()));
      }
    }
  }

  public onBillRatesChanged(): void {
    this.updateCandidateJob({ itemData: this.currentApplicantStatus });
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
      rejectReason: new FormControl('')
    });
  }

  private setFormValue(data: OrderCandidateJob): void {
    this.formGroup.setValue({
      jobId: data.jobId,
      jobDate: [data.order.jobStartDate, data.order.jobEndDate],
      offeredBillRate: data.offeredBillRate || data.order.hourlyRate,
      orderBillRate: data.order.hourlyRate,
      locationName: data.order.locationName,
      availableStartDate: data.availableStartDate,
      candidateBillRate: data.candidateBillRate,
      requestComment: data.requestComment,
      rejectReason: data.rejectReason
    });
  }

  private subscribeOnInitialData(): void {
    this.candidateJobState$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: OrderCandidateJob) => {
      this.candidateJob = data;

      if (data) {
        this.currentApplicantStatus = data.applicantStatus;
        this.billRatesData = [...data.billRates];
        this.setFormValue(data);
      }
    });
    this.applicantStatuses$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: ApplicantStatus[]) => this.nextApplicantStatuses = data);
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(UpdateOrganisationCandidateJobSucceed)).subscribe(() => {
      this.readOnlyMode = this.isOfferedStatus;
    });
  }

  private subscribeOnSuccessRejection(): void {
    this.actions$.pipe(
      ofActionSuccessful(RejectCandidateForOrganisationSuccess),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.formGroup.disable();
      this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
    });
  }

  private subscribeOnReasonsList(): void {
    this.rejectionReasonsList$.pipe(takeUntil(this.unsubscribe$)).subscribe(reasons => {
      this.rejectReasons = reasons;
    });
  }

  private checkRejectReason(): void {
    if(this.candidate.status === ApplicantStatusEnum.Rejected) {
      this.isRejected = true;
    }
  }
}
