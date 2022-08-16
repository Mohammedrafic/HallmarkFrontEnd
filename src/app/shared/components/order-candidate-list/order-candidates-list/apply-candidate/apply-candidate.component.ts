import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { ApplicantStatus, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { Observable, Subject, takeUntil } from 'rxjs';

import { ApplyOrderApplicants, ReloadOrderCandidatesLists } from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { BillRate } from '@shared/models/bill-rate.model';
import { OrderApplicantsInitialData } from '@shared/models/order-applicants.model';
import { OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import { ExpandEventArgs, AccordionClickArgs } from '@syncfusion/ej2-navigations';
import { AccordionOneField } from '@shared/models/accordion-one-field.model';
import PriceUtils from '@shared/utils/price.utils';
import { toCorrectTimezoneFormat } from '@shared/utils/date-time.utils';
import { Comment } from '@shared/models/comment.model';
import { CommentsService } from '@shared/services/comments.service';

@Component({
  selector: 'app-apply-candidate',
  templateUrl: './apply-candidate.component.html',
  styleUrls: ['./apply-candidate.component.scss'],
  providers: [MaskedDateTimeService],
})
export class ApplyCandidateComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Output() public closeDialogEmitter: EventEmitter<void> = new EventEmitter();

  @Input() candidate: OrderCandidatesList;
  @Input() billRatesData: BillRate[] = [];
  @Input() isTab: boolean = false;
  @Input() isAgency: boolean = false;
  @Input() isLocked: boolean | undefined = false;

  public formGroup: FormGroup;
  public readOnlyMode: boolean;
  public candidatStatus = CandidatStatus;
  public today = new Date();
  public organizationId: number;
  public priceUtils = PriceUtils;
  public accordionClickElement: HTMLElement | null;
  public accordionOneField: AccordionOneField;

  @Select(OrderManagementState.orderApplicantsInitialData)
  public orderApplicantsInitialData$: Observable<OrderApplicantsInitialData>;

  @Select(OrderManagementState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;
  public candidateJob: OrderCandidateJob;

  public comments: Comment[] = [];
  public showComments: boolean = true;

  private unsubscribe$: Subject<void> = new Subject();
  private candidateId: number;

  get isDeployedCandidate(): boolean {
    return !!this.candidate.deployedCandidateInfo && this.candidate.candidateStatus !== ApplicantStatus.OnBoarded;
  }

  constructor(private store: Store, private commentsService: CommentsService) {}

  ngOnChanges(): void {
    this.readOnlyMode = !!this.isDeployedCandidate && this.isAgency;
    this.showComments = this.candidate.status !== ApplicantStatus.NotApplied;
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

  applyOrderApplicants(): void {
    if (this.formGroup.valid) {
      const value = this.formGroup.getRawValue();
      this.store
        .dispatch(
          new ApplyOrderApplicants({
            orderId: value.orderId,
            organizationId: this.organizationId,
            candidateId: this.candidateId,
            candidateBillRate: value.candidateBillRate,
            expAsTravelers: value.expAsTravelers,
            availableStartDate: toCorrectTimezoneFormat(value.availableStartDate),
            requestComment: value.requestComment,
          })
        )
        .subscribe(() => {
          this.store.dispatch(new ReloadOrderCandidatesLists());
        });
      this.closeDialog();
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
      jobDate: [data.jobStartDate, data.jobEndDate],
      orderBillRate: PriceUtils.formatNumbers(data.orderBillRate),
      locationName: data.locationName,
      availableStartDate: data.availableStartDate,
      yearsOfExperience: data.yearsOfExperience,
      candidateBillRate: PriceUtils.formatNumbers(data.orderBillRate),
      expAsTravelers: data.expAsTravelers || 0,
      requestComment: data.requestComment || '',
    });
  }

  private getComments(): void {
    this.commentsService.getComments(this.candidateJob?.commentContainerId as number, null).subscribe((comments: Comment[]) => {
      this.comments = comments;
    });
  }

  private subscribeOnInitialData(): void {
    this.candidateJobState$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: OrderCandidateJob) => {
      this.candidateJob = data;

      if (data?.candidateProfile.id === this.candidate.candidateId) {
        this.getComments();
      }
    });
    this.orderApplicantsInitialData$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: OrderApplicantsInitialData) => {
        if (data) {
          this.organizationId = data.organizationId;
          this.candidateId = data.candidateId;
          this.setFormValue(data);
        }
      });
  }
}
