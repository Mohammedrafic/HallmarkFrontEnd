import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { Observable, Subject, takeUntil } from "rxjs";

import { ApplyOrderApplicants, ApplyOrderApplicantsSucceeded } from "@agency/store/order-management.actions";
import { OrderManagementState } from "@agency/store/order-management.state";
import { BillRate } from "@shared/models/bill-rate.model";
import { OrderApplicantsInitialData } from "@shared/models/order-applicants.model";
import { AgencyOrderCandidates } from "@shared/models/order-management.model";

@Component({
  selector: 'app-apply-candidate',
  templateUrl: './apply-candidate.component.html',
  styleUrls: ['./apply-candidate.component.scss']
})
export class ApplyCandidateComponent implements OnInit, OnDestroy {
  @Output() public closeDialogEmitter: EventEmitter<void> = new EventEmitter();

  @Input() candidate: AgencyOrderCandidates;
  @Input() billRatesData: BillRate[] = [];

  public formGroup: FormGroup;

  @Select(OrderManagementState.orderApplicantsInitialData)
  public orderApplicantsInitialData$: Observable<OrderApplicantsInitialData>;

  private unsubscribe$: Subject<void> = new Subject();
  private organizationId: number;
  private candidateId: number;

  constructor(private store: Store,
              private actions$: Actions,
              private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.createForm();
    this.subscribeOnInitialData();
    this.subscribeOnSucceededApply();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onCloseDialog(): void {
    this.closeDialogEmitter.next();
  }

  applyOrderApplicants(): void {
    this.formGroup.markAsUntouched();
    if (this.formGroup.valid) {
      const value = this.formGroup.getRawValue();
      this.store.dispatch(new ApplyOrderApplicants({
        orderId: value.orderId,
        organizationId: this.organizationId,
        candidateId: this.candidateId,
        candidateBillRate: value.candidateBillRate,
        expAsTravelers: value.expAsTravelers,
        availableStartDate: value.availableStartDate,
        requestComment: value.requestComment
      }));
    }
  }

  private createForm(): void {
    this.formGroup = new FormGroup({
      orderId: new FormControl(null),
      jobDate: new FormControl(''),
      orderBillRate: new FormControl(null),
      locationName: new FormControl(''),
      availableStartDate: new FormControl(''),
      yearsOfExperience: new FormControl(null),
      candidateBillRate: new FormControl(null, [Validators.required]),
      expAsTravelers: new FormControl(0),
      requestComment: new FormControl('', [Validators.maxLength(2000)]),
    });
  }

  private setFormValue(data: OrderApplicantsInitialData): void {
    this.formGroup.setValue({
      orderId: data.orderId,
      jobDate: this.getJobDate(data.jobStartDate, data.jobEndDate),
      orderBillRate: data.orderBillRate,
      locationName: data.locationName,
      availableStartDate: data.availableStartDate,
      yearsOfExperience: data.yearsOfExperience,
      candidateBillRate: data.orderBillRate,
      expAsTravelers: 0,
      requestComment: ''
    });
  }

  private getJobDate(startDate: string, endDate: string): string {
    return `${this.datePipe.transform(startDate, 'MM/dd/yyyy')} - ${this.datePipe.transform(endDate, 'MM/dd/yyyy')}`;
  }

  private subscribeOnInitialData(): void {
    this.orderApplicantsInitialData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: OrderApplicantsInitialData) => {
      if (data) {
        this.organizationId = data.organizationId;
        this.candidateId = data.candidateId;
        this.setFormValue(data);
      }
    });
  }

  private subscribeOnSucceededApply(): void {
    this.actions$.pipe(ofActionSuccessful(ApplyOrderApplicantsSucceeded), takeUntil(this.unsubscribe$)).subscribe(() => {
      this.onCloseDialog();
    });
  }
}
