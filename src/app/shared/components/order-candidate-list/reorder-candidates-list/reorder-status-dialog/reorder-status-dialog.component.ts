import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, merge, mergeMap, Observable, of, Subject, takeUntil, tap } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { AccordionClickArgs, AccordionComponent, ExpandEventArgs } from '@syncfusion/ej2-angular-navigations';

import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ApplicantStatus, Order, OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { AccordionOneField } from '@shared/models/accordion-one-field.model';
import { OrderManagementState } from '@agency/store/order-management.state';
import { AcceptFormComponent } from './accept-form/accept-form.component';
import {
  GetRejectReasonsForAgency,
  RejectCandidateForAgencySuccess,
  ReloadOrderCandidatesLists,
  UpdateAgencyCandidateJob,
  RejectCandidateJob as RejectAgencyCandidateJob,
} from '@agency/store/order-management.actions';
import { ApplicantStatus as ApplicantStatusEnum, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { AbstractControl, FormControl } from '@angular/forms';
import {
  OPTION_FIELDS,
  ReOrderBillRate,
  ReOrderOfferedBillRate,
} from '@shared/components/order-candidate-list/reorder-candidates-list/reorder-candidate.constants';
import {
  GetRejectReasonsForOrganisation,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  UpdateOrganisationCandidateJob,
  UpdateOrganisationCandidateJobSucceed,
} from '@client/store/order-managment-content.actions';
import { RejectReason } from '@shared/models/reject-reason.model';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

const hideAcceptActionForStatuses: CandidatStatus[] = [
  CandidatStatus.OnBoard,
  CandidatStatus.Rejected,
  CandidatStatus.BillRatePending,
];

@Component({
  selector: 'app-reorder-status-dialog',
  templateUrl: './reorder-status-dialog.component.html',
  styleUrls: ['./reorder-status-dialog.component.scss'],
})
export class ReorderStatusDialogComponent extends DestroyableDirective implements OnInit {
  @Select(OrderManagementContentState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  @Select(OrderManagementState.rejectionReasonsList)
  agencyRejectionReasonsList$: Observable<RejectReason[]>;

  @Input() openEvent: Subject<boolean>;
  @Input() candidate: OrderCandidatesList;
  @Input() isAgency: boolean = false;
  @Input() isTab: boolean = false;
  @Input() dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  @Input() set candidateJob(orderCandidateJob: OrderCandidateJob) {
    if (orderCandidateJob) {
      this.orderCandidateJob = orderCandidateJob;
      this.currentCandidateApplicantStatus = orderCandidateJob.applicantStatus.applicantStatus;
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

  get isBillRatePending(): boolean {
    return this.currentCandidateApplicantStatus === CandidatStatus.BillRatePending && !this.isAgency;
  }

  get isOfferedBillRate(): boolean {
    return this.currentCandidateApplicantStatus === CandidatStatus.OfferedBR && this.isAgency;
  }

  get showAccept(): boolean {
    return !this.isBillRatePending && !hideAcceptActionForStatuses.includes(this.currentCandidateApplicantStatus);
  }

  get hourlyRate(): AbstractControl | null {
    return this.acceptForm.get('hourlyRate');
  }

  public jobStatusControl: FormControl;
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public acceptForm = AcceptFormComponent.generateFormGroup();
  public accordionOneField: AccordionOneField;
  public accordionClickElement: HTMLElement | null;
  public orderCandidateJob: OrderCandidateJob;
  public rejectReasons: RejectReason[] = [];
  public currentCandidateApplicantStatus: number;
  public optionFields = OPTION_FIELDS;
  public jobStatus$: BehaviorSubject<Array<{ text: string; id: CandidatStatus }>> = new BehaviorSubject<
    Array<{ text: string; id: CandidatStatus }>
  >(ReOrderBillRate);
  public openRejectDialog = new Subject<boolean>();

  constructor(private store: Store, private actions$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.createJobStatusControl();
    combineLatest([
      this.onOpenEvent(),
      this.onUpdateSuccess(),
      this.subscribeOnSuccessRejection(),
      this.subscribeOnReasonsList(),
      this.subscribeOnUpdateCandidateJobSucceed(),
      this.subscribeOnHourlyRateChanges(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe();
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
        allowDeployWoCredentials: false,
        billRates: this.orderCandidateJob.billRates,
        offeredStartDate: this.orderCandidateJob.offeredStartDate,
      })
    );
  }

  public onJobStatusChange(value: { itemData: { text: string; id: number } }): void {
    if (value.itemData?.id === ApplicantStatusEnum.Rejected) {
      this.onReject();
    } else {
      this.updateOrganizationCandidateJob(value.itemData);
    }
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
    this.jobStatus$.next(ReOrderBillRate);
    this.sideDialog.hide();
    this.jobStatus$.next([]);
  }

  public onNextPreviousOrder(next: boolean): void {
    this.nextPreviousOrderEvent.emit(next);
  }

  public applyReject(event: { rejectReason: number }): void {
    if (this.orderCandidateJob) {
      const payload = {
        organizationId: this.orderCandidateJob.organizationId,
        jobId: this.orderCandidateJob.jobId,
        rejectReasonId: event.rejectReason,
      };

      this.store.dispatch(this.isAgency ? new RejectAgencyCandidateJob(payload) : new RejectCandidateJob(payload));
      this.onCloseDialog();
    }
  }

  public onReject(): void {
    this.store.dispatch(this.isAgency ? new GetRejectReasonsForAgency() : new GetRejectReasonsForOrganisation());
    this.openRejectDialog.next(true);
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
      hourlyRate: candidateBillRate,
    });
    this.enableFields();
  }

  private getNewApplicantStatus(): ApplicantStatus {
    return this.acceptForm.dirty
      ? { applicantStatus: CandidatStatus.BillRatePending, statusText: 'Bill Rate Pending' }
      : { applicantStatus: CandidatStatus.OnBoard, statusText: 'Onboard' };
  }

  private subscribeOnSuccessRejection(): Observable<void> {
    return merge(
      this.actions$.pipe(
        ofActionSuccessful(RejectCandidateForOrganisationSuccess),
        tap(() => this.store.dispatch(new ReloadOrganisationOrderCandidatesLists()))
      ),
      this.actions$.pipe(
        ofActionSuccessful(RejectCandidateForAgencySuccess),
        tap(() => this.store.dispatch(new ReloadOrderCandidatesLists()))
      )
    );
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

  private subscribeOnReasonsList(): Observable<RejectReason[]> {
    return merge(this.rejectionReasonsList$, this.agencyRejectionReasonsList$).pipe(
      tap((reasons: RejectReason[]) => (this.rejectReasons = reasons))
    );
  }

  private updateOrganizationCandidateJob(status: { id: ApplicantStatusEnum; text: string }): void {
    this.acceptForm.markAllAsTouched();
    if (this.acceptForm.valid && this.orderCandidateJob) {
      const value = this.acceptForm.getRawValue();

      this.store
        .dispatch(
          new UpdateOrganisationCandidateJob({
            organizationId: this.orderCandidateJob.organizationId,
            orderId: this.orderCandidateJob.orderId,
            jobId: value.jobId,
            skillName: value.skillName,
            offeredBillRate: value.hourlyRate,
            candidateBillRate: value.candidateBillRate,
            nextApplicantStatus: {
              applicantStatus: status.id,
              statusText: status.text,
            },
          })
        )
        .subscribe(() => this.store.dispatch(new ReloadOrganisationOrderCandidatesLists()));
    }
  }

  private subscribeOnUpdateCandidateJobSucceed(): Observable<void> {
    return this.actions$.pipe(
      ofActionSuccessful(UpdateOrganisationCandidateJobSucceed),
      tap(() => this.onCloseDialog())
    );
  }

  private createJobStatusControl(): void {
    this.jobStatusControl = new FormControl('');
  }

  private subscribeOnHourlyRateChanges(): Observable<unknown> {
    return this.hourlyRate
      ? this.hourlyRate.valueChanges.pipe(
          tap((value: number) => {
            if (this.hourlyRate?.valid) {
              this.jobStatus$.next(
                this.orderCandidateJob.candidateBillRate === value ? ReOrderBillRate : ReOrderOfferedBillRate
              );
            }
          })
        )
      : of([]);
  }

  private enableFields(): void {
    this.acceptForm.get('candidateBillRate')?.enable();
    switch (this.currentCandidateApplicantStatus) {
      case !this.isAgency && CandidatStatus.BillRatePending:
        this.acceptForm.get('hourlyRate')?.enable();
        this.acceptForm.get('candidateBillRate')?.disable();
        break;
      case CandidatStatus.OfferedBR:
      case CandidatStatus.OnBoard:
      case CandidatStatus.Rejected:
      case CandidatStatus.BillRatePending:
        this.acceptForm.disable();
        break;

      default:
        break;
    }
  }

  private onUpdateSuccess(): Observable<unknown> {
    return this.actions$.pipe(
      ofActionSuccessful(UpdateAgencyCandidateJob),
      mergeMap(() => this.store.dispatch(new ReloadOrderCandidatesLists())),
      tap(() => this.openEvent.next(false))
    );
  }
}
