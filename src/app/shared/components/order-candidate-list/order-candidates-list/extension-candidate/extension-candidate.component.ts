import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { RejectReason } from '@shared/models/reject-reason.model';
import { EMPTY, Observable, Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { Actions, Select, Store } from '@ngxs/store';
import { OrderManagementState } from '@agency/store/order-management.state';
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
import { map } from 'rxjs/operators';
import { WorkflowStepType } from '@shared/enums/workflow-step-type';
import { Router } from '@angular/router';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';

@Component({
  selector: 'app-extension-candidate',
  templateUrl: './extension-candidate.component.html',
  styleUrls: ['../accept-candidate/accept-candidate.component.scss', './extension-candidate.component.scss'],
})
export class ExtensionCandidateComponent implements OnInit, OnDestroy {
  @Input() currentOrder: Order;
  @Input() candidateOrder: OrderCandidatesListPage;
  candidate$: Observable<OrderCandidatesList>;

  @Select(OrderManagementState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  form: FormGroup;

  public candidateJob: OrderCandidateJob;
  public candidatStatus = CandidatStatus;
  public workflowStepType = WorkflowStepType;
  public billRatesData: BillRate[] = [];
  public rejectReasons: RejectReason[] = [];
  public isReadOnly = false;
  public openRejectDialog = new Subject<boolean>();
  public priceUtils = PriceUtils;
  public optionFields = { text: 'statusText', value: 'applicantStatus' };
  public applicantStatuses: ApplicantStatus[] = [
    { applicantStatus: ApplicantStatusEnum.Rejected, statusText: 'Reject' },
  ];

  private unsubscribe$: Subject<void> = new Subject();

  public comments: Comment[] = [];
  isAgency: boolean = false;

  get isAccepted(): boolean {
    return this.candidateJob?.applicantStatus?.applicantStatus === this.candidatStatus.Accepted;
  }

  get canAccept(): boolean {
    return this.candidateJob && this.isAgency && !this.isAccepted;
  }

  constructor(
    private store: Store,
    private actions$: Actions,
    private datePipe: DatePipe,
    private commentsService: CommentsService,
    private router: Router,
    private orderManagementContentService: OrderManagementContentService
  ) {
    this.isAgency = this.router.url.includes('agency');
  }

  ngOnInit(): void {
    this.subsToCandidate();
    this.createForm();
    this.form.disable();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onReject(): void {
    // TODO
    console.error('has not been implemented yet');
  }

  public onAccept(): void {
    this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Accepted, statusText: 'Accepted' });
  }

  public onDropDownChanged(event: { itemData: { applicantStatus: ApplicantStatusEnum; statusText: string } }): void {
    if (event.itemData?.applicantStatus === ApplicantStatusEnum.Accepted) {
      this.onAccept();
    }
  }

  private subsToCandidate(): void {
    this.candidate$ = this.orderCandidatePage$.pipe(
      map((res) => {
        const items = res?.items || this.candidateOrder?.items;
        const candidate = items?.find((candidate) => candidate.candidateJobId) as OrderCandidatesList;
        if (candidate) {
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
  }

  private updateAgencyCandidateJob(applicantStatus: ApplicantStatus): void {
    const value = this.form.getRawValue();
    this.store
      .dispatch(
        new UpdateAgencyCandidateJob({
          organizationId: this.candidateJob.organizationId,
          jobId: this.candidateJob.jobId,
          orderId: this.candidateJob.orderId,
          nextApplicantStatus: applicantStatus,
          candidateBillRate: this.candidateJob.candidateBillRate,
          offeredBillRate: value.offeredBillRate,
          requestComment: value.comments,
          actualStartDate: '2022-08-23T16:05:23+00:00',
          actualEndDate: this.candidateJob.actualEndDate,
          allowDeployWoCredentials: false,
          billRates: this.billRatesData,
        })
      )
      .subscribe(() => {
        this.store.dispatch(new ReloadOrderCandidatesLists());
      });
  }

  private createForm(): void {
    this.form = new FormGroup({
      jobId: new FormControl(''),
      locationName: new FormControl(''),
      offeredBillRate: new FormControl(''),
      comments: new FormControl(''),
      actualStartDate: new FormControl(''),
      actualEndDate: new FormControl(''),
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
          this.form.patchValue({
            jobId: this.candidateJob.orderId,
            avStartDate: this.getDateString(this.candidateJob.availableStartDate),
            locationName: this.candidateJob.order?.locationName,
            actualStartDate: this.getDateString(this.candidateJob.actualStartDate),
            actualEndDate: this.getDateString(this.candidateJob.actualEndDate),
            offeredBillRate: PriceUtils.formatNumbers(this.candidateJob.offeredBillRate),
            comments: this.candidateJob.requestComment,
          });
          this.isAgency ? this.form.get('comments')?.enable() : this.form.get('offeredBillRate')?.enable();
          if (this.isAccepted) {
            this.form.get('comments')?.disable();
          }
        }
      });
  }
}
