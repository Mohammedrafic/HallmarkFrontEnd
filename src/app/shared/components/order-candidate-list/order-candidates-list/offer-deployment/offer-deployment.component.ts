import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { SET_READONLY_STATUS } from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { Observable, Subject, takeUntil } from 'rxjs';

import { BillRate } from '@shared/models/bill-rate.model';
import { ApplicantStatus, OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import {
  GetOrganisationCandidateJob,
  GetRejectReasonsForOrganisation,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  UpdateOrganisationCandidateJob,
} from '@client/store/order-managment-content.actions';

import { ApplicantStatus as ApplicantStatusEnum, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { BillRatesComponent } from '@shared/components/bill-rates/bill-rates.component';
import { RejectReason } from '@shared/models/reject-reason.model';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import { AccordionClickArgs, ExpandEventArgs } from '@syncfusion/ej2-navigations';
import { ShowToast } from 'src/app/store/app.actions';
import { AccordionOneField } from '@shared/models/accordion-one-field.model';
import PriceUtils from '@shared/utils/price.utils';
import { toCorrectTimezoneFormat } from '@shared/utils/date-time.utils';

@Component({
  selector: 'app-offer-deployment',
  templateUrl: './offer-deployment.component.html',
  styleUrls: ['./offer-deployment.component.scss'],
  providers: [MaskedDateTimeService],
})
export class OfferDeploymentComponent implements OnInit, OnDestroy, OnChanges {
  @Select(OrderManagementContentState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  @ViewChild('billRates') billRatesComponent: BillRatesComponent;
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Output() public closeDialogEmitter: EventEmitter<void> = new EventEmitter();

  @Input() candidate: OrderCandidatesList;
  @Input() isTab: boolean = false;
  @Input() isAgency: boolean = false;

  public openRejectDialog = new Subject<boolean>();
  public billRatesData: BillRate[] = [];
  public formGroup: FormGroup;
  public nextApplicantStatuses: ApplicantStatus[];
  public optionFields = { text: 'statusText', value: 'statusText' };
  public rejectReasons: RejectReason[] = [];
  public isRejected = false;
  public candidatStatus = CandidatStatus;
  public candidateJob: OrderCandidateJob | null;
  public today = new Date();
  public accordionClickElement: HTMLElement | null;
  public accordionOneField: AccordionOneField;
  public priceUtils = PriceUtils;

  get showYearsOfExperience(): boolean {
    return (
      this.candidate.status === ApplicantStatusEnum.Applied ||
      this.candidate.status === ApplicantStatusEnum.Shortlisted ||
      this.candidate.status === ApplicantStatusEnum.PreOfferCustom
    );
  }

  get showGuaranteedWorkWeek(): boolean {
    return (
      this.candidate.status === ApplicantStatusEnum.Applied ||
      this.candidate.status === ApplicantStatusEnum.Shortlisted ||
      this.candidate.status === ApplicantStatusEnum.PreOfferCustom ||
      this.candidate.status === ApplicantStatusEnum.Offered
    );
  }

  get isReadOnly(): boolean {
    return this.isRejected || this.readOnlyMode;
  }

  get isReadOnlyBillRates(): boolean {
    return this.candidate.status === ApplicantStatusEnum.Withdraw || this.isRejected;
  }

  get isDeployedCandidate(): boolean {
    return !!this.candidate.deployedCandidateInfo && this.candidate.status !== ApplicantStatusEnum.OnBoarded;
  }

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;
  @Select(OrderManagementContentState.applicantStatuses)
  applicantStatuses$: Observable<ApplicantStatus[]>;

  private unsubscribe$: Subject<void> = new Subject();
  private currentApplicantStatus: ApplicantStatus;
  private readOnlyMode: boolean;

  constructor(private store: Store, private actions$: Actions) {}

  public ngOnChanges(changes: SimpleChanges): void {
    this.readOnlyMode =
      changes['candidate']?.currentValue.status === ApplicantStatusEnum.Withdraw ||
      changes['candidate']?.currentValue.status === ApplicantStatusEnum.Rejected;

    this.checkRejectReason();
  }

  public ngOnInit(): void {
    this.today.setHours(0);
    this.createForm();
    this.subscribeOnInitialData();
    this.subscribeOnSuccessRejection();
    this.subscribeOnReasonsList();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public closeDialog(): void {
    this.closeDialogEmitter.next();
    this.nextApplicantStatuses = [];
    this.billRatesData = [];
    this.candidateJob = null;
    this.isRejected = false;
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
      this.formGroup.patchValue({ rejectReason: value });
      this.store.dispatch(new RejectCandidateJob(payload));
      this.closeDialog();
    }
  }

  public updateCandidateJob(event: { itemData: ApplicantStatus }, reloadJob = false): void {
    console.log(event)
    if (event.itemData?.isEnabled) {
      console.log(event.itemData?.isEnabled)
      if (event.itemData?.applicantStatus === ApplicantStatusEnum.Rejected) {
        this.store.dispatch(new GetRejectReasonsForOrganisation());
        this.openRejectDialog.next(true);
      } else {
        console.log(this.formGroup, this.formGroup.errors)
        if (!this.formGroup.errors && this.candidateJob) {
          const value = this.formGroup.getRawValue();
          this.store
            .dispatch(
              new UpdateOrganisationCandidateJob({
                orderId: this.candidateJob.orderId,
                organizationId: this.candidateJob.organizationId,
                jobId: this.candidateJob.jobId,
                nextApplicantStatus: event.itemData,
                candidateBillRate: this.candidateJob.candidateBillRate,
                offeredBillRate: value.offeredBillRate,
                requestComment: this.candidateJob.requestComment,
                actualStartDate: this.candidateJob.actualStartDate,
                actualEndDate: this.candidateJob.actualEndDate,
                clockId: this.candidateJob.clockId,
                guaranteedWorkWeek: value.guaranteedWorkWeek,
                offeredStartDate: toCorrectTimezoneFormat(value.offeredStartDate),
                allowDeployWoCredentials: true,
                billRates: this.billRatesComponent.billRatesControl.value,
              })
            )
            .subscribe(() => {
              this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
              if (reloadJob) {
                this.store.dispatch(
                  new GetOrganisationCandidateJob(
                    this.candidateJob?.organizationId as number,
                    this.candidate.candidateJobId
                  )
                );
              }
            });
          if (!reloadJob) {
            this.closeDialog();
          }
        }
      }
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, SET_READONLY_STATUS));
    }
  }

  public onBillRatesChanged(): void {
    this.updateCandidateJob({ itemData: this.currentApplicantStatus }, true);
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
      jobId: new FormControl(null),
      jobDate: new FormControl(''),
      offeredBillRate: new FormControl(null, [Validators.required]),
      orderBillRate: new FormControl(null),
      locationName: new FormControl(''),
      availableStartDate: new FormControl(''),
      candidateBillRate: new FormControl(null),
      requestComment: new FormControl(''),
      rejectReason: new FormControl(''),
      yearsOfExperience: new FormControl(''),
      expAsTravelers: new FormControl(''),
      guaranteedWorkWeek: new FormControl('', [Validators.maxLength(200)]),
      offeredStartDate: new FormControl(''),
    });
  }

  private setFormValue(data: OrderCandidateJob): void {
    this.formGroup.setValue({
      jobId: data.jobId,
      jobDate: [data.order.jobStartDate, data.order.jobEndDate],
      offeredBillRate: PriceUtils.formatNumbers(data.offeredBillRate || data.order.hourlyRate),
      orderBillRate: data.order.hourlyRate && PriceUtils.formatNumbers(data.order.hourlyRate),
      locationName: data.order.locationName,
      availableStartDate: data.availableStartDate,
      candidateBillRate: PriceUtils.formatNumbers(data.candidateBillRate),
      requestComment: data.requestComment,
      rejectReason: data.rejectReason,
      yearsOfExperience: data.yearsOfExperience,
      expAsTravelers: data.expAsTravelers,
      guaranteedWorkWeek: data.guaranteedWorkWeek,
      offeredStartDate: data.offeredStartDate || data.order.jobStartDate,
    });
  }

  private subscribeOnInitialData(): void {
    this.candidateJobState$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: OrderCandidateJob) => {
      this.candidateJob = data;

      if (data) {
        this.currentApplicantStatus = data.applicantStatus;
        this.billRatesData = [...data.billRates];
        this.setFormValue(data);
      }
    });
    this.applicantStatuses$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: ApplicantStatus[]) => (this.nextApplicantStatuses = data));

    if (this.isDeployedCandidate) {
      this.formGroup.disable();
    }
  }

  private subscribeOnSuccessRejection(): void {
    this.actions$
      .pipe(ofActionSuccessful(RejectCandidateForOrganisationSuccess), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.formGroup.disable();
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
  }

  private subscribeOnReasonsList(): void {
    this.rejectionReasonsList$.pipe(takeUntil(this.unsubscribe$)).subscribe((reasons) => {
      this.rejectReasons = reasons;
    });
  }

  private checkRejectReason(): void {
    if (this.candidate.status === ApplicantStatusEnum.Rejected) {
      this.isRejected = true;
    }
  }
}
