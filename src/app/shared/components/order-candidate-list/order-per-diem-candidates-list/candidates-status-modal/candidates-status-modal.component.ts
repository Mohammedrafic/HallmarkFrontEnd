import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { merge, Observable, Subject, takeUntil } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { ApplicantStatus as ApplicantStatusEnum } from '@shared/enums/applicant-status.enum';
import { OrderApplicantsInitialData } from '@shared/models/order-applicants.model';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
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
import { ApplicantStatus, OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import {
  ApplyOrderApplicants,
  GetRejectReasonsForAgency,
  RejectCandidateForAgencySuccess,
  RejectCandidateJob as RejectAgencyCandidateJob,
  ReloadOrderCandidatesLists,
  UpdateAgencyCandidateJob,
} from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { AccordionOneField } from '../../../../models/accordion-one-field.model';
import { AccordionClickArgs, ExpandEventArgs } from '@syncfusion/ej2-navigations';

@Component({
  selector: 'app-candidates-status-modal',
  templateUrl: './candidates-status-modal.component.html',
  styleUrls: ['./candidates-status-modal.component.scss'],
})
export class CandidatesStatusModalComponent implements OnInit, OnDestroy {
  @Select(OrderManagementContentState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  @Select(OrderManagementState.rejectionReasonsList)
  agencyRejectionReasonsList$: Observable<RejectReason[]>;

  @Select(OrderManagementContentState.applicantStatuses)
  applicantStatuses$: Observable<ApplicantStatus[]>;

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Input() candidate: OrderCandidatesList;
  @Input() openEvent: Subject<boolean>;
  @Input() isAgency: boolean = false;
  @Input() isLocked: boolean | undefined = false;

  @Input() set candidateJob(orderCandidateJob: OrderCandidateJob | null) {
    this.orderCandidateJob = orderCandidateJob;
    if (orderCandidateJob) {
      this.setValueForm(orderCandidateJob);
    } else {
      this.form?.reset();
    }
  }

  get showRejectButton(): boolean {
    return (
      this.isAgency && [ApplicantStatusEnum.Offered, ApplicantStatusEnum.Accepted].includes(this.candidate?.status)
    );
  }

  get showWithdrawButton(): boolean {
    return (
      this.isAgency &&
      [ApplicantStatusEnum.Shortlisted, ApplicantStatusEnum.PreOfferCustom].includes(this.candidate?.status)
    );
  }

  get showDropdown(): boolean {
    return !this.isRejected && !this.isAgency && !this.isOnboard && !this.isWithdraw;
  }

  get isRejected(): boolean {
    return [ApplicantStatusEnum.Rejected].includes(this.candidate?.status);
  }

  get isWithdraw(): boolean {
    return [ApplicantStatusEnum.Withdraw].includes(this.candidate?.status);
  }

  get showAcceptButton(): boolean {
    return this.isAgency && [ApplicantStatusEnum.Offered].includes(this.candidate?.status);
  }

  get showApplyButton(): boolean {
    return (
      this.isAgency && [ApplicantStatusEnum.NotApplied, ApplicantStatusEnum.Withdraw].includes(this.candidate?.status)
    );
  }

  get showClockId(): boolean {
    return [ApplicantStatusEnum.Accepted, ApplicantStatusEnum.OnBoarded].includes(this.candidate?.status);
  }

  get isOnboard(): boolean {
    return [ApplicantStatusEnum.OnBoarded].includes(this.candidate?.status);
  }

  @Select(OrderManagementState.orderApplicantsInitialData)
  public orderApplicantsInitialData$: Observable<OrderApplicantsInitialData>;

  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  public form: FormGroup;
  public openRejectDialog = new Subject<boolean>();
  public rejectReasons: RejectReason[] = [];
  public optionFields = { text: 'statusText', value: 'applicantStatus' };
  public nextApplicantStatuses: ApplicantStatus[];
  public orderCandidateJob: OrderCandidateJob | null;
  public accordionClickElement: HTMLElement | null;
  public accordionOneField: AccordionOneField;

  private unsubscribe$: Subject<void> = new Subject();
  private orderApplicantsInitialData: OrderApplicantsInitialData | null;

  constructor(private formBuilder: FormBuilder, private store: Store, private actions$: Actions) {}

  ngOnInit(): void {
    this.subscribeOnGetStatus();
    this.onOpenEvent();
    this.createForm();
    this.subscribeOnInitialData();
    this.subscribeOnReasonsList();
    this.subscribeOnSuccessRejection();
    this.subscribeOnUpdateCandidateJobSucceed();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public closeDialog(): void {
    this.orderApplicantsInitialData = null;
    this.sideDialog.hide();
    this.openEvent.next(false);
    this.nextApplicantStatuses = [];
  }

  public onReject(): void {
    this.store.dispatch(this.isAgency ? new GetRejectReasonsForAgency() : new GetRejectReasonsForOrganisation());
    this.openRejectDialog.next(true);
  }

  public onDropDownChanged(event: { itemData: { applicantStatus: ApplicantStatusEnum; statusText: string } }): void {
    if (event.itemData?.applicantStatus === ApplicantStatusEnum.Rejected) {
      this.onReject();
    } else {
      this.updateOrganizationCandidateJob(event.itemData);
    }
  }

  public applyReject(event: { rejectReason: number }): void {
    if (this.orderCandidateJob) {
      const payload = {
        organizationId: this.orderCandidateJob.organizationId,
        jobId: this.orderCandidateJob.jobId,
        rejectReasonId: event.rejectReason,
      };

      const value = this.rejectReasons.find((reason: RejectReason) => reason.id === event.rejectReason)?.reason;
      this.form.patchValue({ rejectReason: value });
      this.store.dispatch(this.isAgency ? new RejectAgencyCandidateJob(payload) : new RejectCandidateJob(payload));
      this.closeDialog();
    }
  }

  public onApply(): void {
    if (this.orderApplicantsInitialData) {
      this.store
        .dispatch(
          new ApplyOrderApplicants({
            orderId: this.orderApplicantsInitialData.orderId,
            organizationId: this.orderApplicantsInitialData.organizationId,
            candidateId: this.orderApplicantsInitialData.candidateId,
          })
        )
        .subscribe(() => {
          this.store.dispatch(new ReloadOrderCandidatesLists());
        });
      this.closeDialog();
    }
  }

  public onAccept(): void {
    this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Accepted, statusText: 'Accepted' });
  }

  public clickedOnAccordion(accordionClick: AccordionClickArgs): void {
    this.accordionOneField = new AccordionOneField(this.accordionComponent);
    this.accordionClickElement = this.accordionOneField.clickedOnAccordion(accordionClick);
  }

  public toForbidExpandSecondRow(expandEvent: ExpandEventArgs): void {
    this.accordionOneField = new AccordionOneField(this.accordionComponent);
    this.accordionOneField.toForbidExpandSecondRow(expandEvent, this.accordionClickElement);
  }

  public onWithdraw(): void {
    this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Withdraw, statusText: 'Withdraw' });
  }

  private updateOrganizationCandidateJob(status: { applicantStatus: ApplicantStatusEnum; statusText: string }): void {
    if (this.form.valid && this.orderCandidateJob) {
      const value = this.form.getRawValue();

      this.store
        .dispatch(
          new UpdateOrganisationCandidateJob({
            organizationId: this.orderCandidateJob.organizationId,
            orderId: this.orderCandidateJob.orderId,
            jobId: value.jobId,
            clockId: value.clockId,
            allowDeployWoCredentials: value.allow,
            nextApplicantStatus: {
              applicantStatus: status.applicantStatus,
              statusText: status.statusText,
            },
          })
        )
        .subscribe({
          next: () => this.store.dispatch(new ReloadOrganisationOrderCandidatesLists()),
          error: () => this.closeDialog(),
          complete: () => this.closeDialog(),
        });
    }
  }

  private updateAgencyCandidateJob(applicantStatus: ApplicantStatus): void {
    if (this.orderCandidateJob) {
      this.store
        .dispatch(
          new UpdateAgencyCandidateJob({
            organizationId: this.orderCandidateJob.organizationId,
            jobId: this.orderCandidateJob.jobId,
            orderId: this.orderCandidateJob.orderId,
            nextApplicantStatus: applicantStatus,
          })
        )
        .subscribe(() => {
          this.store.dispatch(new ReloadOrderCandidatesLists());
        });
      this.closeDialog();
    }
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.unsubscribe$)).subscribe((isOpen: boolean) => {
      if (isOpen) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      jobId: [''],
      locationName: [''],
      department: [''],
      skill: [''],
      clockId: ['', [Validators.maxLength(50)]],
      allow: [false],
      rejectReason: [''],
    });
  }

  private subscribeOnReasonsList(): void {
    merge(this.rejectionReasonsList$, this.agencyRejectionReasonsList$)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((reasons: RejectReason[]) => {
        this.rejectReasons = reasons;
      });
  }

  private subscribeOnSuccessRejection(): void {
    this.actions$
      .pipe(ofActionSuccessful(RejectCandidateForOrganisationSuccess), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });

    this.actions$
      .pipe(ofActionSuccessful(RejectCandidateForAgencySuccess), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.store.dispatch(new ReloadOrderCandidatesLists());
      });
  }

  private setValueForm(orderCandidateJob: OrderCandidateJob): void {
    this.form?.patchValue({
      jobId: orderCandidateJob.jobId,
      locationName: orderCandidateJob.order.locationName,
      department: orderCandidateJob.order.departmentName,
      skill: orderCandidateJob.order.skillName,
      clockId: orderCandidateJob.clockId,
      allow: orderCandidateJob.allowDeployCredentials,
      rejectReason: orderCandidateJob.rejectReason,
    });
  }

  private subscribeOnUpdateCandidateJobSucceed(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(UpdateOrganisationCandidateJobSucceed))
      .subscribe(() => this.closeDialog());
  }

  private subscribeOnGetStatus(): void {
    this.applicantStatuses$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: ApplicantStatus[]) => (this.nextApplicantStatuses = data));
  }

  private subscribeOnInitialData(): void {
    this.orderApplicantsInitialData$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: OrderApplicantsInitialData) => {
        if (data) {
          this.orderApplicantsInitialData = data;
          this.form?.patchValue({
            jobId: data.orderId,
            locationName: data.locationName,
            department: data.departmentName,
            skill: data.skill,
          });
        }
      });
  }
}
