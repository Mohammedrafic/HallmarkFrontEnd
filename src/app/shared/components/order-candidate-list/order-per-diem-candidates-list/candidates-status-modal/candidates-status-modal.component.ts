import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

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
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';

@Component({
  selector: 'app-candidates-status-modal',
  templateUrl: './candidates-status-modal.component.html',
  styleUrls: ['./candidates-status-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  @Input() set candidate(value: OrderCandidatesList) {
    this.orderCandidate = value;
    this.comments = [];
  };
  public orderCandidate: OrderCandidatesList;
  @Input() openEvent: Subject<boolean>;
  @Input() isAgency: boolean = false;
  @Input() isLocked: boolean | undefined = false;
  @Input() actionsAllowed: boolean;

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
      this.isAgency && [ApplicantStatusEnum.Offered, ApplicantStatusEnum.Accepted].includes(this.orderCandidate?.status)
    );
  }

  get showWithdrawButton(): boolean {
    return (
      this.isAgency &&
      [ApplicantStatusEnum.Shortlisted, ApplicantStatusEnum.PreOfferCustom].includes(this.orderCandidate?.status)
    );
  }

  get showDropdown(): boolean {
    return !this.isRejected && !this.isAgency && !this.isOnboard && !this.isWithdraw;
  }

  get isRejected(): boolean {
    return [ApplicantStatusEnum.Rejected].includes(this.orderCandidate?.status);
  }

  get isWithdraw(): boolean {
    return [ApplicantStatusEnum.Withdraw].includes(this.orderCandidate?.status);
  }

  get showAcceptButton(): boolean {
    return this.isAgency && [ApplicantStatusEnum.Offered].includes(this.orderCandidate?.status);
  }

  get showApplyButton(): boolean {
    return (
      this.isAgency && [ApplicantStatusEnum.NotApplied, ApplicantStatusEnum.Withdraw].includes(this.orderCandidate?.status)
    );
  }

  get showClockId(): boolean {
    return (
      [ApplicantStatusEnum.Accepted, ApplicantStatusEnum.OnBoarded].includes(this.orderCandidate?.status)
    );
  }

  get isOnboard(): boolean {
    return [ApplicantStatusEnum.OnBoarded].includes(this.orderCandidate?.status);
  }

  @Select(OrderManagementState.orderApplicantsInitialData)
  public orderApplicantsInitialData$: Observable<OrderApplicantsInitialData>;

  public statusesFormControl = new FormControl();
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  public form: FormGroup;
  public openRejectDialog = new Subject<boolean>();
  public rejectReasons: RejectReason[] = [];
  public optionFields = { text: 'statusText', value: 'statusText' };
  public nextApplicantStatuses: ApplicantStatus[];
  public orderCandidateJob: OrderCandidateJob | null;
  public comments: Comment[] = [];
  public selectedApplicantStatus: ApplicantStatus | null = null;

  private unsubscribe$: Subject<void> = new Subject();
  private orderApplicantsInitialData: OrderApplicantsInitialData | null;

  constructor(private formBuilder: FormBuilder, private store: Store, private actions$: Actions, private commentsService: CommentsService, private cd: ChangeDetectorRef) {}

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
    this.cd.detectChanges();
  }

  private getComments(): void {
    this.commentsService
      .getComments(this.orderCandidateJob?.commentContainerId as number, null)
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
        this.cd.detectChanges();
      });
  }

  public onReject(): void {
    this.store.dispatch(this.isAgency ? new GetRejectReasonsForAgency() : new GetRejectReasonsForOrganisation());
    this.openRejectDialog.next(true);
  }

  public onSave(): void {
    this.saveHandler({itemData: this.selectedApplicantStatus});
  }

  public onStatusChange(event: { itemData: ApplicantStatus }): void {
    this.selectedApplicantStatus = event.itemData;
  }

  public saveHandler(event: { itemData: { applicantStatus: ApplicantStatusEnum; statusText: string } | null }): void {
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

  public cancelRejectCandidate(): void {
    this.statusesFormControl.reset();
    this.selectedApplicantStatus = null;
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

  public onWithdraw(): void {
    this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Withdraw, statusText: 'Withdraw' });
  }

  private updateOrganizationCandidateJob(status: { applicantStatus: ApplicantStatusEnum; statusText: string } | null): void {
    if (this.form.valid && this.orderCandidateJob) {
      const value = this.form.getRawValue();

      this.store
        .dispatch(
          new UpdateOrganisationCandidateJob({
            organizationId: this.orderCandidateJob.organizationId,
            orderId: this.orderCandidateJob.orderId,
            jobId: this.orderCandidateJob.jobId,
            clockId: value.clockId,
            allowDeployWoCredentials: value.allow,
            nextApplicantStatus: this.selectedApplicantStatus || this.orderCandidateJob.applicantStatus,
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
    this.getComments();
    this.form?.patchValue({
      jobId: `${orderCandidateJob.organizationPrefix}-${orderCandidateJob.orderPublicId}`,
      locationName: orderCandidateJob.order.locationName,
      department: orderCandidateJob.order.departmentName,
      skill: orderCandidateJob.order.skillName,
      clockId: orderCandidateJob.clockId,
      allow: orderCandidateJob.allowDeployCredentials,
      rejectReason: orderCandidateJob.rejectReason,
    });
    this.cd.detectChanges();
  }

  private subscribeOnUpdateCandidateJobSucceed(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(UpdateOrganisationCandidateJobSucceed))
      .subscribe(() => this.closeDialog());
  }

  private subscribeOnGetStatus(): void {
    this.applicantStatuses$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: ApplicantStatus[]) => {
        this.nextApplicantStatuses = data;
        if (data?.length) {
          this.statusesFormControl.enable();
        } else {
          this.statusesFormControl.disable();
        }
        this.cd.detectChanges();
      });
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
        this.cd.detectChanges();
      });
  }
}
