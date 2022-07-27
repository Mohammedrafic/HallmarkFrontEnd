import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { combineLatest, mergeMap, Observable, Subject, takeUntil, tap } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { AccordionClickArgs, AccordionComponent, ExpandEventArgs } from '@syncfusion/ej2-angular-navigations';

import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ApplicantStatus, Order, OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { AccordionOneField } from '@shared/models/accordion-one-field.model';
import { OrderManagementState } from '@agency/store/order-management.state';
import { AcceptFormComponent } from './accept-form/accept-form.component';
import { ReloadOrderCandidatesLists, UpdateAgencyCandidateJob } from '@agency/store/order-management.actions';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';

@Component({
  selector: 'app-reorder-status-dialog',
  templateUrl: './reorder-status-dialog.component.html',
  styleUrls: ['./reorder-status-dialog.component.scss'],
})
export class ReorderStatusDialogComponent extends DestroyableDirective implements OnInit {
  @Input() openEvent: Subject<boolean>;
  @Input() candidate: OrderCandidatesList;
  @Input() isAgency: boolean = false;
  @Input() isTab: boolean = false;
  @Input() dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  @Input() set candidateJob(orderCandidateJob: OrderCandidateJob) {
    if (orderCandidateJob) {
      this.orderCandidateJob = orderCandidateJob;
      this.setValueForm(orderCandidateJob);
    } else {
      this.acceptForm?.reset();
    }
  }

  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Select(OrderManagementState.selectedOrder)
  public selectedOrder$: Observable<Order>;

  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public acceptForm = AcceptFormComponent.generateFormGroup();
  public accordionOneField: AccordionOneField;
  public accordionClickElement: HTMLElement | null;
  public orderCandidateJob: OrderCandidateJob;

  constructor(private store: Store, private actions$: Actions) {
    super();
  }

  ngOnInit(): void {
    combineLatest([this.onOpenEvent(), this.onUpdateSuccess()]).pipe(takeUntil(this.destroy$)).subscribe();
  }

  public onAccept(): void {
    const value = this.acceptForm.getRawValue();
    const applicantStatus: ApplicantStatus = this.getNewApplicantStatus();

    this.store.dispatch(
      new UpdateAgencyCandidateJob({
        organizationId: this.orderCandidateJob.organizationId,
        jobId: this.orderCandidateJob.jobId,
        orderId: this.orderCandidateJob.orderId,
        nextApplicantStatus: applicantStatus,
        candidateBillRate: value.candidateBillRate,
        offeredBillRate: value.offeredBillRate,
        requestComment: value.comments,
        actualStartDate: this.orderCandidateJob.actualStartDate,
        actualEndDate: this.orderCandidateJob.actualEndDate,
        clockId: this.orderCandidateJob.clockId,
        guaranteedWorkWeek: this.orderCandidateJob.guaranteedWorkWeek,
        allowDeplayWoCredentials: false,
        billRates: this.orderCandidateJob.billRates,
        offeredStartDate: this.orderCandidateJob.offeredStartDate,
      })
    );
  }

  public clickedOnAccordion(accordionClick: AccordionClickArgs): void {
    this.accordionOneField = new AccordionOneField(this.accordionComponent);
    this.accordionClickElement = this.accordionOneField.clickedOnAccordion(accordionClick);
  }

  public toForbidExpandSecondRow(expandEvent: ExpandEventArgs): void {
    this.accordionOneField = new AccordionOneField(this.accordionComponent);
    this.accordionOneField.toForbidExpandSecondRow(expandEvent, this.accordionClickElement);
  }

  public onCloseDialog(): void {
    this.openEvent.next(false);
  }

  public onNextPreviousOrder(next: boolean): void {
    this.nextPreviousOrderEvent.emit(next);
  }

  private setValueForm({
    order: { locationName, departmentName, skillName, orderOpenDate, shiftStartTime, shiftEndTime, openPositions },
    jobId,
    offeredBillRate,
    candidateBillRate,
  }: OrderCandidateJob) {
    this.acceptForm.patchValue({
      jobId,
      offeredBillRate,
      candidateBillRate,
      locationName,
      departmentName,
      skillName,
      orderOpenDate,
      shiftStartTime,
      shiftEndTime,
      openPositions,
    });
  }

  private getNewApplicantStatus(): ApplicantStatus {
    return this.acceptForm.dirty
      ? { applicantStatus: CandidatStatus.BillRatePending, statusText: 'Bill Rate Pending' }
      : { applicantStatus: CandidatStatus.OnBoard, statusText: 'Onboard' };
  }

  private onOpenEvent(): Observable<boolean> {
    return this.openEvent.pipe(
      tap((isOpen: boolean) => {
        if (isOpen) {
          this.sideDialog.show();
        } else {
          this.sideDialog.hide();
        }
      })
    );
  }

  private onUpdateSuccess(): Observable<unknown> {
    return this.actions$.pipe(
      ofActionSuccessful(UpdateAgencyCandidateJob),
      mergeMap(() => this.store.dispatch(new ReloadOrderCandidatesLists())),
      tap(() => this.openEvent.next(false))
    );
  }
}

