import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { merge, Observable, Subject, take, takeUntil } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { ApplicantStatus as ApplicantStatusEnum, ConfigurationValues } from '@shared/enums/applicant-status.enum';
import { OrderApplicantsInitialData } from '@shared/models/order-applicants.model';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import {
  GetRejectReasonsForOrganisation,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  sendOnboardCandidateEmailMessage,
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
import { CandidatePayRateSettings } from '@shared/constants/candidate-pay-rate-settings';
import { ShowGroupEmailSideDialog, ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { CandidateDOBRequired, CandidateSSNRequired, CandidatePHONE1Required, CandidateADDRESSRequired, ONBOARD_CANDIDATE, onBoardCandidateMessage, SEND_EMAIL } from '@shared/constants';
import { CommonHelper } from '@shared/helpers/common.helper';
import { PermissionService } from 'src/app/security/services/permission.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';
import { OnboardCandidateMessageDialogComponent } from '../../order-candidates-list/onboarded-candidate/onboard-candidate-message-dialog/onboard-candidate-message-dialog.component';

@Component({
  selector: 'app-candidates-status-modal',
  templateUrl: './candidates-status-modal.component.html',
  styleUrls: ['./candidates-status-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidatesStatusModalComponent implements OnInit, OnDestroy, OnChanges {
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
  public payRateSetting = CandidatePayRateSettings;

  @Input() openEvent: Subject<boolean>;
  @Input() isAgency: boolean = false;
  @Input() isLocked: boolean | undefined = false;
  @Input() actionsAllowed: boolean;
  @Input() isCandidatePayRateVisible: boolean;

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

  get showCandidatePayRateField(): boolean {
    return ![ApplicantStatusEnum.NotApplied, ApplicantStatusEnum.Applied].includes(this.orderCandidate?.status);
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

  get candidatePayRateRequired(): boolean {
    return this.showAcceptButton && this.isAgency && this.isCandidatePayRateVisible;
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
  public canCreateOrder: boolean;
  private unsubscribe$: Subject<void> = new Subject();
  private orderApplicantsInitialData: OrderApplicantsInitialData | null;
  public candidateSSNRequired :boolean=false;
  public candidateDOBRequired :boolean;
  public candidatePhone1RequiredValue : string = '';
  public candidateAddressRequiredValue : string = '';

  get templateEmailTitle(): string {
    return "Onboarding Email";
  }
  isSend:boolean = false;
  public sendOnboardMessageEmailFormGroup: FormGroup;
  emailTo:any = '';
  isSendOnboardFormInvalid:boolean = false;
  @ViewChild('RTE')
  public rteEle: RichTextEditorComponent;
  @ViewChild(OnboardCandidateMessageDialogComponent, { static: true }) onboardEmailTemplateForm: OnboardCandidateMessageDialogComponent;
  

  constructor(private formBuilder: FormBuilder, private store: Store, private actions$: Actions, private commentsService: CommentsService, private cd: ChangeDetectorRef, private permissionService : PermissionService,private confirmService: ConfirmService,) {
    this.sendOnboardMessageEmailFormGroup = new FormGroup({
      emailSubject: new FormControl('', [Validators.required]),
      emailBody: new FormControl('', [Validators.required]),
      fileUpload: new FormControl(null),
      emailTo: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.subscribeOnPermissions();
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

  public ngOnChanges(): void {
    this.adjustCandidatePayRateControl();
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
      .getComments(this.orderCandidateJob?.commentContainerId as number, null).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe((comments: Comment[]) => {
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
      if (this.candidateSSNRequired) {
        if (!this.form.controls["ssn"].value) {
          this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateSSNRequired));
          return;
        }
      }
      if(this.candidatePhone1RequiredValue === ConfigurationValues.Apply){
        if(this.orderApplicantsInitialData?.candidateProfileContactDetails != null){
            if(this.orderApplicantsInitialData?.candidateProfileContactDetails.phone1 === null
                || this.orderApplicantsInitialData?.candidateProfileContactDetails.phone1 === ''){
              this.store.dispatch(new ShowToast(MessageTypes.Error, CandidatePHONE1Required(ConfigurationValues.Apply)));
              return;
            }
        }else{
          this.store.dispatch(new ShowToast(MessageTypes.Error, CandidatePHONE1Required(ConfigurationValues.Apply)));
          return;
        }
      }

      if(this.candidateAddressRequiredValue === ConfigurationValues.Apply){
        if(this.orderApplicantsInitialData?.candidateProfileContactDetails != null){
            if(CommonHelper.candidateAddressCheck(this.orderApplicantsInitialData?.candidateProfileContactDetails)){
                this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateADDRESSRequired(ConfigurationValues.Apply)));
                return;
            }
        }else{
          this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateADDRESSRequired(ConfigurationValues.Apply)));
          return;
        }
      }
      this.store
        .dispatch(
          new ApplyOrderApplicants({
            orderId: this.orderApplicantsInitialData.orderId,
            organizationId: this.orderApplicantsInitialData.organizationId,
            candidateId: this.orderApplicantsInitialData.candidateId,
            candidatePayRate: this.orderApplicantsInitialData.candidatePayRate,
          })
        ).pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
          this.store.dispatch(new ReloadOrderCandidatesLists());
        });
      this.closeDialog();
    }
  }

  public onAccept(): void {
    if(this.candidateDOBRequired){
      if(!this.form.controls["dob"].value){
        this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateDOBRequired));
        return;
      }
    }
    if(this.candidatePhone1RequiredValue === ConfigurationValues.Accept){
      if(this.orderCandidateJob?.candidateProfileContactDetails != null){
          if(this.orderCandidateJob?.candidateProfileContactDetails.phone1 === null
              || this.orderCandidateJob?.candidateProfileContactDetails.phone1 === ''){
            this.store.dispatch(new ShowToast(MessageTypes.Error, CandidatePHONE1Required(ConfigurationValues.Accept)));
            return;
          }
      }else{
          this.store.dispatch(new ShowToast(MessageTypes.Error, CandidatePHONE1Required(ConfigurationValues.Accept)));
          return;
        }
    }


    if (this.candidatePayRateRequired && this.form.get('candidatePayRate')?.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if(this.candidateAddressRequiredValue === ConfigurationValues.Accept){
      if(this.orderCandidateJob?.candidateProfileContactDetails != null){
          if(CommonHelper.candidateAddressCheck(this.orderCandidateJob?.candidateProfileContactDetails)){
              this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateADDRESSRequired(ConfigurationValues.Accept)));
              return;
          }
      }else{
        this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateADDRESSRequired(ConfigurationValues.Accept)));
        return;
      }
    }

    this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Accepted, statusText: 'Accepted' });
  }

  public onWithdraw(): void {
    this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Withdraw, statusText: 'Withdraw' });
  }

  private updateOrganizationCandidateJob(status: { applicantStatus: ApplicantStatusEnum; statusText: string } | null): void {
    if (this.form.valid && this.orderCandidateJob) {
      const value = this.form.getRawValue();
      this.isSend =  true;
      this.emailTo = this.orderCandidateJob?.candidateProfile.email; 
      this.sendOnboardMessageEmailFormGroup.get('emailTo')?.setValue(this.orderCandidateJob?.candidateProfile.email);
      
      this.store
        .dispatch(
          new UpdateOrganisationCandidateJob({
            organizationId: this.orderCandidateJob.organizationId,
            orderId: this.orderCandidateJob.orderId,
            jobId: this.orderCandidateJob.jobId,
            clockId: value.clockId,
            allowDeployWoCredentials: value.allow,
            nextApplicantStatus: this.selectedApplicantStatus || this.orderCandidateJob.applicantStatus,
            candidatePayRate: value.candidatePayRate,
          })
        ).pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          // next: () => this.store.dispatch(new ReloadOrganisationOrderCandidatesLists()),
            error: () => this.closeDialog(),
          //  complete: () => this.closeDialog(),
        });
    }
  }

  private updateAgencyCandidateJob(applicantStatus: ApplicantStatus): void {
    if (this.orderCandidateJob) {
      const value = this.form.getRawValue();
      this.store
        .dispatch(
          new UpdateAgencyCandidateJob({
            organizationId: this.orderCandidateJob.organizationId,
            jobId: this.orderCandidateJob.jobId,
            orderId: this.orderCandidateJob.orderId,
            nextApplicantStatus: applicantStatus,
            candidatePayRate: value.candidatePayRate,
          })
        ).pipe(takeUntil(this.unsubscribe$))
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
      candidatePayRate: [{ value: null, disabled: true }, [Validators.required]],
      dob:[''],
      ssn: [''],
    });
  }

  private subscribeOnReasonsList(): void {
    merge(this.rejectionReasonsList$, this.agencyRejectionReasonsList$)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((reasons: RejectReason[]) => {
        this.rejectReasons = reasons;
        this.cd.markForCheck();
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
      candidatePayRate: orderCandidateJob.candidatePayRate,
      dob:orderCandidateJob.candidateProfile.dob,
      ssn:orderCandidateJob.candidateProfile.ssn,
    });
    this.candidateDOBRequired=orderCandidateJob.candidateDOBRequired;
    this.candidateSSNRequired=orderCandidateJob.candidateSSNRequired;
    if(orderCandidateJob.candidatePhone1Required != null){
      let phone1Configuration = JSON.parse(orderCandidateJob.candidatePhone1Required);
      if(phone1Configuration.isEnabled){
        this.candidatePhone1RequiredValue = phone1Configuration.value;
      }
    }
    if(orderCandidateJob.candidateAddressRequired != null){
      let addressConfiguration = JSON.parse(orderCandidateJob.candidateAddressRequired);
      if(addressConfiguration.isEnabled){
        this.candidateAddressRequiredValue = addressConfiguration.value;
      }
    }
    this.cd.detectChanges();
  }

  private subscribeOnUpdateCandidateJobSucceed(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(UpdateOrganisationCandidateJobSucceed))
      .subscribe(() => 
      {
        if(this.selectedApplicantStatus?.applicantStatus === ApplicantStatusEnum.OnBoarded){
          const options = {
              title: ONBOARD_CANDIDATE,
              okButtonLabel: 'Yes',
              okButtonClass: 'ok-button',
              cancelButtonLabel: 'No'
          };
          this.confirmService.confirm(onBoardCandidateMessage, options).pipe(take(1))
              .subscribe((isConfirm) => {
                if(isConfirm){
                  this.onboardEmailTemplateForm.rteCreated();
                  this.onboardEmailTemplateForm.disableControls(true);
                  this.store.dispatch(new ShowGroupEmailSideDialog(true));
                }
                else{
                  this.store.dispatch(new ReloadOrganisationOrderCandidatesLists())
                  this.closeDialog();
                }
              });
        }else{
          this.store.dispatch(new ReloadOrganisationOrderCandidatesLists())
          this.closeDialog();
        }
      });
  }

  onGroupEmailAddCancel(){
    this.isSendOnboardFormInvalid = !this.sendOnboardMessageEmailFormGroup.valid;
    this.isSend =  false;
    this.store.dispatch(new ShowGroupEmailSideDialog(false));
    this.closeDialog();
    this.store.dispatch(new ReloadOrganisationOrderCandidatesLists())
  }

  onGroupEmailSend(){
    this.isSendOnboardFormInvalid = !this.sendOnboardMessageEmailFormGroup.valid;
    if(this.sendOnboardMessageEmailFormGroup.valid){
      const emailvalue = this.sendOnboardMessageEmailFormGroup.getRawValue();  
      this.store.dispatch(new sendOnboardCandidateEmailMessage({
            subjectMail : emailvalue.emailSubject,
            bodyMail : emailvalue.emailBody,
            toList : emailvalue.emailTo,
            status : 1,
            stream : emailvalue.fileUpload,
            extension : emailvalue.fileUpload?.type,
            documentName : emailvalue.fileUpload?.name,
          })
        )
        .subscribe(() => {
          this.isSend =  false;
          this.closeDialog();
          this.store.dispatch(new ShowGroupEmailSideDialog(false));  
          this.store.dispatch(new ShowToast(MessageTypes.Success, SEND_EMAIL));
          this.store.dispatch(new ReloadOrganisationOrderCandidatesLists())
        });
    }
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
          if(data.candidatePhone1Required != null){
            let phone1Configuration = JSON.parse(data.candidatePhone1Required);
            if(phone1Configuration.isEnabled){
              this.candidatePhone1RequiredValue = phone1Configuration.value;
            }
          }
          if(data.candidateAddressRequired != null){
            let addressConfiguration = JSON.parse(data.candidateAddressRequired);
            if(addressConfiguration.isEnabled){
              this.candidateAddressRequiredValue = addressConfiguration.value;
            }
          }
          if (data.candidateSSNRequired != null) {
            this.candidateSSNRequired = data.candidateSSNRequired;
          }
          this.orderApplicantsInitialData = data;
          this.form?.patchValue({
            jobId: data.orderId,
            locationName: data.locationName,
            department: data.departmentName,
            skill: data.skill,
            ssn: data.ssn
          });
        }
        this.cd.detectChanges();
      });
  }


  private adjustCandidatePayRateControl(): void {
    const candidatePayRateControl = this.form?.get('candidatePayRate');

    if(this.isCandidatePayRateVisible && this.showAcceptButton) {
      candidatePayRateControl?.enable();
    } else {
      candidatePayRateControl?.disable();
    }
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().subscribe(({ canCreateOrder}) => {
      this.canCreateOrder = canCreateOrder;
    });
  }

}
