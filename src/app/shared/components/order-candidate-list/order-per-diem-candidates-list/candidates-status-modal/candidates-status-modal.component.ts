import { ApplyOrderApplicants, ReloadOrderCandidatesLists } from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApplicantStatus as ApplicantStatusEnum, ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { OrderApplicantsInitialData } from '@shared/models/order-applicants.model';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import {
  GetRejectReasonsForOrganisation,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
} from '@client/store/order-managment-content.actions';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { RejectReason } from '@shared/models/reject-reason.model';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';

@Component({
  selector: 'app-candidates-status-modal',
  templateUrl: './candidates-status-modal.component.html',
  styleUrls: ['./candidates-status-modal.component.scss'],
})
export class CandidatesStatusModalComponent implements OnInit, OnDestroy {
  @Select(OrderManagementContentState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;
  @Select(OrderManagementContentState.applicantStatuses)
  applicantStatuses$: Observable<ApplicantStatus[]>;

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Input() candidate: OrderCandidatesList;
  @Input() openEvent: Subject<boolean>;
  @Input() isAgency: boolean = false;

  @Input() set candidateJob(orderCandidateJob: OrderCandidateJob | null) {
    this.candidateJobList = orderCandidateJob;
    if (orderCandidateJob) {
      this.setValueForm(orderCandidateJob);
    } else {
      this.form?.reset();
    }
  }

  get showRejectButton(): boolean {
    return !this.isAgency && [ApplicantStatus.Accepted, ApplicantStatus.OnBoarded].includes(this.candidate.status);
  }

  get isRejected(): boolean {
    return [ApplicantStatus.Rejected].includes(this.candidate?.status);
  }

  get showOnboardButton(): boolean {
    return !this.isAgency && [ApplicantStatus.Accepted, ApplicantStatus.OnBoarded].includes(this.candidate.status);
  }

  get showApplyButton(): boolean {
    return [ApplicantStatus.NotApplied].includes(this.candidate?.status);
  }

  get showClockId(): boolean {
    return ![
      ApplicantStatus.NotApplied,
      ApplicantStatus.Applied,
      ApplicantStatus.Shortlisted,
      ApplicantStatus.Offered,
      ApplicantStatus.PreOfferCustom,
      ApplicantStatus.Rejected,
    ].includes(this.candidate?.status);
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

  private unsubscribe$: Subject<void> = new Subject();
  private candidateJobList: OrderCandidateJob | null;
  private orderApplicantsInitialData: OrderApplicantsInitialData | null;

  constructor(private formBuilder: FormBuilder, private store: Store, private actions$: Actions) {}

  ngOnInit(): void {
    this.subscribeOnGetStatus();
    this.onOpenEvent();
    this.createForm();
    this.subscribeOnInitialData();
    this.subscribeOnReasonsList();
    this.subscribeOnSuccessRejection();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public closeDialog(): void {
    this.orderApplicantsInitialData = null;
    this.sideDialog.hide();
    this.openEvent.next(false);
  }

  public onOnboard(): void {
    if (this.form.valid && this.candidateJobList) {
      const value = this.form.getRawValue();
      //TODO: uncomment code, whe be is done
      /*this.store.dispatch(new UpdateOrganisationCandidateJob({})).subscribe(() => {
        //add action to update list and grid
      });*/
    }
  }

  public onDropDownChanged(event: { itemData: { applicantStatus: ApplicantStatus } }): void {
    if (event.itemData?.applicantStatus === ApplicantStatusEnum.Rejected) {
      this.store.dispatch(new GetRejectReasonsForOrganisation());
      this.openRejectDialog.next(true);
    }
  }

  public onRejectCandidate(event: { rejectReason: number }): void {
    if (this.candidateJobList) {
      const payload = {
        organizationId: this.candidateJobList.organizationId,
        jobId: this.candidateJobList.jobId,
        rejectReasonId: event.rejectReason,
      };

      const value = this.rejectReasons.find((reason: RejectReason) => reason.id === event.rejectReason)?.reason;
      this.form.patchValue({ rejectReason: value });
      this.store.dispatch(new RejectCandidateJob(payload));
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
    this.rejectionReasonsList$.pipe(takeUntil(this.unsubscribe$)).subscribe((reasons: RejectReason[]) => {
      this.rejectReasons = reasons;
    });
  }

  private subscribeOnSuccessRejection(): void {
    this.actions$
      .pipe(ofActionSuccessful(RejectCandidateForOrganisationSuccess), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.form.disable();
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
  }

  private setValueForm(orderCandidateJob: OrderCandidateJob): void {
    this.form?.patchValue({
      jobId: orderCandidateJob.orderId,
      locationName: orderCandidateJob.order.locationName,
      department: orderCandidateJob.order.departmentName,
      skill: orderCandidateJob.order.skillName,
      clockId: orderCandidateJob.clockId,
      allow: orderCandidateJob.allowDeployCredentials,
      rejectReason: orderCandidateJob.rejectReason,
    });
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
          // TODO: add skill when BE is ready
          this.form?.patchValue({
            jobId: data.orderId,
            locationName: data.locationName,
            department: data.departmentName,
          });
        }
      });
  }
}
