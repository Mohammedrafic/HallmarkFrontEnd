import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { ApplicantStatus, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { Observable, Subject, takeUntil, of, take, filter } from 'rxjs';

import { ApplyOrderApplicants, ReloadOrderCandidatesLists } from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { BillRate } from '@shared/models/bill-rate.model';
import { OrderApplicantsInitialData } from '@shared/models/order-applicants.model';
import { OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import PriceUtils from '@shared/utils/price.utils';
import { Comment } from '@shared/models/comment.model';
import { CommentsService } from '@shared/services/comments.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { CandidateSSNRequired,CandidatePHONE1Required, deployedCandidateMessage, DEPLOYED_CANDIDATE, REQUIRED_PERMISSIONS, SubmissionsLimitReached } from '@shared/constants';
import { DeployedCandidateOrderInfo } from '@shared/models/deployed-candidate-order-info.model';
import { DateTimeHelper } from '@core/helpers';
import { MessageTypes } from '../../../../enums/message-types';
import { ShowToast } from '../../../../../store/app.actions';

@Component({
  selector: 'app-apply-candidate',
  templateUrl: './apply-candidate.component.html',
  styleUrls: ['./apply-candidate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MaskedDateTimeService],
})
export class ApplyCandidateComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Output() public closeDialogEmitter: EventEmitter<void> = new EventEmitter();

  @Input() candidate: OrderCandidatesList;
  @Input() billRatesData: BillRate[] = [];
  @Input() order: any;
  @Input() isTab: boolean = false;
  @Input() isAgency: boolean = false;
  @Input() isLocked: boolean | undefined = false;
  @Input() actionsAllowed: boolean;
  @Input() deployedCandidateOrderInfo: DeployedCandidateOrderInfo[];
  @Input() candidateOrderIds: string[];
  @Input() isOrderOverlapped: boolean;

  public formGroup: FormGroup;
  public readOnlyMode: boolean;
  public candidatStatus = CandidatStatus;
  public today = new Date();
  public organizationId: number;
  public priceUtils = PriceUtils;
  public orderId: number;
  public canApplyCandidate = true;
  public applyRestrictionMessage = REQUIRED_PERMISSIONS;
  public candidateSSNRequired: boolean;

  @Select(OrderManagementState.orderApplicantsInitialData)
  public orderApplicantsInitialData$: Observable<OrderApplicantsInitialData>;

  @Select(OrderManagementState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;
  public candidateJob: OrderCandidateJob;

  public comments: Comment[] = [];
  public showComments: boolean = true;

  private unsubscribe$: Subject<void> = new Subject();
  private candidateId: number;
  public candidatePhone1RequiredValue : string = '';
  private orderApplicantsInitialData: OrderApplicantsInitialData | null;

  get candidateStatus(): ApplicantStatus {
    return this.candidate.status || (this.candidate.candidateStatus as any);
  }

  get isDeployedCandidate(): boolean {
    return !!this.candidate.deployedCandidateInfo && this.candidateStatus !== ApplicantStatus.OnBoarded;
  }

  get isOnboardedCandidate(): boolean {
    return this.candidateStatus === ApplicantStatus.OnBoarded;
  }

  get isAcceptedCandidate(): boolean {
    return this.candidateStatus === ApplicantStatus.Accepted;
  }

  constructor(
    private store: Store,
    private commentsService: CommentsService,
    private changeDetectorRef: ChangeDetectorRef,
    private confirmService: ConfirmService,
  ) {}

  ngOnChanges(): void {
    this.readOnlyMode = this.isOnboardedCandidate && this.isAcceptedCandidate && this.isAgency;
    this.showComments = this.candidateStatus !== ApplicantStatus.NotApplied;
  }

  ngOnInit(): void {
    this.today.setHours(0);
    this.today.setMinutes(0);
    this.createForm();
    this.subscribeOnInitialData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  closeDialog(): void {
    this.closeDialogEmitter.next();
  }

  public applyOrderApplicants(): void {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {

      if (this.candidateSSNRequired) {
        if (!this.formGroup.controls["ssn"].value) {
          this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateSSNRequired));
          return;
        }
      }

      if(this.candidatePhone1RequiredValue === "Apply"){
        if(this.orderApplicantsInitialData?.candidateProfileContactDetails != null && this.orderApplicantsInitialData?.candidateProfileContactDetails.phone1 === null){
          this.store.dispatch(new ShowToast(MessageTypes.Error, CandidatePHONE1Required('Apply')));
          return;
        }else{
          this.store.dispatch(new ShowToast(MessageTypes.Error, CandidatePHONE1Required('Apply')));
          return;
        }
      }

      this.shouldApplyDeployedCandidate()
        .pipe(take(1))
        .subscribe((isConfirm) => {
          if (isConfirm) {
            const value = this.formGroup.getRawValue();
            let availableStartDate = value.availableStartDate;
            if (value.availableStartDate && value.availableStartDate.setHours) {
              availableStartDate = DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(value.availableStartDate));
            }
            if (typeof value.availableStartDate === 'string') {
              const date = new Date(value.availableStartDate);
              date.setHours(0, 0, 0, 0);
              availableStartDate = DateTimeHelper.toUtcFormat(date);
            }
            this.store
              .dispatch(
                new ApplyOrderApplicants({
                  orderId: this.orderId,
                  organizationId: this.organizationId,
                  candidateId: this.candidateId,
                  candidateBillRate: value.candidateBillRate,
                  expAsTravelers: value.expAsTravelers,
                  availableStartDate: availableStartDate,
                  requestComment: value.requestComment,
                  candidatePayRate: value.candidatePayRate,
                })
              )
              .subscribe(() => {
                this.store.dispatch(new ReloadOrderCandidatesLists());
              });
            this.closeDialog();
          }
        });
    }
  }

  private shouldApplyDeployedCandidate(): Observable<boolean> {
    const options = {
      title: DEPLOYED_CANDIDATE,
      okButtonLabel: 'Proceed',
      okButtonClass: 'ok-button',
    };

    return this.isDeployedCandidate && this.isAgency && this.isOrderOverlapped
      ? this.confirmService.confirm(deployedCandidateMessage(this.candidateOrderIds), options)
      : of(true);
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
      ssn: new FormControl('')
    });
  }

  private setFormValue(data: OrderApplicantsInitialData): void {
    this.formGroup.setValue({
      orderId: `${this.order?.organizationPrefix ?? ''}-${this.order?.publicId}`,
      jobDate: [DateTimeHelper.formatDateUTC(data.jobStartDate, 'MM/dd/yyyy'), DateTimeHelper.formatDateUTC(data.jobEndDate, 'MM/dd/yyyy')],
      orderBillRate: PriceUtils.formatNumbers(data.orderBillRate),
      locationName: data.locationName,
      availableStartDate: DateTimeHelper.formatDateUTC(data.availableStartDate, 'MM/dd/yyyy'),
      yearsOfExperience: data.yearsOfExperience,
      candidateBillRate: PriceUtils.formatNumbers(data.orderBillRate),
      expAsTravelers: data.expAsTravelers || 0,
      requestComment: data.requestComment || '',
      ssn: data.ssn,
    });
  }

  private getComments(): void {
    this.commentsService
      .getComments(this.candidateJob?.commentContainerId as number, null)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
        this.changeDetectorRef.markForCheck();
      });
  }

  private subscribeOnInitialData(): void {
    this.candidateJobState$
    .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: OrderCandidateJob) => {
      this.candidateJob = data;
      if (data?.candidateProfile.id === this.candidate.candidateId) {
        this.getComments();
      }
      this.changeDetectorRef.markForCheck();
    });
    this.orderApplicantsInitialData$
      .pipe(
        filter((data) => !!data),
        takeUntil(this.unsubscribe$),
        )
      .subscribe((data: OrderApplicantsInitialData) => {
          if(data.candidatePhone1Required != null){
            let phone1Configuration = JSON.parse(data.candidatePhone1Required);
            if(phone1Configuration.isEnabled){
              this.candidatePhone1RequiredValue = phone1Configuration.value;
            }
          }
        this.orderApplicantsInitialData = data;
        this.candidateSSNRequired = data.candidateSSNRequired;
        this.organizationId = data.organizationId;
        this.candidateId = data.candidateId;
        this.orderId = data.orderId;
        this.canApplyCandidate = data.canApplyCandidatesToOrder;
        this.applyRestrictionMessage = this.canApplyCandidate ? REQUIRED_PERMISSIONS : SubmissionsLimitReached;
        this.setFormValue(data);
        this.changeDetectorRef.detectChanges();
      });
  }
}
