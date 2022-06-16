import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { filter, merge, Observable, Subject, takeUntil } from "rxjs";
import {
  JOB_STATUS,
  ONBOARDED_STATUS,
  OPTION_FIELDS
} from "@shared/components/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst";
import { BillRate } from "@shared/models/bill-rate.model";
import { Select, Store } from "@ngxs/store";
import { OrderCandidateJob, OrderCandidatesList } from "@shared/models/order-management.model";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { OrderManagementContentState } from "@client/store/order-managment-content.state";
import { ReloadOrganisationOrderCandidatesLists, UpdateOrganisationCandidateJob } from "@client/store/order-managment-content.actions";

@Component({
  selector: 'app-onboarded-candidate',
  templateUrl: './onboarded-candidate.component.html',
  styleUrls: ['./onboarded-candidate.component.scss']
})

export class OnboardedCandidateComponent implements OnInit, OnDestroy {
  @Output() closeModalEvent = new EventEmitter<never>();

  @Input() billRatesData: BillRate[] = [];
  @Input() candidate: OrderCandidatesList;

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  public form: FormGroup;

  public optionFields = OPTION_FIELDS;
  public jobStatus = JOB_STATUS;
  public candidateJob: OrderCandidateJob;
  public isOnboarded = false;

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
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.patchForm();
    this.subscribeOnDate();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onDropDownChanged(event: {itemData: {text: string, id: number}}): void {
    if(event.itemData.text === ONBOARDED_STATUS) {
      this.onAccept();
      this.store.dispatch(new ReloadOrganisationOrderCandidatesLists())
    }
  }

  public onClose() {
    this.closeModalEvent.emit();
  }

  private onAccept(): void {
    this.form.markAsUntouched();
    if (this.form.valid) {
      const value = this.form.getRawValue();
      this.store.dispatch( new UpdateOrganisationCandidateJob({
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        nextApplicantStatus: {
          applicantStatus: 60,
          statusText: "OnBoarded"
        },
        candidateBillRate: value.candidateBillRate,
        offeredBillRate: value.offeredBillRate,
        requestComment: value.comments,
        actualStartDate: value.startDate,
        actualEndDate: value.endDate,
        clockId: value.clockId,
        guaranteedWorkWeek: value.workWeek,
        allowDeplayWoCredentials: value.allow
      })).subscribe(() => {
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
    }
  }

  private patchForm(): void {
    this.candidateJobState$.pipe(takeUntil(this.unsubscribe$)).subscribe((value) => {
      this.candidateJob = value;
      if(value) {
        this.form.patchValue({
          jobId: value.orderId,
          date: [value.order.jobStartDate, value.order.jobEndDate],
          billRates: value.order.billRates,
          candidates: `${value.candidateProfile.lastName} ${value.candidateProfile.firstName}`,
          candidateBillRate: value.candidateBillRate,
          locationName: value.order.locationName,
          avStartDate: this.getAvailableStartDate(value.availableStartDate),
          yearExp: value.yearsOfExperience,
          travelExp: value.expAsTravelers,
          comments: value.requestComment,
          workWeek: '',
          clockId: '',
          offeredBillRate: value.order.billRates,
          allow: false,
          startDate: value.order.jobStartDate,
          endDate: value.order.jobEndDate,
        });
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
      workWeek: new FormControl(''),
      clockId: new FormControl(''),
      offeredBillRate: new FormControl(''),
      allow: new FormControl(false),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
    });
  }
}
