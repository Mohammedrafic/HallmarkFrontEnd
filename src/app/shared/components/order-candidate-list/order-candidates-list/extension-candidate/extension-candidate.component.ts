import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';

import { RejectReason } from '@shared/models/reject-reason.model';
import { ChangedEventArgs, MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { EMPTY, merge, Observable, Subject } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { OrderManagementState } from '@agency/store/order-management.state';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
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
  ReloadOrderCandidatesLists,
  UpdateAgencyCandidateJob,
} from '@agency/store/order-management.actions';
import { DatePipe } from '@angular/common';
import { ApplicantStatus as ApplicantStatusEnum, CandidatStatus } from '@shared/enums/applicant-status.enum';
import PriceUtils from '@shared/utils/price.utils';
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';
import { map, takeUntil } from 'rxjs/operators';
import { WorkflowStepType } from '@shared/enums/workflow-step-type';
import { Router } from '@angular/router';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import {
  GetRejectReasonsForOrganisation,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  UpdateOrganisationCandidateJob,
} from '@client/store/order-managment-content.actions';
import { capitalize } from 'lodash';
import { DurationService } from '@shared/services/duration.service';

@Component({
  selector: 'app-extension-candidate',
  templateUrl: './extension-candidate.component.html',
  styleUrls: ['../accept-candidate/accept-candidate.component.scss', './extension-candidate.component.scss'],
  providers: [MaskedDateTimeService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtensionCandidateComponent implements OnInit, OnDestroy {
  @Input() currentOrder: Order;
  @Input() candidateOrder: OrderCandidatesListPage;
  @Input() dialogEvent: Subject<boolean>;
  candidate$: Observable<OrderCandidatesList>;

  @Select(OrderManagementState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementContentState.orderCandidatePage)
  public clientOrderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  public rejectReasons: RejectReason[];
  public form: FormGroup;
  public statusesFormControl = new FormControl();
  public candidateJob: OrderCandidateJob;
  public candidatStatus = CandidatStatus;
  public workflowStepType = WorkflowStepType;
  public billRatesData: BillRate[] = [];
  public isReadOnly = false;
  public openRejectDialog = new Subject<boolean>();
  public priceUtils = PriceUtils;
  public optionFields = { text: 'statusText', value: 'applicantStatus' };
  public applicantStatuses: ApplicantStatus[] = [
    { applicantStatus: ApplicantStatusEnum.Rejected, statusText: 'Reject' },
  ];
  public isAgency: boolean = false;

  private unsubscribe$: Subject<void> = new Subject();

  public comments: Comment[] = [];

  get isAccepted(): boolean {
    return this.candidateJob?.applicantStatus?.applicantStatus === this.candidatStatus.Accepted;
  }

  get isRejected(): boolean {
    return this.candidateJob?.applicantStatus?.applicantStatus === this.candidatStatus.Rejected;
  }

  get isOnBoard(): boolean {
    return this.candidateJob?.applicantStatus?.applicantStatus === this.candidatStatus.OnBoard;
  }

  get canAccept(): boolean {
    return this.candidateJob && this.isAgency && !this.isOnBoard;
  }

  get actualStartDateValue(): Date {
    return this.form.get('startDate')?.value;
  }

  constructor(
    private store: Store,
    private datePipe: DatePipe,
    private commentsService: CommentsService,
    private router: Router,
    private orderManagementContentService: OrderManagementContentService,
    private durationService: DurationService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.isAgency = this.router.url.includes('agency');
  }

  ngOnInit(): void {
    this.subsToCandidate();
    this.subscribeOnReasonsList();
    this.createForm();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public updateOrganizationCandidateJobWithBillRate(bill: BillRate): void {
    this.form.markAllAsTouched();
    if (!this.form.errors && this.candidateJob) {
      const value = this.form.getRawValue();
      this.store.dispatch(
        new UpdateOrganisationCandidateJob({
          organizationId: this.candidateJob.organizationId,
          orderId: this.candidateJob.orderId,
          jobId: this.candidateJob.jobId,
          skillName: value.skillName,
          offeredBillRate: this.candidateJob?.offeredBillRate,
          candidateBillRate: this.candidateJob.candidateBillRate,
          nextApplicantStatus: {
            applicantStatus: this.candidateJob.applicantStatus.applicantStatus,
            statusText: this.candidateJob.applicantStatus.statusText,
          },
          billRates: this.getBillRateForUpdate(bill),
        })
      );
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
    this.store.dispatch(new GetRejectReasonsForOrganisation());
    this.openRejectDialog.next(true);
  }

  public rejectCandidateJob(event: { rejectReason: number }): void {
    if (this.candidateJob) {
      const payload = {
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        rejectReasonId: event.rejectReason,
      };

      this.store.dispatch(new RejectCandidateJob(payload));
      this.dialogEvent.next(false);
    }
  }

  public cancelRejectCandidate(): void {
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
    this.applicantStatuses =
      candidate.status === ApplicantStatusEnum.Accepted
        ? [
            { applicantStatus: ApplicantStatusEnum.OnBoarded, statusText: 'Onboard' },
            { applicantStatus: ApplicantStatusEnum.Rejected, statusText: 'Reject' },
          ]
        : candidate.status === ApplicantStatusEnum.OnBoarded
        ? [{ applicantStatus: candidate.status, statusText: capitalize(CandidatStatus[candidate.status]) }]
        : [
            { applicantStatus: candidate.status, statusText: capitalize(CandidatStatus[candidate.status]) },
            { applicantStatus: ApplicantStatusEnum.Rejected, statusText: 'Reject' },
          ];
  }

  private subsToCandidate(): void {
    const state$ = this.isAgency ? this.orderCandidatePage$ : this.clientOrderCandidatePage$;
    this.candidate$ = state$.pipe(
      map((res) => {
        const items = res?.items || this.candidateOrder?.items;
        const candidate = items?.find((candidate) => candidate.candidateJobId);
        if (candidate) {
          this.statusesFormControl.reset();
          this.createForm();
          this.patchForm(candidate.candidateJobId);
          if (!this.isAgency) {
            this.setAllowedStatuses(candidate);
          }
          this.store.dispatch(
            new GetCandidateJob(this.currentOrder.organizationId as number, candidate?.candidateJobId as number)
          );
          return candidate;
        } else {
          return EMPTY;
        }
      })
    ) as Observable<OrderCandidatesList>;
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
        actualStartDate: new Date(value.actualStartDate).toISOString(),
        actualEndDate: new Date(value.actualEndDate).toISOString(),
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
          this.getComments();
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
          });

          if (!this.isRejected) {
            this.fieldsEnableHandlear();
          }
        }

        this.changeDetectorRef.markForCheck();
      });
  }

  private fieldsEnableHandlear(): void {
    if (this.isAgency && !this.isOnBoard) {
      this.form.get('comments')?.enable();
    }
    if (!this.isAgency) {
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

  private subscribeOnReasonsList(): void {
    merge(
      this.store.select(OrderManagementContentState.rejectionReasonsList),
      this.store.select(OrderManagementState.rejectionReasonsList)
    )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((reasons) => {
        this.rejectReasons = reasons ?? [];
      });
  }
}

