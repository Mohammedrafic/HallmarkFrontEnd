import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MaskedDateTimeService } from "@syncfusion/ej2-angular-calendars";
import { filter, merge, Observable, Subject, takeUntil } from "rxjs";
import {
  JOB_STATUS,
  ONBOARDED_STATUS,
  OPTION_FIELDS
} from "@shared/components/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst";
import { BillRate } from "@shared/models/bill-rate.model";
import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { OrderCandidateJob, OrderCandidatesList } from "@shared/models/order-management.model";
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { OrderManagementContentState } from "@client/store/order-managment-content.state";
import { ApplicantStatus, CandidatStatus } from "@shared/enums/applicant-status.enum";
import {
  GetRejectReasonsForOrganisation,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  UpdateOrganisationCandidateJob
} from "@client/store/order-managment-content.actions";
import { ApplicantStatus as ApplicantStatusEnum, } from "@shared/enums/applicant-status.enum";
import { RejectReason } from "@shared/models/reject-reason.model";

@Component({
  selector: 'app-onboarded-candidate',
  templateUrl: './onboarded-candidate.component.html',
  styleUrls: ['./onboarded-candidate.component.scss'],
  providers: [MaskedDateTimeService]
})

export class OnboardedCandidateComponent implements OnInit, OnDestroy {
  @Select(OrderManagementContentState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  @Output() closeModalEvent = new EventEmitter<never>();

  @Input() candidate: OrderCandidatesList;
  @Input() isTab: boolean = false;

  public form: FormGroup;

  public optionFields = OPTION_FIELDS;
  public jobStatus = JOB_STATUS;
  public candidateJob: OrderCandidateJob | null;
  public isOnboarded = true;
  public today = new Date();
  public candidatStatus = CandidatStatus;
  public billRatesData: BillRate[] = [];
  public rejectReasons: RejectReason[] = [];
  public openRejectDialog = new Subject<boolean>();
  public isRejected = false;

  get startDateControl(): AbstractControl | null {
    return this.form.get('startDate');
  }

  get endDateControl(): AbstractControl | null {
    return this.form.get('endDate');
  }

  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private datePipe: DatePipe,
    private store: Store,
    private actions$: Actions
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.patchForm();
    this.subscribeOnDate();
    this.subscribeOnReasonsList();
    this.checkRejectReason();
    this.subscribeOnSuccessRejection();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onDropDownChanged(event: {itemData: {text: string, id: number}}): void {
    if(event.itemData.text === ONBOARDED_STATUS) {
      this.onAccept();
      this.store.dispatch(new ReloadOrganisationOrderCandidatesLists())
    } else {
      this.store.dispatch(new GetRejectReasonsForOrganisation());
      this.openRejectDialog.next(true);
    }
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
      this.form.patchValue({rejectReason: value})
      this.store.dispatch( new RejectCandidateJob(payload))
    }
  }

  public onClose() {
    this.closeModalEvent.emit();
    this.candidateJob = null;
    this.jobStatus = [];
    this.billRatesData = [];
    this.isRejected = false;
  }

  private onAccept(): void {
    if (this.form.valid && this.candidateJob) {
      const value = this.form.getRawValue();
      this.store.dispatch( new UpdateOrganisationCandidateJob({
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        orderId: this.candidateJob.orderId,
        nextApplicantStatus: {
          applicantStatus: 60,
          statusText: "Onboard"
        },
        candidateBillRate: value.candidateBillRate,
        offeredBillRate: value.offeredBillRate,
        requestComment: value.comments,
        actualStartDate: value.startDate,
        actualEndDate: value.endDate,
        clockId: value.clockId,
        guaranteedWorkWeek: value.workWeek,
        allowDeplayWoCredentials: value.allow,
        billRates: this.billRatesData
      })).subscribe(() => {
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
    }
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
          candidates: `${value.candidateProfile.lastName} ${value.candidateProfile.firstName}`,
          candidateBillRate: value.candidateBillRate,
          locationName: value.order.locationName,
          avStartDate: this.getAvailableStartDate(value.availableStartDate),
          yearExp: value.yearsOfExperience,
          travelExp: value.expAsTravelers,
          comments: value.requestComment,
          workWeek: value.guaranteedWorkWeek ? value.guaranteedWorkWeek : '',
          clockId: value.clockId ? value.clockId : '',
          offeredBillRate: value.offeredBillRate,
          allow: false,
          startDate: value.actualStartDate ? value.actualStartDate : value.order.jobStartDate,
          endDate: value.actualEndDate ? value.actualEndDate : value.order.jobEndDate,
          rejectReason: value.rejectReason
        });

        this.isFormDisabled(value.applicantStatus.applicantStatus);
      }
    });
  }

  private  getAvailableStartDate(date: string): string | null {
    return this.datePipe.transform(date, 'MM/dd/yyyy');
  }

  private subscribeOnDate(): void {
    merge(
      (this.startDateControl as AbstractControl).valueChanges,
      (this.endDateControl as AbstractControl).valueChanges
    ).pipe(
      filter((value) => !!value),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      const value = this.form.getRawValue()
      this.form.patchValue({ date: [value.startDate, value.endDate] });
    });
  }

  private isFormDisabled(status: number): void {
    if(status === ApplicantStatus.OnBoarded) {
      this.form.disable();
      this.isOnboarded = false;
    } else {
      this.form.enable();
      this.isOnboarded = true;
    }
  }

  private subscribeOnReasonsList(): void {
    this.rejectionReasonsList$.pipe(takeUntil(this.unsubscribe$)).subscribe(reasons => {
      this.rejectReasons = reasons;
    });
  }

  private checkRejectReason(): void {
    if(this.candidate.status === ApplicantStatusEnum.Rejected) {
      this.isRejected = true;
      this.form.disable();
    }
  }

  private subscribeOnSuccessRejection(): void {
    this.actions$.pipe(
      ofActionSuccessful(RejectCandidateForOrganisationSuccess),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.form.disable();
      this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
    });
  }

  private createForm() : void {
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
      offeredBillRate: new FormControl(''),
      allow: new FormControl(false),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      rejectReason: new FormControl('')
    });
  }
}
