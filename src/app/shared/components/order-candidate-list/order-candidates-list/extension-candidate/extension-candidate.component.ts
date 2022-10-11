import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { RejectReason } from '@shared/models/reject-reason.model';
import { ChangedEventArgs, MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { EMPTY, map, merge, mergeMap, Observable, Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { OrderManagementState } from '@agency/store/order-management.state';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import {
  CancellationReasonsMap,
  PenaltiesMap,
} from '@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants';
import { PenaltyCriteria } from '@shared/enums/candidate-cancellation';
import {
  ApplicantStatus,
  Order,
  OrderCandidateJob,
  OrderCandidatesList,
  OrderCandidatesListPage,
} from '@shared/models/order-management.model';
import { BillRate } from '@shared/models/bill-rate.model';
import {
  GetCandidateJob,
  GetRejectReasonsForAgency,
  RejectCandidateForAgencySuccess,
  RejectCandidateJob as RejectCandidateJobAgency,
  ReloadOrderCandidatesLists,
  UpdateAgencyCandidateJob,
} from '@agency/store/order-management.actions';
import { DatePipe } from '@angular/common';
import { ApplicantStatus as ApplicantStatusEnum, CandidatStatus } from '@shared/enums/applicant-status.enum';
import PriceUtils from '@shared/utils/price.utils';
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';
import { WorkflowStepType } from '@shared/enums/workflow-step-type';
import { Router } from '@angular/router';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import {
  CancelOrganizationCandidateJob,
  CancelOrganizationCandidateJobSuccess,
  GetRejectReasonsForOrganisation,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  UpdateOrganisationCandidateJob,
} from '@client/store/order-managment-content.actions';
import { JobCancellation } from '@shared/models/candidate-cancellation.model';
import { capitalize } from 'lodash';
import { DurationService } from '@shared/services/duration.service';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { toCorrectTimezoneFormat } from '@shared/utils/date-time.utils';
import { UNSAVED_FORM_PROVIDERS, UnsavedFormComponentRef } from '@shared/directives/unsaved-form.directive';
import { UserState } from 'src/app/store/user.state';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { GetOrderPermissions } from 'src/app/store/user.actions';

interface IExtensionCandidate extends Pick<UnsavedFormComponentRef, 'form'> {}

@Component({
  selector: 'app-extension-candidate',
  templateUrl: './extension-candidate.component.html',
  styleUrls: ['../accept-candidate/accept-candidate.component.scss', './extension-candidate.component.scss'],
  providers: [MaskedDateTimeService, UNSAVED_FORM_PROVIDERS(ExtensionCandidateComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtensionCandidateComponent extends DestroyableDirective implements OnInit, IExtensionCandidate {
  @Input() currentOrder: Order;
  @Input() candidateOrder: OrderCandidatesListPage;
  @Input() dialogEvent: Subject<boolean>;
  @Input() isTab: boolean = false;
  @Input() actionsAllowed: boolean = true;

  candidate$: Observable<OrderCandidatesList>;

  @Select(OrderManagementState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementContentState.orderCandidatePage)
  public clientOrderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  @Select(UserState.orderPermissions)
  orderPermissions$: Observable<CurrentUserPermission[]>;

  public rejectReasons$: Observable<RejectReason[]>;
  public form: FormGroup;
  public statusesFormControl = new FormControl();
  public candidateJob: OrderCandidateJob;
  public candidatStatus = CandidatStatus;
  public workflowStepType = WorkflowStepType;
  public billRatesData: BillRate[] = [];
  public isReadOnly = false;
  public openRejectDialog = new Subject<boolean>();
  public openCandidateCancellationDialog = new Subject<void>();
  public priceUtils = PriceUtils;
  public optionFields = { text: 'statusText', value: 'applicantStatus', htmlAttributes: 'disabled' };
  public applicantStatuses: ApplicantStatus[] = [
    { applicantStatus: ApplicantStatusEnum.Rejected, statusText: 'Reject' },
  ];
  public isAgency: boolean = false;
  public showHoursControl: boolean = false;
  public showPercentage: boolean = false;
  public candidate: OrderCandidatesList | undefined;
  public comments: Comment[] = [];
  public orderPermissions: CurrentUserPermission[];
  public canShortlist = false;
  public canInterview = false;
  public canReject = false;
  public canOffer = false;
  public canOnboard = false;
  public canClose = false;
  public canCreateOrder = false;

  public applicantStatusEnum = ApplicantStatusEnum;

  get isAccepted(): boolean {
    return this.candidateJob?.applicantStatus?.applicantStatus === this.candidatStatus.Accepted;
  }

  get isRejected(): boolean {
    return this.candidateJob?.applicantStatus?.applicantStatus === this.candidatStatus.Rejected;
  }

  get isOnBoard(): boolean {
    return this.candidateJob?.applicantStatus?.applicantStatus === this.candidatStatus.OnBoard;
  }

  get isCancelled(): boolean {
    return this.candidateJob?.applicantStatus?.applicantStatus === this.candidatStatus.Cancelled;
  }

  get canAccept(): boolean {
    return this.candidateJob && this.isAgency && !this.isOnBoard;
  }

  get actualStartDateValue(): Date {
    return this.form.get('startDate')?.value;
  }

  get isReadOnlyBillRates(): boolean {
    return !this.canShortlist && !this.canInterview && !this.canReject && !this.canOffer && !this.canOnboard;
  }

  constructor(
    private store: Store,
    private action$: Actions,
    private datePipe: DatePipe,
    private commentsService: CommentsService,
    private router: Router,
    private orderManagementContentService: OrderManagementContentService,
    private durationService: DurationService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
    this.isAgency = this.router.url.includes('agency');
  }

  ngOnInit(): void {
    this.subsToCandidate();
    this.rejectReasons$ = this.subscribeOnReasonsList();
    this.createForm();
    this.onRejectSuccess();
    this.subscribeOnCancelOrganizationCandidateJobSuccess();
  }

  public updateOrganizationCandidateJobWithBillRate(bill: BillRate): void {
    this.form.markAllAsTouched();
    if (!this.form.errors && this.candidateJob) {
      const value = this.form.getRawValue();
      let additionalValues = {};
      if (this.isOnBoard) {
        additionalValues = {
          actualStartDate: toCorrectTimezoneFormat(this.candidateJob.actualStartDate),
          actualEndDate: toCorrectTimezoneFormat(this.candidateJob.actualEndDate),
          guaranteedWorkWeek: this.candidateJob.guaranteedWorkWeek,
          clockId: this.candidateJob.clockId,
        };
      }
      const valueForUpdate = {
        ...additionalValues,
        organizationId: this.candidateJob.organizationId,
        orderId: this.candidateJob.orderId,
        jobId: this.candidateJob.jobId,
        skillName: value.skillName,
        offeredBillRate: this.candidateJob?.offeredBillRate,
        offeredStartDate: toCorrectTimezoneFormat(this.candidateJob?.offeredStartDate),
        candidateBillRate: this.candidateJob.candidateBillRate,
        nextApplicantStatus: {
          applicantStatus: this.candidateJob.applicantStatus.applicantStatus,
          statusText: this.candidateJob.applicantStatus.statusText,
        },
        billRates: this.getBillRateForUpdate(bill),
      };

      this.store.dispatch(new UpdateOrganisationCandidateJob(valueForUpdate));
    }
  }

  private getBillRateForUpdate(value: BillRate): BillRate[] {
    let billRates;
    const existingBillRateIndex = this.candidateJob.billRates.findIndex((billRate) => billRate.id === value.id);
    if (existingBillRateIndex > -1) {
      this.candidateJob.billRates.splice(existingBillRateIndex, 1, value);
      billRates = this.candidateJob?.billRates;
    } else {
      if (typeof value === 'number') {
        this.candidateJob?.billRates.splice(value, 1);
        billRates = this.candidateJob?.billRates;
      } else {
        billRates = [...(this.candidateJob?.billRates as BillRate[]), value];
      }
    }

    return billRates;
  }

  public updatedUnsavedOnboarded(): void {
    if (this.isOnBoard) {
      this.updateAgencyCandidateJob(this.candidateJob.applicantStatus);
    }
  }

  public onReject(): void {
    this.store.dispatch(this.isAgency ? new GetRejectReasonsForAgency() : new GetRejectReasonsForOrganisation());
    this.openRejectDialog.next(true);
  }

  public rejectCandidateJob(event: { rejectReason: number }): void {
    if (this.candidateJob) {
      const payload = {
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        rejectReasonId: event.rejectReason,
      };

      this.store.dispatch(this.isAgency ? [new RejectCandidateJobAgency(payload)] : [new RejectCandidateJob(payload)]);
      this.dialogEvent.next(false);
    }
  }

  public cancelCandidate(jobCancellationDto: JobCancellation): void {
    if (this.candidateJob) {
      this.store.dispatch(
        new CancelOrganizationCandidateJob({
          organizationId: this.candidateJob.organizationId,
          jobId: this.candidateJob.jobId,
          jobCancellationDto,
        })
      );
      this.dialogEvent.next(false);
    }
  }

  public resetStatusesFormControl(): void {
    this.statusesFormControl.reset();
  }

  public onAccept(): void {
    this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Accepted, statusText: 'Accepted' });
  }

  public onDropDownChanged(event: { itemData: ApplicantStatus }): void {
    switch (event.itemData.applicantStatus) {
      case ApplicantStatusEnum.Accepted:
        this.onAccept();
        break;
      case ApplicantStatusEnum.Rejected:
        this.onReject();
        break;
      case ApplicantStatusEnum.Cancelled:
        this.openCandidateCancellationDialog.next();
        break;
      case ApplicantStatusEnum.OnBoarded:
        this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.OnBoarded, statusText: 'Onboard' });
        break;

      default:
        if (this.form.dirty) {
          this.updateAgencyCandidateJob({
            applicantStatus: this.candidateJob.applicantStatus.applicantStatus,
            statusText: this.candidateJob.applicantStatus.statusText,
          });
        }
        break;
    }
  }

  public onStartDateChange(event: ChangedEventArgs): void {
    const actualStartDate = new Date(event.value!);
    const actualEndDate = this.durationService.getEndDate(this.currentOrder.duration, actualStartDate);
    this.form.patchValue({
      actualEndDate,
    });
  }

  private setAllowedStatuses(candidate: OrderCandidatesList): void {
    const statuses = [];

    if (candidate.status === ApplicantStatusEnum.Accepted) {
      this.canOnboard && statuses.push({ applicantStatus: ApplicantStatusEnum.OnBoarded, statusText: 'Onboard' });
      this.canReject && statuses.push({ applicantStatus: ApplicantStatusEnum.Rejected, statusText: 'Rejected' });
    } else if (candidate.status === ApplicantStatusEnum.OnBoarded) {
      statuses.push(
        { applicantStatus: candidate.status, statusText: capitalize(CandidatStatus[candidate.status]) },
        { applicantStatus: ApplicantStatusEnum.Cancelled, statusText: 'Cancelled', disabled: !this.canCreateOrder }
      );
    } else {
      statuses.push({ applicantStatus: candidate.status, statusText: capitalize(CandidatStatus[candidate.status]) });
      this.canReject && statuses.push({ applicantStatus: ApplicantStatusEnum.Rejected, statusText: 'Rejected' });
    }

    this.applicantStatuses = statuses;
    candidate.status === ApplicantStatusEnum.Accepted
      ? [
          { applicantStatus: ApplicantStatusEnum.OnBoarded, statusText: 'Onboard' },
          { applicantStatus: ApplicantStatusEnum.Rejected, statusText: 'Rejected' },
        ]
      : candidate.status === ApplicantStatusEnum.OnBoarded
      ? [
          { applicantStatus: candidate.status, statusText: capitalize(CandidatStatus[candidate.status]) },
          { applicantStatus: ApplicantStatusEnum.Cancelled, statusText: 'Cancelled', disabled: !this.canCreateOrder },
        ]
      : [
          { applicantStatus: candidate.status, statusText: capitalize(CandidatStatus[candidate.status]) },
          { applicantStatus: ApplicantStatusEnum.Rejected, statusText: 'Rejected' },
        ];
    if (!this.applicantStatuses.length) {
      this.statusesFormControl.disable();
    }
  }

  private subsToCandidate(): void {
    const state$ = this.isAgency ? this.orderCandidatePage$ : this.clientOrderCandidatePage$;
    this.candidate$ = state$.pipe(
      map((res) => {
        const items = res?.items || this.candidateOrder?.items;
        const candidate = items?.find((candidate) => candidate.candidateJobId);
        this.candidate = candidate;
        if (candidate) {
          this.statusesFormControl.reset();
          this.createForm();
          this.patchForm(candidate.candidateJobId);
          this.store.dispatch(
            new GetCandidateJob(this.currentOrder.organizationId as number, candidate?.candidateJobId as number)
          );
          return candidate;
        } else {
          return EMPTY;
        }
      })
    ) as Observable<OrderCandidatesList>;
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
    this.canCreateOrder = false;
    this.orderPermissions.forEach((permission) => {
      this.canShortlist = this.canShortlist || permission.permissionId === PermissionTypes.CanShortlistCandidate;
      this.canInterview = this.canInterview || permission.permissionId === PermissionTypes.CanInterviewCandidate;
      this.canReject = this.canReject || permission.permissionId === PermissionTypes.CanRejectCandidate;
      this.canOffer = this.canOffer || permission.permissionId === PermissionTypes.CanOfferCandidate;
      this.canOnboard = this.canOnboard || permission.permissionId === PermissionTypes.CanOnBoardCandidate;
      this.canClose = this.canClose || permission.permissionId === PermissionTypes.CanCloseCandidate;
      this.canCreateOrder = this.canCreateOrder || permission.permissionId === PermissionTypes.CanCreateOrder;
    });
    this.disableControlsBasedOnPermissions();
    if (!this.isAgency && this.candidate) {
      this.setAllowedStatuses(this.candidate);
    }
    this.changeDetectorRef.markForCheck();
  }

  private disableControlsBasedOnPermissions(): void {
    if (!this.canShortlist && !this.canInterview && !this.canReject && !this.canOffer && !this.canOnboard) {
      this.form?.controls['guaranteedWorkWeek']?.disable();
    }
    if (!this.canReject && !this.canOffer && !this.canOnboard) {
      this.form?.controls['offeredBillRate']?.disable();
    }
    if (!this.canReject && !this.canOffer) {
      this.form?.controls['offeredStartDate']?.disable();
    }
    if (!this.canReject && !this.canOnboard) {
      this.form?.controls['actualStartDate']?.disable();
      this.form?.controls['actualEndDate']?.disable();
      this.form?.controls['clockId']?.disable();
    }
    if (!this.canOnboard) {
      this.form?.controls['allowDeployCredentials']?.disable();
    }
  }

  private updateAgencyCandidateJob(applicantStatus: ApplicantStatus): void {
    const value = this.form.getRawValue();
    if (this.form.valid) {
      const updatedValue = {
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        orderId: this.candidateJob.orderId,
        nextApplicantStatus: applicantStatus,
        candidateBillRate: this.candidateJob.candidateBillRate,
        offeredBillRate: value.offeredBillRate,
        requestComment: value.comments,
        actualStartDate: toCorrectTimezoneFormat(new Date(value.actualStartDate).toISOString()),
        actualEndDate: toCorrectTimezoneFormat(new Date(value.actualEndDate).toISOString()),
        offeredStartDate: this.candidateJob?.offeredStartDate,
        allowDeployWoCredentials: value.allowDeployCredentials,
        billRates: this.billRatesData,
        guaranteedWorkWeek: value.guaranteedWorkWeek,
        clockId: value.clockId,
      };
      const statusChanged = applicantStatus.applicantStatus === this.candidateJob.applicantStatus.applicantStatus;
      this.store
        .dispatch(
          this.isAgency ? new UpdateAgencyCandidateJob(updatedValue) : new UpdateOrganisationCandidateJob(updatedValue)
        )
        .subscribe(() => {
          this.store.dispatch(
            this.isAgency ? new ReloadOrderCandidatesLists() : new ReloadOrganisationOrderCandidatesLists()
          );
          if (statusChanged) {
            this.dialogEvent.next(false);
          }
        });
    } else {
      this.statusesFormControl.reset();
    }
  }

  private createForm(): void {
    this.form = new FormGroup({
      jobId: new FormControl({ value: '', disabled: true }),
      locationName: new FormControl({ value: '', disabled: true }),
      offeredBillRate: new FormControl('', Validators.required),
      comments: new FormControl(''),
      actualStartDate: new FormControl('', Validators.required),
      actualEndDate: new FormControl('', Validators.required),
      extensionStartDate: new FormControl({ value: '', disabled: true }),
      extensionEndDate: new FormControl({ value: '', disabled: true }),
      guaranteedWorkWeek: new FormControl('', [Validators.maxLength(50)]),
      clockId: new FormControl('', [Validators.maxLength(50)]),
      allowDeployCredentials: new FormControl(false),
      rejectReason: new FormControl(''),
      jobCancellationReason: new FormControl(''),
      penaltyCriteria: new FormControl(''),
      rate: new FormControl(''),
      hours: new FormControl(''),
    });
  }

  private getDateString(date: string): string | null {
    return this.datePipe.transform(date, 'MM/dd/yyyy');
  }

  private getComments(): void {
    this.commentsService
      .getComments(this.candidateJob?.commentContainerId as number, null)
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
      });
  }

  private patchForm(candidateJobId: number): void {
    this.orderManagementContentService
      .getCandidateJob(this.currentOrder.organizationId as number, candidateJobId)
      .subscribe((value) => {
        this.candidateJob = value;
        if (this.candidateJob) {
          this.setCancellationControls(this.candidateJob.jobCancellation?.penaltyCriteria || 0);
          this.getComments();
          if (!this.isAgency) {
            this.getOrderPermissions(value.orderId);
          }
          this.billRatesData = this.candidateJob?.billRates ? [...this.candidateJob.billRates] : [];
          this.form.disable();
          this.form.patchValue({
            jobId: `${this.currentOrder?.organizationPrefix ?? ''}-${this.currentOrder?.publicId}`,
            avStartDate: this.getDateString(this.candidateJob.availableStartDate),
            locationName: this.candidateJob.order?.locationName,
            actualStartDate: this.getDateString(this.candidateJob.actualStartDate),
            actualEndDate: this.getDateString(this.candidateJob.actualEndDate),
            extensionStartDate: this.getDateString(this.candidateJob.actualStartDate),
            extensionEndDate: this.getDateString(this.candidateJob.actualEndDate),
            offeredBillRate: PriceUtils.formatNumbers(this.candidateJob.offeredBillRate),
            comments: this.candidateJob.requestComment,
            guaranteedWorkWeek: this.candidateJob.guaranteedWorkWeek,
            clockId: this.candidateJob.clockId,
            allowDeployCredentials: this.candidateJob.allowDeployCredentials,
            rejectReason: this.candidateJob.rejectReason,
            jobCancellationReason:
              CancellationReasonsMap[this.candidateJob.jobCancellation?.jobCancellationReason || 0],
            penaltyCriteria: PenaltiesMap[this.candidateJob.jobCancellation?.penaltyCriteria || 0],
            rate: this.candidateJob.jobCancellation?.rate,
            hours: this.candidateJob.jobCancellation?.hours,
          });

          if (!this.isRejected) {
            this.fieldsEnableHandlear();
          }
        }

        this.changeDetectorRef.markForCheck();
      });
  }

  private setCancellationControls(value: PenaltyCriteria): void {
    this.showHoursControl = value === PenaltyCriteria.RateOfHours || value === PenaltyCriteria.FlatRateOfHours;
    this.showPercentage = value === PenaltyCriteria.RateOfHours;
  }

  private fieldsEnableHandlear(): void {
    if (this.isAgency && !this.isOnBoard && !this.isCancelled) {
      this.form.get('comments')?.enable();
    }
    if (!this.isAgency && !this.isCancelled) {
      this.form.get('offeredBillRate')?.enable();
    }
    if (this.isAccepted && !this.isAgency) {
      this.form.get('guaranteedWorkWeek')?.enable();
      this.form.get('clockId')?.enable();
      this.form.get('actualStartDate')?.enable();
      this.form.get('actualEndDate')?.enable();
      this.form.get('allowDeployCredentials')?.enable();
    }
    if (this.isOnBoard && !this.isAgency) {
      this.form.get('clockId')?.enable();
      this.form.get('actualStartDate')?.enable();
      this.form.get('actualEndDate')?.enable();
    }
  }

  private subscribeOnReasonsList(): Observable<RejectReason[]> {
    return merge(
      this.store.select(OrderManagementContentState.rejectionReasonsList),
      this.store.select(OrderManagementState.rejectionReasonsList)
    ).pipe(map((reasons) => reasons ?? []));
  }

  private onRejectSuccess(): void {
    merge(
      this.action$.pipe(
        ofActionSuccessful(RejectCandidateForOrganisationSuccess),
        mergeMap(() => this.store.dispatch(new ReloadOrganisationOrderCandidatesLists()))
      ),
      this.action$.pipe(
        ofActionSuccessful(RejectCandidateForAgencySuccess),
        mergeMap(() => this.store.dispatch(new ReloadOrderCandidatesLists()))
      )
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private subscribeOnCancelOrganizationCandidateJobSuccess(): void {
    this.action$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(CancelOrganizationCandidateJobSuccess))
      .subscribe(() => {
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
  }
}
