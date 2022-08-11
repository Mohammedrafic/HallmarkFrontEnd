import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { filter, merge, Observable, Subject, takeUntil } from 'rxjs';
import { OPTION_FIELDS } from '@shared/components/order-candidate-list/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst';
import { BillRate } from '@shared/models/bill-rate.model';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { ApplicantStatus, CandidatStatus } from '@shared/enums/applicant-status.enum';
import {
  GetRejectReasonsForOrganisation,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists, SetIsDirtyOrderForm,
  UpdateOrganisationCandidateJob,
} from '@client/store/order-managment-content.actions';
import { ApplicantStatus as ApplicantStatusEnum } from '@shared/enums/applicant-status.enum';
import { RejectReason } from '@shared/models/reject-reason.model';
import { ShowToast } from '../../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import { AccordionClickArgs, ExpandEventArgs } from '@syncfusion/ej2-navigations';
import { AccordionOneField } from '@shared/models/accordion-one-field.model';
import PriceUtils from '@shared/utils/price.utils';
import { SET_READONLY_STATUS } from '@shared/constants';
import { toCorrectTimezoneFormat } from "@shared/utils/date-time.utils";
import { OrderCandidateListViewService } from "@shared/components/order-candidate-list/order-candidate-list-view.service";

@Component({
  selector: 'app-onboarded-candidate',
  templateUrl: './onboarded-candidate.component.html',
  styleUrls: ['./onboarded-candidate.component.scss'],
  providers: [MaskedDateTimeService],
})
export class OnboardedCandidateComponent implements OnInit, OnDestroy {
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Select(OrderManagementContentState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  @Select(OrderManagementContentState.applicantStatuses)
  applicantStatuses$: Observable<ApplicantStatus[]>;

  @Output() closeModalEvent = new EventEmitter<never>();

  @Input() candidate: OrderCandidatesList;
  @Input() isTab: boolean = false;
  @Input() isAgency: boolean = false;

  public form: FormGroup;
  public jobStatusControl: FormControl;
  public optionFields = OPTION_FIELDS;
  public candidateJob: OrderCandidateJob | null;
  public isOnboarded = true;
  public today = new Date();
  public candidatStatus = CandidatStatus;
  public billRatesData: BillRate[] = [];
  public rejectReasons: RejectReason[] = [];
  public openRejectDialog = new Subject<boolean>();
  public isRejected = false;
  public priceUtils = PriceUtils;
  public accordionClickElement: HTMLElement | null;
  public accordionOneField: AccordionOneField;
  public nextApplicantStatuses: ApplicantStatus[];
  public isActiveCandidateDialog$: Observable<boolean>;

  get startDateControl(): AbstractControl | null {
    return this.form.get('startDate');
  }

  get endDateControl(): AbstractControl | null {
    return this.form.get('endDate');
  }

  get isAccepted(): boolean {
    return this.candidate.status === ApplicantStatusEnum.Accepted;
  }

  get isOnBoarded(): boolean {
    return this.candidate.status === ApplicantStatusEnum.OnBoarded;
  }

  get isDeployedCandidate(): boolean {
    return !!this.candidate.deployedCandidateInfo && this.candidate.status !== ApplicantStatus.OnBoarded;
  }

  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private datePipe: DatePipe,
    private store: Store,
    private actions$: Actions,
    private orderCandidateListViewService: OrderCandidateListViewService
    ) {}

  ngOnInit(): void {
    this.isActiveCandidateDialog$ = this.orderCandidateListViewService.getIsCandidateOpened();
    this.createForm();
    this.patchForm();
    this.subscribeOnDate();
    this.subscribeOnReasonsList();
    this.checkRejectReason();
    this.subscribeOnSuccessRejection();
    this.subscribeOnUpdateOrganisationCandidateJobError();
    this.subscribeOnGetStatus();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onDropDownChanged(event: { itemData: { applicantStatus: ApplicantStatus; isEnabled: boolean } }): void {
    if (event.itemData?.isEnabled) {
      this.handleOnboardedCandidate(event);
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, SET_READONLY_STATUS));
    }
  }

  public onRejectCandidate(event: { rejectReason: number }): void {
    this.isRejected = true;

    if (this.candidateJob) {
      const payload = {
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        rejectReasonId: event.rejectReason,
      };

      const value = this.rejectReasons.find((reason: RejectReason) => reason.id === event.rejectReason)?.reason;
      this.form.patchValue({ rejectReason: value });
      this.store.dispatch(new RejectCandidateJob(payload));
      this.closeDialog();
    }
  }

  public closeDialog() {
    this.closeModalEvent.emit();
    this.candidateJob = null;
    this.jobStatusControl.reset();
    this.billRatesData = [];
    this.isRejected = false;
    this.nextApplicantStatuses = [];
    this.orderCandidateListViewService.setIsCandidateOpened(false);
  }

  public clickedOnAccordion(accordionClick: AccordionClickArgs): void {
    this.accordionOneField = new AccordionOneField(this.accordionComponent);
    this.accordionClickElement = this.accordionOneField.clickedOnAccordion(accordionClick);
  }

  public toForbidExpandSecondRow(expandEvent: ExpandEventArgs): void {
    this.accordionOneField = new AccordionOneField(this.accordionComponent);
    this.accordionOneField.toForbidExpandSecondRow(expandEvent, this.accordionClickElement);
  }

  public onBillRatesChanged(bill: BillRate): void {
    this.form.markAllAsTouched();
    if (!this.form.errors && this.candidateJob) {
      this.store
        .dispatch(
          new UpdateOrganisationCandidateJob({
            orderId: this.candidateJob?.orderId as number,
            organizationId: this.candidateJob?.organizationId as number,
            jobId: this.candidateJob?.jobId as number,
            nextApplicantStatus: {
              applicantStatus: 60,
              statusText: 'Onboard',
            },
            actualStartDate: this.candidateJob?.actualStartDate as string,
            actualEndDate: this.candidateJob?.actualEndDate as string,
            offeredStartDate: toCorrectTimezoneFormat(this.candidateJob?.availableStartDate as string),
            candidateBillRate: this.candidateJob?.candidateBillRate as number,
            offeredBillRate: this.candidateJob?.offeredBillRate,
            requestComment: this.candidateJob?.requestComment as string,
            clockId: this.candidateJob?.clockId,
            guaranteedWorkWeek: this.candidateJob?.guaranteedWorkWeek,
            billRates: this.getBillRateForUpdate(bill),

          })
        )
        .subscribe(() => {
          this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
          this.closeDialog();
          this.store.dispatch(new SetIsDirtyOrderForm(true));
        });
    }
  }

  getBillRateForUpdate(value: BillRate): BillRate[] {
    let billRates;
    const existingBillRateIndex = this.candidateJob?.billRates.findIndex(billRate => billRate.id === value.id) as number;
    if (existingBillRateIndex > -1) {
      this.candidateJob?.billRates.splice(existingBillRateIndex, 1, value);
      billRates = this.candidateJob?.billRates;
    } else {
      if (typeof value === 'number') {
        this.candidateJob?.billRates.splice(value, 1);
        billRates = this.candidateJob?.billRates;
      } else {
        billRates = [...this.candidateJob?.billRates as BillRate[], value];
      }
    }

    return billRates as BillRate[];
  }

  private onAccept(): void {
    if (this.form.valid && this.candidateJob) {
      const value = this.form.getRawValue();
      this.store
        .dispatch(
          new UpdateOrganisationCandidateJob({
            organizationId: this.candidateJob.organizationId,
            jobId: this.candidateJob.jobId,
            orderId: this.candidateJob.orderId,
            nextApplicantStatus: {
              applicantStatus: 60,
              statusText: 'Onboard',
            },
            candidateBillRate: value.candidateBillRate,
            offeredBillRate: value.offeredBillRate,
            requestComment: value.comments,
            actualStartDate: value.startDate,
            actualEndDate: value.endDate,
            clockId: value.clockId,
            guaranteedWorkWeek: value.workWeek,
            allowDeployWoCredentials: value.allow,
            billRates: this.billRatesData,
            offeredStartDate: this.candidateJob.offeredStartDate,
          })
        )
        .subscribe(() => {
          this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
        });
      this.closeDialog();
    }
  }

  private patchForm(): void {
    this.candidateJobState$.pipe(takeUntil(this.unsubscribe$)).subscribe((value) => {
      this.candidateJob = value;
      if (value) {
        this.billRatesData = [...value?.billRates];
        this.form.patchValue({
          jobId: value.orderId,
          date: [value.order.jobStartDate, value.order.jobEndDate],
          billRates: PriceUtils.formatNumbers(value.order.hourlyRate),
          candidates: `${value.candidateProfile.lastName} ${value.candidateProfile.firstName}`,
          candidateBillRate: PriceUtils.formatNumbers(value.candidateBillRate),
          locationName: value.order.locationName,
          avStartDate: this.getDateString(value.availableStartDate),
          yearExp: value.yearsOfExperience,
          travelExp: value.expAsTravelers,
          comments: value.requestComment,
          workWeek: value.guaranteedWorkWeek ? value.guaranteedWorkWeek : '',
          clockId: value.clockId ? value.clockId : '',
          offeredBillRate: PriceUtils.formatNumbers(value.offeredBillRate),
          allow: value.allowDeployCredentials,
          startDate: value.actualStartDate ? value.actualStartDate : value.order.jobStartDate,
          endDate: value.actualEndDate ? value.actualEndDate : value.order.jobEndDate,
          rejectReason: value.rejectReason,
          offeredStartDate: this.getDateString(value.offeredStartDate),
        });

        this.isFormDisabled(value.applicantStatus.applicantStatus);
      }
    });
  }

  private getDateString(date: string): string | null {
    return this.datePipe.transform(date, 'MM/dd/yyyy');
  }

  private subscribeOnDate(): void {
    merge(
      (this.startDateControl as AbstractControl).valueChanges,
      (this.endDateControl as AbstractControl).valueChanges
    )
      .pipe(
        filter((value) => !!value),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        const value = this.form.getRawValue();
        this.form.patchValue({ date: [value.startDate, value.endDate] });
      });
  }

  private isFormDisabled(status: number): void {
    if (status === ApplicantStatus.OnBoarded) {
      this.form.disable();
      this.isOnboarded = false;
    } else {
      this.form.enable();
      this.isOnboarded = true;
    }
    if (this.isDeployedCandidate && !this.isAgency) {
      this.form.disable();
    }
  }

  private subscribeOnReasonsList(): void {
    this.rejectionReasonsList$.pipe(takeUntil(this.unsubscribe$)).subscribe((reasons) => {
      this.rejectReasons = reasons;
    });
  }

  private checkRejectReason(): void {
    if (this.candidate.status === ApplicantStatusEnum.Rejected) {
      this.isRejected = true;
      this.form.disable();
    }
  }

  private subscribeOnSuccessRejection(): void {
    this.actions$
      .pipe(ofActionSuccessful(RejectCandidateForOrganisationSuccess), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.form.disable();
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
  }

  private subscribeOnUpdateOrganisationCandidateJobError(): void {
    this.actions$
      .pipe(ofActionSuccessful(ShowToast))
      .pipe(
        filter((error) => error.type === MessageTypes.Error),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => this.jobStatusControl.reset());
  }

  private subscribeOnGetStatus(): void {
    this.applicantStatuses$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: ApplicantStatus[]) => (this.nextApplicantStatuses = data));
  }

  private handleOnboardedCandidate(event: { itemData: { applicantStatus: ApplicantStatus } }): void {
    if (event.itemData?.applicantStatus === ApplicantStatusEnum.OnBoarded) {
      this.onAccept();
    } else {
      this.store.dispatch(new GetRejectReasonsForOrganisation());
      this.openRejectDialog.next(true);
    }
  }
  private createForm(): void {
    this.form = new FormGroup({
      jobId: new FormControl(''),
      date: new FormControl(''),
      billRates: new FormControl(''),
      candidates: new FormControl(''),
      candidateBillRate: new FormControl(''),
      locationName: new FormControl(''),
      avStartDate: new FormControl(''),
      yearExp: new FormControl(''),
      travelExp: new FormControl(''),
      comments: new FormControl(''),
      workWeek: new FormControl('', [Validators.maxLength(50)]),
      clockId: new FormControl('', [Validators.maxLength(50)]),
      offeredBillRate: new FormControl(''),
      allow: new FormControl(false),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      rejectReason: new FormControl(''),
      offeredStartDate: new FormControl(''),
    });

    this.jobStatusControl = new FormControl('');
  }
}
