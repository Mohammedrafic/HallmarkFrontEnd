import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, merge, mergeMap, Observable, of, Subject, takeUntil, tap } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ApplicantStatus, Order, OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { OrderManagementState } from '@agency/store/order-management.state';
import { AcceptFormComponent } from './accept-form/accept-form.component';
import {
  GetRejectReasonsForAgency,
  RejectCandidateForAgencySuccess,
  RejectCandidateJob as RejectAgencyCandidateJob,
  ReloadOrderCandidatesLists,
  UpdateAgencyCandidateJob,
} from '@agency/store/order-management.actions';
import { ApplicantStatus as ApplicantStatusEnum, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { AbstractControl, FormControl } from '@angular/forms';
import { OPTION_FIELDS } from '@shared/components/order-candidate-list/reorder-candidates-list/reorder-candidate.constants';
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
import PriceUtils from '@shared/utils/price.utils';
import { ShowToast } from '../../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { SET_READONLY_STATUS } from '@shared/constants';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import { BillRate } from '@shared/models';
import { OrderCandidateListViewService } from '@shared/components/order-candidate-list/order-candidate-list-view.service';
import { CandidatesStatusText } from '@shared/enums/status';
import { OrderType } from '@shared/enums/order-type';

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

  @Select(OrderManagementContentState.applicantStatuses)
  applicantStatuses$: Observable<ApplicantStatus[]>;

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
    return (
      [CandidatStatus.BillRatePending, CandidatStatus.OfferedBR].includes(this.currentCandidateApplicantStatus) &&
      !this.isAgency
    );
  }

  get isOfferedBillRate(): boolean {
    return this.currentCandidateApplicantStatus === CandidatStatus.OfferedBR && this.isAgency;
  }

  get showAccept(): boolean {
    return (
      this.isAgency &&
      ![CandidatStatus.BillRatePending, CandidatStatus.OnBoard, CandidatStatus.Rejected].includes(
        this.currentCandidateApplicantStatus
      )
    );
  }

  get hourlyRate(): AbstractControl | null {
    return this.acceptForm.get('hourlyRate');
  }

  get billRatesViewMode(): boolean {
    return (
      this.isAgency ||
      !this.orderCandidateJob?.applicantStatus ||
      (this.orderCandidateJob?.applicantStatus.applicantStatus === CandidatesStatusText.Offered &&
        this.orderCandidateJob?.order.orderType === OrderType.ReOrder)
    );
  }

  get isRejectCandidate(): boolean {
    return this.currentCandidateApplicantStatus === ApplicantStatusEnum.Rejected;
  }

  public jobStatusControl: FormControl;
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public acceptForm = AcceptFormComponent.generateFormGroup();
  public orderCandidateJob: OrderCandidateJob;
  public rejectReasons: RejectReason[] = [];
  public currentCandidateApplicantStatus: number;
  public optionFields = OPTION_FIELDS;
  public jobStatus$: BehaviorSubject<ApplicantStatus[]> = new BehaviorSubject<ApplicantStatus[]>([]);
  public openRejectDialog = new Subject<boolean>();
  public isActiveCandidateDialog$: Observable<boolean>;

  private defaultApplicantStatuses: ApplicantStatus[];

  constructor(
    private store: Store,
    private actions$: Actions,
    private orderCandidateListViewService: OrderCandidateListViewService
  ) {
    super();
  }

  ngOnInit(): void {
    this.isActiveCandidateDialog$ = this.orderCandidateListViewService.getIsCandidateOpened();
    this.createJobStatusControl();
    combineLatest([
      this.onOpenEvent(),
      this.onUpdateSuccess(),
      this.subscribeOnSuccessRejection(),
      this.subscribeOnReasonsList(),
      this.subscribeOnUpdateCandidateJobSucceed(),
      this.subscribeOnHourlyRateChanges(),
      this.subscribeOnApplicantStatusesChanges(),
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
        offeredBillRate: value.hourlyRate ? value.hourlyRate : null,
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

  public onJobStatusChange(event: {
    itemData: { applicantStatus: ApplicantStatusEnum; statusText: string; isEnabled: boolean };
  }): void {
    if (!!event.itemData) {
      event.itemData?.isEnabled
        ? this.handleOnboardedCandidate(event)
        : this.store.dispatch(new ShowToast(MessageTypes.Error, SET_READONLY_STATUS));
    }
  }

  public onCloseDialog(): void {
    this.openEvent.next(false);
    this.jobStatus$.next([]);
    this.sideDialog.hide();
    this.jobStatus$.next([]);
    this.orderCandidateListViewService.setIsCandidateOpened(false);
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
    order: {
      reOrderFromId,
      hourlyRate,
      locationName,
      departmentName,
      skillName,
      shiftStartTime,
      shiftEndTime,
      openPositions,
    },
    candidateBillRate,
    offeredBillRate,
    orderId,
    positionId,
    rejectReason,
    reOrderDate,
  }: OrderCandidateJob) {
    const candidateBillRateValue = candidateBillRate ?? hourlyRate;
    let isBillRatePending: number;

    if (this.orderCandidateJob.applicantStatus.applicantStatus === CandidatStatus.BillRatePending) {
      isBillRatePending = candidateBillRate;
    } else if (this.orderCandidateJob.applicantStatus.applicantStatus === CandidatStatus.Offered) {
      isBillRatePending = candidateBillRateValue;
    } else {
      isBillRatePending = offeredBillRate;
    }

    this.acceptForm.patchValue({
      reOrderFromId: `${reOrderFromId}-${orderId}-${positionId}`,
      offeredBillRate: PriceUtils.formatNumbers(hourlyRate),
      candidateBillRate: PriceUtils.formatNumbers(candidateBillRateValue),
      locationName,
      departmentName,
      skillName,
      orderOpenDate: reOrderDate,
      shiftStartTime,
      shiftEndTime,
      openPositions,
      hourlyRate: PriceUtils.formatNumbers(isBillRatePending),
      rejectReason,
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

  private handleOnboardedCandidate(event: {
    itemData: { applicantStatus: ApplicantStatusEnum; statusText: string };
  }): void {
    if (event.itemData?.applicantStatus === ApplicantStatusEnum.Rejected) {
      this.onReject();
    } else {
      this.updateOrganizationCandidateJob(event.itemData);
    }
  }

  private updateOrganizationCandidateJob(status: { applicantStatus: ApplicantStatusEnum; statusText: string }): void {
    this.acceptForm.markAllAsTouched();
    if (this.acceptForm.valid && this.orderCandidateJob && status) {
      const value = this.acceptForm.getRawValue();
      this.store
        .dispatch(
          new UpdateOrganisationCandidateJob({
            organizationId: this.orderCandidateJob.organizationId,
            orderId: this.orderCandidateJob.orderId,
            jobId: this.orderCandidateJob.jobId,
            skillName: value.skillName,
            offeredBillRate: value.hourlyRate,
            candidateBillRate: value.candidateBillRate,
            nextApplicantStatus: {
              applicantStatus: status.applicantStatus,
              statusText: status.statusText,
            },
          })
        )
        .subscribe(() => this.store.dispatch(new ReloadOrganisationOrderCandidatesLists()));
    }
  }

  updateOrganizationCandidateJobWithBillRate(bill: BillRate): void {
    this.acceptForm.markAllAsTouched();
    if (!this.acceptForm.errors && this.orderCandidateJob) {
      const value = this.acceptForm.getRawValue();
      this.store
        .dispatch(
          new UpdateOrganisationCandidateJob({
            organizationId: this.orderCandidateJob.organizationId,
            orderId: this.orderCandidateJob.orderId,
            jobId: this.orderCandidateJob.jobId,
            skillName: value.skillName,
            offeredBillRate: this.orderCandidateJob?.offeredBillRate,
            candidateBillRate: this.orderCandidateJob.candidateBillRate,
            nextApplicantStatus: {
              applicantStatus: this.orderCandidateJob.applicantStatus.applicantStatus,
              statusText: this.orderCandidateJob.applicantStatus.statusText,
            },
            billRates: this.getBillRateForUpdate(bill),
          })
        )
        .subscribe(() => this.store.dispatch(new ReloadOrganisationOrderCandidatesLists()));
    }
  }

  getBillRateForUpdate(value: BillRate): BillRate[] {
    let billRates;
    const existingBillRateIndex = this.orderCandidateJob.billRates.findIndex((billRate) => billRate.id === value.id);
    if (existingBillRateIndex > -1) {
      this.orderCandidateJob.billRates.splice(existingBillRateIndex, 1, value);
      billRates = this.orderCandidateJob?.billRates;
    } else {
      if (typeof value === 'number') {
        this.orderCandidateJob?.billRates.splice(value, 1);
        billRates = this.orderCandidateJob?.billRates;
      } else {
        billRates = [...(this.orderCandidateJob?.billRates as BillRate[]), value];
      }
    }

    return billRates;
  }

  private subscribeOnUpdateCandidateJobSucceed(): Observable<void> {
    return this.actions$.pipe(
      ofActionSuccessful(UpdateOrganisationCandidateJobSucceed),
      tap(() => this.onCloseDialog())
    );
  }

  private subscribeOnApplicantStatusesChanges(): Observable<ApplicantStatus[]> {
    return this.applicantStatuses$.pipe(
      filter((statuses: ApplicantStatus[]) => !!statuses),
      tap((statuses: ApplicantStatus[]) => {
        this.defaultApplicantStatuses = statuses;
        this.jobStatus$.next(this.excludeSelectedStatus(CandidatStatus.OfferedBR));
      })
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
              const isOfferedBR =
                this.orderCandidateJob.candidateBillRate === +value ? CandidatStatus.OfferedBR : CandidatStatus.OnBoard;
              this.jobStatus$.next(this.excludeSelectedStatus(isOfferedBR));
            } else {
              this.jobStatus$.next(this.excludeSelectedStatus(CandidatStatus.OfferedBR));
            }
          })
        )
      : of([]);
  }

  private excludeSelectedStatus(selectedStatus: number): ApplicantStatus[] {
    return this.defaultApplicantStatuses?.filter(
      (status: ApplicantStatus) => status.applicantStatus !== selectedStatus
    );
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
      case !this.isAgency && CandidatStatus.Offered:
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
