import {
  GetRejectReasonsForAgency,
  RejectCandidateForAgencySuccess,
  RejectCandidateJob as RejectAgencyCandidateJob,
  ReloadOrderCandidatesLists,
  UpdateAgencyCandidateJob,
} from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import {
  CancelOrganizationCandidateJob,
  CancelOrganizationCandidateJobSuccess,
  GetRejectReasonsForOrganisation,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  UpdateOrganisationCandidateJob,
  UpdateOrganisationCandidateJobSucceed,
} from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import {
  CancellationReasonsMap,
  PenaltiesMap,
} from "@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants";
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { OrderCandidateListViewService } from '@shared/components/order-candidate-list/order-candidate-list-view.service';
import { OPTION_FIELDS } from '@shared/components/order-candidate-list/reorder-candidates-list/reorder-candidate.constants';
import { CandidateADDRESSRequired, CandidatePHONE1Required, SET_READONLY_STATUS } from '@shared/constants';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ApplicantStatus as ApplicantStatusEnum, CandidatStatus, ConfigurationValues } from '@shared/enums/applicant-status.enum';
import { MessageTypes } from '@shared/enums/message-types';
import { OrderType } from '@shared/enums/order-type';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { CandidatesStatusText } from '@shared/enums/status';
import { BillRate } from '@shared/models';
import { JobCancellation } from "@shared/models/candidate-cancellation.model";
import { ApplicantStatus, Order, OrderCandidateJob, OrderCandidatesList, } from '@shared/models/order-management.model';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { RejectReason } from '@shared/models/reject-reason.model';
import PriceUtils from '@shared/utils/price.utils';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { BehaviorSubject, combineLatest, filter, merge, mergeMap, Observable, of, Subject, takeUntil, tap, } from 'rxjs';
import { ShowToast } from 'src/app/store/app.actions';
import { GetOrderPermissions } from 'src/app/store/user.actions';
import { UserState } from 'src/app/store/user.state';
import { AcceptFormComponent } from './accept-form/accept-form.component';
import { CommonHelper } from '@shared/helpers/common.helper';
import { DateTimeHelper } from '@core/helpers';
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';
import { PermissionService } from 'src/app/security/services/permission.service';
import { SystemType } from '@shared/enums/system-type.enum';

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

  @Select(OrderManagementState.availableSteps)
  agencyApplicantStatuses$: Observable<ApplicantStatus[]>;

  @Input() openEvent: Subject<boolean>;
  @Input() candidate: OrderCandidatesList;
  @Input() isAgency = false;
  @Input() isHallmarkMspUser = false;
  @Input() isTab = false;
  @Input() dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  @Input() set candidateJob(orderCandidateJob: OrderCandidateJob) {
    if (orderCandidateJob) {
      this.orderCandidateJob = orderCandidateJob;
      this.currentCandidateApplicantStatus = orderCandidateJob.applicantStatus.applicantStatus;
      if(orderCandidateJob.candidatePhone1Required != null){
        let phone1Configuration = JSON.parse(orderCandidateJob.candidatePhone1Required);
        if(phone1Configuration.isEnabled){
          this.candidatePhone1RequiredValue = phone1Configuration.value;
        }
      }
      if(orderCandidateJob.candidateAddressRequired != null){
        let addressConfiguration = JSON.parse(orderCandidateJob.candidateAddressRequired);
        if(addressConfiguration.isEnabled){
          this.candidateAddressRequiredValue = addressConfiguration.value;
        }
      }
      this.setValueForm(orderCandidateJob);
      this.getOrderPermissions(orderCandidateJob.orderId);
    } else {
      this.acceptForm?.reset();
    }
  }
  @Input() actionsAllowed: boolean;
  @Input() isCandidatePayRateVisible: boolean;

  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Select(OrderManagementState.selectedOrder)
  public selectedOrder$: Observable<Order>;

  @Select(UserState.orderPermissions)
  public orderPermissions$: Observable<CurrentUserPermission[]>;

  get isBillRatePending(): boolean {
    return (
      [CandidatStatus.BillRatePending, CandidatStatus.OfferedBR, CandidatStatus.OnBoard, CandidatStatus.Rejected]
      .includes(this.currentCandidateApplicantStatus) && (!this.isAgency || 
        (this.isHallmarkMspUser && this.currentCandidateApplicantStatus === CandidatStatus.Rejected)));
  }

  get isOfferedBillRate(): boolean {
    return this.currentCandidateApplicantStatus === CandidatStatus.OfferedBR && this.isAgency;
  }

  get showAccept(): boolean {
    return (
      this.isAgency &&
      ![CandidatStatus.BillRatePending, CandidatStatus.OnBoard, CandidatStatus.Rejected, CandidatStatus.Offboard,
        CandidatStatus.Cancelled].includes(
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
      this.isCancelled ||
      !this.orderCandidateJob?.applicantStatus ||
      (this.orderCandidateJob?.applicantStatus.applicantStatus === CandidatesStatusText.Offered &&
        this.orderCandidateJob?.order.orderType === OrderType.ReOrder)
    );
  }

  get isRejectCandidate(): boolean {
    return this.currentCandidateApplicantStatus === ApplicantStatusEnum.Rejected;
  }

  get isCancelled(): boolean {
    return this.currentCandidateApplicantStatus === CandidatStatus.Cancelled;
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
  public openCandidateCancellationDialog = new Subject<void>();
  public isActiveCandidateDialog$: Observable<boolean>;
  public canShortlist = false;
  public canInterview = false;
  public canReject = false;
  public canOffer = false;
  public canOnboard = false;
  public canClose = false;
  public orderPermissions: CurrentUserPermission[];
  public comments: Comment[] = [];
  public canCreateOrder:boolean;
  private defaultApplicantStatuses: ApplicantStatus[];
  public candidatePhone1RequiredValue = '';
  public candidateAddressRequiredValue = '';

  constructor(
    private store: Store,
    private actions$: Actions,
    private orderCandidateListViewService: OrderCandidateListViewService,
    private cdr: ChangeDetectorRef,
    private commentsService: CommentsService,
    private permissionService : PermissionService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnPermissions();
    this.isActiveCandidateDialog$ = this.orderCandidateListViewService.getIsCandidateOpened();
    this.createJobStatusControl();
    this.subscribeForOrderPermissions();
    this.subscribeForJobStatus();

    combineLatest([
      this.onOpenEvent(),
      this.onUpdateSuccess(),
      this.subscribeOnSuccessRejection(),
      this.subscribeOnReasonsList(),
      this.subscribeOnUpdateCandidateJobSucceed(),
      this.subscribeOnCancelOrganizationCandidateJobSuccess(),
      this.subscribeOnHourlyRateChanges(),
      this.subscribeOnApplicantStatusesChanges(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  public savePosition(): void {
    const statusId = this.jobStatusControl.value;
    const statuses = this.jobStatus$.getValue();
    const status = statuses.find((stat) => stat.applicantStatus === statusId);

    if (statusId && status) {
      this.handleOnboardedCandidate(status);
    }
  }

  public onAccept(): void {
    if(this.acceptForm.invalid) {
      this.acceptForm.markAllAsTouched();
      return;
    }

    if(this.candidatePhone1RequiredValue === ConfigurationValues.Accept){
      if(this.orderCandidateJob?.candidateProfileContactDetails != null){
        if(this.orderCandidateJob?.candidateProfileContactDetails.phone1 === null
            || this.orderCandidateJob?.candidateProfileContactDetails.phone1 === ''){
              this.store.dispatch(new ShowToast(MessageTypes.Error, CandidatePHONE1Required(ConfigurationValues.Accept)));
              return;
        }
      }else{
          this.store.dispatch(new ShowToast(MessageTypes.Error, CandidatePHONE1Required(ConfigurationValues.Accept)));
          return;
        }
    }

    if(this.candidateAddressRequiredValue === ConfigurationValues.Accept){
      if(this.orderCandidateJob?.candidateProfileContactDetails != null){
          if(CommonHelper.candidateAddressCheck(this.orderCandidateJob?.candidateProfileContactDetails)){
              this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateADDRESSRequired(ConfigurationValues.Accept)));
              return;
          }
      }else{
        this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateADDRESSRequired(ConfigurationValues.Accept)));
        return;
      }
    }

    this.updateAgencyCandidateJob();
  }

  public onJobStatusChange(event: {
    itemData: { applicantStatus: ApplicantStatusEnum; statusText: string; isEnabled: boolean };
  }): void {
    if (event.itemData) {
      event.itemData?.isEnabled
        ? this.handleOnboardedCandidate(event.itemData)
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

  private getComments(): void {
    this.commentsService
      .getComments(this.orderCandidateJob?.commentContainerId as number, null).pipe(
        takeUntil(this.destroy$)
      ).subscribe((comments : Comment[]) => {
        this.comments = comments;
        this.cdr.detectChanges();
      });
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

  public cancelCandidate(jobCancellationDto: JobCancellation): void {
    if (this.orderCandidateJob) {
      this.store.dispatch(new CancelOrganizationCandidateJob({
        organizationId: this.orderCandidateJob.organizationId,
        jobId: this.orderCandidateJob.jobId,
        jobCancellationDto,
        candidatePayRate: this.orderCandidateJob.candidatePayRate,
      }));
      this.onCloseDialog();
    }
  }

  public resetStatusesFormControl(): void {
    this.jobStatusControl.reset();
  }

  public onReject(): void {
    this.store.dispatch(this.isAgency ? new GetRejectReasonsForAgency() : new GetRejectReasonsForOrganisation(SystemType.VMS));
    this.openRejectDialog.next(true);
  }

  public updateOrganizationCandidateJobWithBillRate(bill: BillRate): void {
    this.acceptForm.markAllAsTouched();
    if (!this.acceptForm.errors && this.orderCandidateJob) {
      const value = this.acceptForm.getRawValue();
      const rates = this.getBillRateForUpdate(bill);

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
            billRates: rates,
            billRatesUpdated: this.checkForBillRateUpdate(rates),
            candidatePayRate: this.orderCandidateJob.candidatePayRate,
          })
        ).pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.deleteUpdateFieldInRate();
          this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
        });
    }
  }

  public getBillRateForUpdate(value: BillRate): BillRate[] {
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

  private setValueForm({
    order: { hourlyRate, locationName, departmentName, skillName, shiftStartTime, shiftEndTime, openPositions },
    candidateBillRate,
    offeredBillRate,
    rejectReason,
    reOrderDate,
    organizationPrefix,
    jobCancellation,
    orderPublicId,
    candidatePayRate,
    clockId,
    initialBillRate,
  }: OrderCandidateJob) {
    this.getComments();
    const candidateBillRateValue = candidateBillRate ?? initialBillRate;
    let isBillRatePending: number;

    if (this.orderCandidateJob.applicantStatus.applicantStatus === CandidatStatus.BillRatePending) {
      isBillRatePending = candidateBillRate;
    } else if (this.orderCandidateJob.applicantStatus.applicantStatus === CandidatStatus.Offered) {
      isBillRatePending = candidateBillRateValue;
    } else {
      isBillRatePending = offeredBillRate;
    }
    this.acceptForm.reset();
    this.acceptForm.patchValue({
      reOrderFromId: `${organizationPrefix}-${orderPublicId}`,
      offeredBillRate: PriceUtils.formatNumbers(initialBillRate),
      candidateBillRate: PriceUtils.formatNumbers(candidateBillRateValue),
      locationName,
      departmentName,
      skillName,
      orderOpenDate: DateTimeHelper.setCurrentTimeZone(reOrderDate as string),
      shiftStartTime: shiftStartTime ? DateTimeHelper.setCurrentTimeZone(shiftStartTime.toString()) : '',
      shiftEndTime: shiftEndTime ? DateTimeHelper.setCurrentTimeZone(shiftEndTime.toString()) : '',
      openPositions,
      hourlyRate: PriceUtils.formatNumbers(isBillRatePending),
      rejectReason,
      jobCancellationReason: CancellationReasonsMap[jobCancellation?.jobCancellationReason || 0],
      penaltyCriteria: PenaltiesMap[jobCancellation?.penaltyCriteria || 0],
      rate: jobCancellation?.rate,
      hours: jobCancellation?.hours,
      candidatePayRate: candidatePayRate,
      clockId: clockId,
    });
    this.enableFields();
  }

  private getNewApplicantStatus(): ApplicantStatus {
    return this.acceptForm.get('candidateBillRate')?.dirty
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
      tap((reasons: RejectReason[]) => {
        this.rejectReasons = reasons;
        this.cdr.markForCheck();
      })
    );
  }

  private handleOnboardedCandidate(status: ApplicantStatus): void {
    if (status.applicantStatus === ApplicantStatusEnum.Rejected) {
      this.onReject();
    } else if (status.applicantStatus === ApplicantStatusEnum.Cancelled) {
      this.openCandidateCancellationDialog.next();
    } else {
      this.updateCandidateJob(status);
    }
  }

  private updateOrganisationCandidateJob(isCandidateRevert: boolean, status: ApplicantStatus): void {
    const value = this.acceptForm.getRawValue();
    const actualDates = this.setCorrectActualDates(
      this.orderCandidateJob.reOrderDate as string,
      value.shiftStartTime,
      value.shiftEndTime);
    this.store
    .dispatch(
      new UpdateOrganisationCandidateJob({
        organizationId: this.orderCandidateJob.organizationId,
        orderId: this.orderCandidateJob.orderId,
        jobId: this.orderCandidateJob.jobId,
        skillName: value.skillName,
        offeredBillRate: isCandidateRevert ? this.orderCandidateJob?.candidateBillRate : value.hourlyRate,
        candidateBillRate: value.candidateBillRate,
        billRates: this.orderCandidateJob.billRates,
        ...actualDates,
        candidatePayRate: value.candidatePayRate,
        nextApplicantStatus: {
          applicantStatus: status.applicantStatus,
          statusText: status.statusText,
        },
      })
    ).pipe(takeUntil(this.destroy$))
    .subscribe(() => this.store.dispatch(new ReloadOrganisationOrderCandidatesLists()));
  }

  private updateCandidateJob(status: ApplicantStatus): void {
    this.acceptForm.markAllAsTouched();
    /**
     * Due to the fact that rejected candidate disabled form has fields valid, invalid set to false by angular,
     * we need additional variable to check if it's for candidate revert.
     */
    const isCandidateRevert = this.orderCandidateJob.applicantStatus.applicantStatus === ApplicantStatusEnum.Rejected;

    if ((this.acceptForm.valid || isCandidateRevert) && this.orderCandidateJob && status) {
      if (this.isAgency) {
        this.updateAgencyCandidateJob();
      } else {
        this.updateOrganisationCandidateJob(isCandidateRevert, status);
      }
    }
  }

  private updateAgencyCandidateJob(): void {
    const value = this.acceptForm.getRawValue();
    const applicantStatus: ApplicantStatus = this.getNewApplicantStatus();

    let actualDate;

    if (this.orderCandidateJob.order.orderType !== OrderType.ReOrder
      && applicantStatus.applicantStatus === CandidatStatus.OnBoard) {
        actualDate = {
          actualStartDate: this.orderCandidateJob.reOrderDate,
          actualEndDate: this.orderCandidateJob.reOrderDate,
        };
    } else if (this.orderCandidateJob.order.orderType !== OrderType.ReOrder) {
      actualDate = {
          actualStartDate: this.orderCandidateJob.actualStartDate,
          actualEndDate: this.orderCandidateJob.actualEndDate,
      };
    } else {
      actualDate = this.setCorrectActualDates(
        this.orderCandidateJob.reOrderDate as string,
        value.shiftStartTime,
        value.shiftEndTime);
    }

    this.store.dispatch(
      new UpdateAgencyCandidateJob({
        organizationId: this.orderCandidateJob.organizationId,
        jobId: this.orderCandidateJob.jobId,
        orderId: this.orderCandidateJob.orderId,
        nextApplicantStatus: applicantStatus,
        candidateBillRate: value.candidateBillRate,
        offeredBillRate: value.hourlyRate ? value.hourlyRate : null,
        requestComment: value.comments,
        ...actualDate,
        clockId: this.orderCandidateJob.clockId,
        guaranteedWorkWeek: this.orderCandidateJob.guaranteedWorkWeek,
        allowDeployWoCredentials: false,
        billRates: this.orderCandidateJob.billRates,
        offeredStartDate: this.orderCandidateJob.offeredStartDate,
        candidatePayRate: value.candidatePayRate,
      })
    );
  }

  private subscribeOnUpdateCandidateJobSucceed(): Observable<void> {
    return this.actions$.pipe(
      ofActionSuccessful(UpdateOrganisationCandidateJobSucceed),
      tap(() => this.onCloseDialog())
    );
  }

  private subscribeOnApplicantStatusesChanges(): Observable<ApplicantStatus[]> {
    return (this.isAgency ? this.agencyApplicantStatuses$ : this.applicantStatuses$).pipe(
      filter((statuses: ApplicantStatus[]) => !!statuses),
      tap((statuses: ApplicantStatus[]) => {
        this.defaultApplicantStatuses = this.candidate?.status !== CandidatStatus.OnBoard ?
          statuses : statuses.filter(status => status.applicantStatus !== CandidatStatus.OnBoard);

        if (this.orderCandidateJob?.applicantStatus.applicantStatus === ApplicantStatusEnum.Rejected) {
          this.jobStatus$.next(statuses);
        } else {
          this.jobStatus$.next(this.excludeSelectedStatus(CandidatStatus.OfferedBR));
        }
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
    if (!this.isCancelled) {
      this.acceptForm.get('candidateBillRate')?.enable();
    }

    if(this.isCandidatePayRateVisible && this.currentCandidateApplicantStatus === CandidatStatus.Offered) {
      this.acceptForm.get('candidatePayRate')?.enable();
    }

    switch (this.currentCandidateApplicantStatus) {
      case !this.isAgency && CandidatStatus.BillRatePending:
        this.canReject && this.canOffer && this.canOnboard && this.acceptForm.get('hourlyRate')?.enable();
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

    const statusesToDisableRate = [CandidatStatus.OnBoard, CandidatStatus.Offboard, CandidatStatus.Cancelled,
      CandidatStatus.Rejected];

    if (statusesToDisableRate.includes(this.currentCandidateApplicantStatus)) {
      this.acceptForm.get('hourlyRate')?.disable();
    }

  }

  private onUpdateSuccess(): Observable<unknown> {
    return this.actions$.pipe(
      ofActionSuccessful(UpdateAgencyCandidateJob),
      mergeMap(() => this.store.dispatch(new ReloadOrderCandidatesLists())),
      tap(() => this.openEvent.next(false))
    );
  }

  private subscribeOnCancelOrganizationCandidateJobSuccess(): Observable<void> {
    return this.actions$.pipe(
      ofActionSuccessful(CancelOrganizationCandidateJobSuccess),
      tap(() => this.store.dispatch(new ReloadOrganisationOrderCandidatesLists()))
    );
  }

  private subscribeForJobStatus(): void {
    this.jobStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (!data?.length) {
          this.jobStatusControl.disable();
        } else {
          this.jobStatusControl.enable();
        }
      });
  }

  private subscribeForOrderPermissions(): void {
    this.orderPermissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: CurrentUserPermission[]) => (this.orderPermissions = data) && this.mapPermissions());
  }

  private getOrderPermissions(orderId: number): void {
    this.store.dispatch(new GetOrderPermissions(orderId));
  }

  private mapPermissions(): void {
    this.canShortlist = false;
    this.canInterview = false;
    this.canReject = false;
    this.canOffer = false;
    this.canOnboard = false;
    this.canClose = false;
    this.orderPermissions.forEach(permission => {
      this.canShortlist = this.canShortlist || permission.permissionId === PermissionTypes.CanShortlistCandidate;
      this.canInterview = this.canInterview || permission.permissionId === PermissionTypes.CanInterviewCandidate;
      this.canReject = this.canReject || permission.permissionId === PermissionTypes.CanRejectCandidate;
      this.canOffer = this.canOffer || permission.permissionId === PermissionTypes.CanOfferCandidate;
      this.canOnboard = this.canOnboard || permission.permissionId === PermissionTypes.CanOnBoardCandidate;
      this.canClose = this.canClose || permission.permissionId === PermissionTypes.CanCloseCandidate;
    });
    this.disableControlsBasedOnPermissions();
  }

  private disableControlsBasedOnPermissions(): void {
    const statusesToDisableRate = [CandidatStatus.OnBoard, CandidatStatus.Offboard, CandidatStatus.Cancelled,
      CandidatStatus.Rejected];

    if (!this.canReject && !this.canOffer && !this.canOnboard) {
      this.hourlyRate?.disable();
    } else if (!statusesToDisableRate.includes(this.currentCandidateApplicantStatus)) {
      this.hourlyRate?.enable();
    }
  }

  private setCorrectActualDates(initDate: string, shiftStartTime: Date, shiftEndTime: Date) {
    if (shiftStartTime > shiftEndTime) {
      const formatedInitDate = DateTimeHelper.setUtcTimeZone(initDate);
      const endDate = new Date(new Date(new Date(formatedInitDate).setDate(new Date(formatedInitDate)
      .getDate() + 1)).setHours(0, 0, 0));

      return {
        actualStartDate: DateTimeHelper.setUtcTimeZone(initDate),
        actualEndDate: DateTimeHelper.setUtcTimeZone(endDate),
      };
    }

    return {
      actualStartDate: DateTimeHelper.setUtcTimeZone(initDate),
      actualEndDate: DateTimeHelper.setUtcTimeZone(initDate),
    };
  }

  private deleteUpdateFieldInRate(): void {
    this.candidateJob?.billRates.filter((rate) => Object.prototype.hasOwnProperty.call(rate, 'isUpdated'))
    .forEach((rate) => {
      delete rate.isUpdated;
    });
  }

  private checkForBillRateUpdate(rates: BillRate[]): boolean {
    return rates.some((rate) => !!rate.isUpdated);
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().subscribe(({ canCreateOrder}) => {
      this.canCreateOrder = canCreateOrder;
    });
  }
}
