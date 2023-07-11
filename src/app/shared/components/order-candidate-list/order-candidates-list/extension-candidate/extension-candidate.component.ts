import { DatePipe, formatNumber } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { ChangedEventArgs, MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { capitalize } from 'lodash';
import {
  EMPTY,
  Observable,
  Subject,
  combineLatest,
  filter,
  map,
  merge,
  mergeMap,
  take,
  takeUntil,
} from 'rxjs';

import {
  GetCandidateJob,
  GetRejectReasonsForAgency,
  RejectCandidateForAgencySuccess,
  RejectCandidateJob as RejectCandidateJobAgency,
  ReloadOrderCandidatesLists,
  UpdateAgencyCandidateJob,
} from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import {
  CancelOrganizationCandidateJob,
  CancelOrganizationCandidateJobSuccess,
  GetCandidateCancellationReason,
  GetOrganisationCandidateJob,
  GetRejectReasonsForOrganisation,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  ReloadOrganisationOrderCandidatesLists,
  UpdateOrganisationCandidateJob,
  sendOnboardCandidateEmailMessage,
} from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { CheckNumberValue, DateTimeHelper } from '@core/helpers';
import {
  CancellationReasonsMap,
  PenaltiesMap,
} from '@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants';
import {
  CandidateADDRESSRequired, CandidateDOBRequired, CandidatePHONE1Required,
  ONBOARD_CANDIDATE,
  OrganizationSettingKeys, OrganizationalHierarchy, SEND_EMAIL, onBoardCandidateMessage,
} from '@shared/constants';
import { CandidatePayRateSettings } from '@shared/constants/candidate-pay-rate-settings';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { UNSAVED_FORM_PROVIDERS, UnsavedFormComponentRef } from '@shared/directives/unsaved-form.directive';
import {
  ApplicantStatus as ApplicantStatusEnum, CandidatStatus,
  ConfigurationValues
} from '@shared/enums/applicant-status.enum';
import { PenaltyCriteria } from '@shared/enums/candidate-cancellation';
import { MessageTypes } from '@shared/enums/message-types';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { WorkflowStepType } from '@shared/enums/workflow-step-type';
import { CommonHelper } from '@shared/helpers/common.helper';
import { BillRate } from '@shared/models/bill-rate.model';
import { JobCancellation } from '@shared/models/candidate-cancellation.model';
import { Comment } from '@shared/models/comment.model';
import {
  ApplicantStatus,
  CandidateCancellationReason,
  CandidateCancellationReasonFilter,
  Order,
  OrderCandidateJob,
  OrderCandidatesList,
  OrderCandidatesListPage,
} from '@shared/models/order-management.model';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { RejectReason } from '@shared/models/reject-reason.model';
import { SettingsViewService } from '@shared/services';
import { CommentsService } from '@shared/services/comments.service';
import { DurationService } from '@shared/services/duration.service';
import PriceUtils from '@shared/utils/price.utils';
import { ShowGroupEmailSideDialog, ShowToast } from 'src/app/store/app.actions';
import { GetOrderPermissions } from 'src/app/store/user.actions';
import { UserState } from 'src/app/store/user.state';
import { PermissionService } from 'src/app/security/services/permission.service';
import { RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';
import { OnboardCandidateMessageDialogComponent } from '../onboarded-candidate/onboard-candidate-message-dialog/onboard-candidate-message-dialog.component';
import { ConfirmService } from '@shared/services/confirm.service';

interface IExtensionCandidate extends Pick<UnsavedFormComponentRef, 'form'> { }

@Component({
  selector: 'app-extension-candidate',
  templateUrl: './extension-candidate.component.html',
  styleUrls: ['../accept-candidate/accept-candidate.component.scss', './extension-candidate.component.scss'],
  providers: [MaskedDateTimeService, UNSAVED_FORM_PROVIDERS(ExtensionCandidateComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtensionCandidateComponent extends DestroyableDirective implements OnInit, IExtensionCandidate {
  @Input() currentOrder: Order;
  @Input() candidateOrder: OrderCandidatesListPage;
  @Input() dialogEvent: Subject<boolean>;
  @Input() isTab = false;
  @Input() actionsAllowed = true;
  @Input() hasCanEditOrderBillRatePermission: boolean;

  candidate$: Observable<OrderCandidatesList>;

  @Select(OrderManagementState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementContentState.orderCandidatePage)
  public clientOrderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(UserState.currentUserPermissions)
  orderPermissions$: Observable<CurrentUserPermission[]>;

  @Select(OrderManagementContentState.candidatesJob)
  private readonly candidatesJob$: Observable<OrderCandidateJob>;

  @Select(OrderManagementState.candidatesJob)
  private readonly candidateJobState$: Observable<OrderCandidateJob>;

  @Select(OrderManagementContentState.getCandidateCancellationReasons)
  candidateCancellationReasons$: Observable<CandidateCancellationReason[]>;

  public rejectReasons$: Observable<RejectReason[]>;
  public form: FormGroup;
  public statusesFormControl = new FormControl();
  public candidateJob: OrderCandidateJob;
  public candidatStatus = CandidatStatus;
  public workflowStepType = WorkflowStepType;
  public billRatesData: BillRate[] = [];
  public isReadOnly = false;
  public openRejectDialog = new Subject<boolean>();
  public openCandidateCancellationDialog = new Subject<void>();
  public priceUtils = PriceUtils;
  public optionFields = { text: 'statusText', value: 'applicantStatus', htmlAttributes: 'disabled' };
  public applicantStatuses: ApplicantStatus[] = [
    { applicantStatus: ApplicantStatusEnum.Rejected, statusText: 'Reject' },
  ];
  public isAgency = false;
  public showHoursControl = false;
  public showPercentage = false;
  public candidate: OrderCandidatesList | undefined;
  public comments: Comment[] = [];
  public orderPermissions: CurrentUserPermission[];
  public canShortlist = false;
  public canInterview = false;
  public canReject = false;
  public canOffer = false;
  public canOnboard = false;
  public canClose = false;
  public payRateSetting = CandidatePayRateSettings;
  public selectedApplicantStatus: ApplicantStatus | null = null;
  public isCandidatePayRateVisible: boolean;
  public canCreateOrder : boolean;

  public applicantStatusEnum = ApplicantStatusEnum;
  public candidateSSNRequired: boolean;
  public candidateDOBRequired: boolean;
  public candidatePhone1RequiredValue = '';
  public candidateAddressRequiredValue = '';
  public candidateCancellationReasons: CandidateCancellationReason[] | null;
  private readonly applicantStatusTypes: Record<'Onboard' | 'Rejected' | 'Canceled' | 'Offered', ApplicantStatus> = {
    Onboard: { applicantStatus: ApplicantStatusEnum.OnBoarded, statusText: 'Onboard' },
    Rejected: { applicantStatus: ApplicantStatusEnum.Rejected, statusText: 'Rejected' },
    Canceled: { applicantStatus: ApplicantStatusEnum.Cancelled, statusText: 'Cancelled' },
    Offered: { applicantStatus: ApplicantStatusEnum.Offered, statusText: 'Offered' },
  };

  get isAccepted(): boolean {
    return this.candidateJob?.applicantStatus?.applicantStatus === this.candidatStatus.Accepted;
  }

  get isRejected(): boolean {
    return this.candidateJob?.applicantStatus?.applicantStatus === this.candidatStatus.Rejected;
  }

  get isOnBoard(): boolean {
    return this.candidateJob?.applicantStatus?.applicantStatus === this.candidatStatus.OnBoard;
  }

  get isCancelled(): boolean {
    return this.candidateJob?.applicantStatus?.applicantStatus === this.candidatStatus.Cancelled;
  }

  get canAccept(): boolean {
    return this.candidateJob && this.isAgency && !this.isOnBoard
    && this.candidateJob?.applicantStatus?.applicantStatus !== this.candidatStatus.Offboard;
  }

  get actualStartDateValue(): Date {
    return this.form.get('startDate')?.value;
  }

  get isReadOnlyBillRates(): boolean {
    return !this.canShortlist && !this.canInterview && !this.canReject && !this.canOffer && !this.canOnboard;
  }

  get isOffered(): boolean {
    return this.candidate?.status === ApplicantStatusEnum.Offered;
  }

  get isOffboard(): boolean {
    return this.candidate?.status === ApplicantStatusEnum.Offboard;
  }

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

  constructor(
    private store: Store,
    private action$: Actions,
    private datePipe: DatePipe,
    private commentsService: CommentsService,
    private router: Router,
    private durationService: DurationService,
    private changeDetectorRef: ChangeDetectorRef,
    private settingService: SettingsViewService,
    private permissionService : PermissionService,
    private confirmService: ConfirmService,
  ) {
    super();
    this.isAgency = this.router.url.includes('agency');
    this.sendOnboardMessageEmailFormGroup = new FormGroup({
      emailSubject: new FormControl('', [Validators.required]),
      emailBody: new FormControl('', [Validators.required]),
      fileUpload: new FormControl(null),
      emailTo: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.subscribeOnPermissions();
    this.subsToCandidate();
    this.rejectReasons$ = this.subscribeOnReasonsList();
    this.createForm();
    this.onRejectSuccess();
    this.subscribeOnCancelOrganizationCandidateJobSuccess();
    this.subscribeToCandidateJob();
  }

  public updateOrganizationCandidateJobWithBillRate(bill: BillRate): void {
    this.form.markAllAsTouched();
    if (!this.form.errors && this.candidateJob) {
      const value = this.form.getRawValue();
      let additionalValues = {};
      if (this.isOnBoard) {
        additionalValues = {
          actualStartDate: DateTimeHelper.setUtcTimeZone(this.candidateJob.actualStartDate),
          actualEndDate: DateTimeHelper.setUtcTimeZone(this.candidateJob.actualEndDate),
          guaranteedWorkWeek: this.candidateJob.guaranteedWorkWeek,
          clockId: this.candidateJob.clockId,
        };
      }
      const rates = this.getBillRateForUpdate(bill);

      const valueForUpdate = {
        ...additionalValues,
        organizationId: this.candidateJob.organizationId,
        orderId: this.candidateJob.orderId,
        jobId: this.candidateJob.jobId,
        skillName: value.skillName,
        offeredBillRate: this.candidateJob?.offeredBillRate,
        offeredStartDate: this.candidateJob ? DateTimeHelper.setUtcTimeZone(this.candidateJob.offeredStartDate) : undefined,
        candidateBillRate: this.candidateJob.candidateBillRate,
        nextApplicantStatus: {
          applicantStatus: this.candidateJob.applicantStatus.applicantStatus,
          statusText: this.candidateJob.applicantStatus.statusText,
        },
        billRates: rates,
        billRatesUpdated: this.checkForBillRateUpdate(rates),
        candidatePayRate: this.candidateJob.candidatePayRate,
      };

      this.store.dispatch(new UpdateOrganisationCandidateJob(valueForUpdate));
      this.deleteUpdateFieldInRate();
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
    this.store.dispatch(this.isAgency ? new GetRejectReasonsForAgency() : new GetRejectReasonsForOrganisation());
    this.openRejectDialog.next(true);
  }

  public rejectCandidateJob(event: { rejectReason: number }): void {
    if (this.candidateJob) {
      const payload = {
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        rejectReasonId: event.rejectReason,
      };

      this.store.dispatch(this.isAgency ? [new RejectCandidateJobAgency(payload)] : [new RejectCandidateJob(payload)]);
      this.dialogEvent.next(false);
    }
  }

  public cancelCandidate(jobCancellationDto: JobCancellation): void {
    if (this.candidateJob) {
      this.store.dispatch(
        new CancelOrganizationCandidateJob({
          organizationId: this.candidateJob.organizationId,
          jobId: this.candidateJob.jobId,
          jobCancellationDto,
          candidatePayRate: this.candidateJob.candidatePayRate,
        })
      );
      this.dialogEvent.next(false);
    }
  }

  public resetStatusesFormControl(): void {
    this.statusesFormControl.reset();
    this.selectedApplicantStatus = null;
  }

  public onAccept(): void {
    if (this.candidateDOBRequired) {
      if (!this.form.controls["dob"].value) {
        this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateDOBRequired));
        return;
      }
    }

    if(this.candidatePhone1RequiredValue === ConfigurationValues.Accept){
      if(this.candidateJob?.candidateProfileContactDetails != null){
          if(this.candidateJob?.candidateProfileContactDetails.phone1 === null
              || this.candidateJob?.candidateProfileContactDetails.phone1 === ''){
                this.store.dispatch(new ShowToast(MessageTypes.Error, CandidatePHONE1Required(ConfigurationValues.Accept)));
                return;
            }
      }else{
        this.store.dispatch(new ShowToast(MessageTypes.Error, CandidatePHONE1Required(ConfigurationValues.Accept)));
        return;
      }
    }

    if (this.isAgency && this.isCandidatePayRateVisible && this.isOffered && this.form.get('candidatePayRate')?.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if(this.candidateAddressRequiredValue === ConfigurationValues.Accept){
      if(this.candidateJob?.candidateProfileContactDetails != null){
          if(CommonHelper.candidateAddressCheck(this.candidateJob?.candidateProfileContactDetails)){
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

  public onSave(): void {
    this.saveHandler({ itemData: this.selectedApplicantStatus });
  }

  public onStatusChange(event: { itemData: ApplicantStatus }): void {
    this.selectedApplicantStatus = event.itemData;
  }

  public saveHandler(event: { itemData: ApplicantStatus | null }): void {
    switch (event.itemData?.applicantStatus) {
      case ApplicantStatusEnum.Accepted:
        this.onAccept();
        break;
      case ApplicantStatusEnum.Rejected:
        this.onReject();
        break;
      case ApplicantStatusEnum.Cancelled:
        this.openCandidateCancellationDialog.next();
        break;
      case ApplicantStatusEnum.OnBoarded:
        this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.OnBoarded, statusText: 'Onboard' });
        break;

      default:
        this.updateAgencyCandidateJob(this.selectedApplicantStatus || this.candidateJob.applicantStatus);
        break;
    }
  }

  public onStartDateChange(event: ChangedEventArgs): void {
    const actualStartDate = new Date(event.value!);
    const actualEndDate = this.durationService.getEndDate(this.currentOrder.duration, actualStartDate,
      { jobStartDate: this.currentOrder.jobStartDate, jobEndDate: this.currentOrder.jobEndDate });
    this.form.patchValue({
      actualEndDate,
    });
  }

  private setAllowedStatuses(candidate: OrderCandidatesList): void {
    const statuses = [];

    if (candidate.status === ApplicantStatusEnum.Accepted) {
      this.canOnboard && statuses.push(this.applicantStatusTypes.Onboard);
      this.canReject && statuses.push(this.applicantStatusTypes.Rejected);
    } else if (candidate.status === ApplicantStatusEnum.Offered) {
      this.canOffer && statuses.push(this.applicantStatusTypes.Offered);
      this.canReject && statuses.push(this.applicantStatusTypes.Rejected);
    } else if (candidate.status === ApplicantStatusEnum.OnBoarded) {
      if (this.canOnboard) {
        statuses.push(this.applicantStatusTypes.Onboard, this.applicantStatusTypes.Canceled);
      } else if (this.canReject) {
        statuses.push(this.applicantStatusTypes.Canceled);
      }
    } else {
      statuses.push({ applicantStatus: candidate.status, statusText: capitalize(CandidatStatus[candidate.status]) });
      this.canReject && statuses.push(this.applicantStatusTypes.Rejected);
    }

    this.applicantStatuses = statuses;
    this.changeDetectorRef.markForCheck();

    if (!this.applicantStatuses.length) {
      this.statusesFormControl.disable();
    }
  }

  private subsToCandidate(): void {
    const state$ = this.isAgency ? this.orderCandidatePage$ : this.clientOrderCandidatePage$;
    this.candidate$ = state$.pipe(
      filter(Boolean),
      map((res) => {
        const items = res?.items || this.candidateOrder?.items;
        const candidate = items?.find((candidate) => candidate.candidateJobId);
        this.candidate = candidate;
        if (candidate) {
          return candidate;
        } else {
          return EMPTY;
        }
      })
    ) as Observable<OrderCandidatesList>;

    combineLatest([this.orderPermissions$, this.candidate$])
      .pipe(
        filter(([permission, candidate]) => !!permission && !!candidate),
        takeUntil(this.destroy$)
      )
      .subscribe(([permissions, candidate]: [CurrentUserPermission[], OrderCandidatesList]) => {
        this.orderPermissions = permissions;
        this.mapPermissions();
        this.getCandidatePayRateSetting();
        const { organizationId, candidateJobId } = candidate;
        const GetCandidateJobAction = this.isAgency ? GetCandidateJob : GetOrganisationCandidateJob;
        this.store.dispatch(new GetCandidateJobAction(organizationId as number, candidateJobId));
      });
  }

  private getOrderPermissions(orderId: number): void {
    this.store.dispatch(new GetOrderPermissions(orderId));
  }

  private mapPermissions(): void {
    this.canShortlist = false;
    this.canInterview = false;
    this.canReject = false;
    this.canOffer = false;
    this.canOnboard = false;
    this.canClose = false;
    this.orderPermissions.forEach((permission) => {
      this.canShortlist = this.canShortlist || permission.permissionId === PermissionTypes.CanShortlistCandidate;
      this.canInterview = this.canInterview || permission.permissionId === PermissionTypes.CanInterviewCandidate;
      this.canReject = this.canReject || permission.permissionId === PermissionTypes.CanRejectCandidate;
      this.canOffer = this.canOffer || permission.permissionId === PermissionTypes.CanOfferCandidate;
      this.canOnboard = this.canOnboard || permission.permissionId === PermissionTypes.CanOnBoardCandidate;
      this.canClose = this.canClose || permission.permissionId === PermissionTypes.CanCloseCandidate;
    });
    this.disableControlsBasedOnPermissions();
    if (!this.isAgency && this.candidate) {
      this.setAllowedStatuses(this.candidate);
    }
    this.changeDetectorRef.markForCheck();
  }

  private disableControlsBasedOnPermissions(): void {
    if (!this.canShortlist && !this.canInterview && !this.canReject && !this.canOffer && !this.canOnboard) {
      this.form?.controls['guaranteedWorkWeek']?.disable();
    }
    if (!this.canReject && !this.canOffer && !this.canOnboard) {
      this.form?.controls['offeredBillRate']?.disable();
    }
    if (!this.canReject && !this.canOffer) {
      this.form?.controls['offeredStartDate']?.disable();
    }
    if (!this.canReject && !this.canOnboard) {
      this.form?.controls['actualStartDate']?.disable();
      this.form?.controls['actualEndDate']?.disable();
      this.form?.controls['clockId']?.disable();
    }
    if (!this.canOnboard) {
      this.form?.controls['allowDeployCredentials']?.disable();
    }

    if (this.isOffboard) {
      this.form?.get('guaranteedWorkWeek')?.disable();
      this.form?.get('allowDeployCredentials')?.disable();
      this.form?.get('comments')?.disable();
      this.form?.get('allowDeployCredentials')?.disable();
      this.form?.get('actualStartDate')?.disable();
      this.form?.get('actualEndDate')?.disable();
      this.form?.get('offeredBillRate')?.disable();
    }
  }

  private updateAgencyCandidateJob(applicantStatus: ApplicantStatus): void {
    const value = this.form.getRawValue();
    if (typeof value.actualStartDate === 'string') {
      value.actualStartDate = new Date(value.actualStartDate);
    }
    if (typeof value.actualEndDate === 'string') {
      value.actualEndDate = new Date(value.actualEndDate);
    }
    if (this.form.valid) {
      const updatedValue = {
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        orderId: this.candidateJob.orderId,
        nextApplicantStatus: applicantStatus,
        candidateBillRate: this.candidateJob.candidateBillRate,
        offeredBillRate: value.offeredBillRate,
        requestComment: value.comments,
        actualStartDate: DateTimeHelper.setUtcTimeZone(value.actualStartDate),
        actualEndDate: DateTimeHelper.setUtcTimeZone(value.actualEndDate),
        offeredStartDate: this.candidateJob?.offeredStartDate,
        allowDeployWoCredentials: value.allowDeployCredentials,
        billRates: this.billRatesData,
        guaranteedWorkWeek: value.guaranteedWorkWeek,
        clockId: value.clockId,
        candidatePayRate: value.candidatePayRate,
      };
      this.isSend =  true;
      this.emailTo = this.candidateJob?.candidateProfile.email; 
      this.sendOnboardMessageEmailFormGroup.get('emailTo')?.setValue(this.candidateJob?.candidateProfile.email);
      const statusChanged = applicantStatus.applicantStatus === this.candidateJob.applicantStatus.applicantStatus;
      this.store
        .dispatch(
          this.isAgency ? new UpdateAgencyCandidateJob(updatedValue) : new UpdateOrganisationCandidateJob(updatedValue)
        ).pipe(
          takeUntil(this.destroy$)
        ).subscribe(() => {
          this.store.dispatch(
            this.isAgency ? new ReloadOrderCandidatesLists() : new ReloadOrganisationOrderCandidatesLists()
          );
          if (statusChanged) {
            this.dialogEvent.next(false);
          } else {
            this.resetStatusesFormControl();
            this.adjustCandidatePayRateField();
          }
          if(applicantStatus.applicantStatus === ApplicantStatusEnum.OnBoarded){
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
                });
          }
        });
    } else {
      this.resetStatusesFormControl();
    }
  }

  onGroupEmailAddCancel(){
    // console.log('this.candidateJob at cancel',this.candidateJob);
    this.isSendOnboardFormInvalid = !this.sendOnboardMessageEmailFormGroup.valid;
    this.isSend =  false;
    this.store.dispatch(new ShowGroupEmailSideDialog(false));
  }

  onGroupEmailSend(){
    this.isSendOnboardFormInvalid = !this.sendOnboardMessageEmailFormGroup.valid;
    if(this.sendOnboardMessageEmailFormGroup.valid){
      const emailvalue = this.sendOnboardMessageEmailFormGroup.getRawValue();   
      // console.log('emailvalue',emailvalue);         
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
          this.store.dispatch(new ShowGroupEmailSideDialog(false));
          this.store.dispatch(new ShowToast(MessageTypes.Success, SEND_EMAIL));
        });
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
      jobCancellationReason: new FormControl(''),
      penaltyCriteria: new FormControl(''),
      rate: new FormControl(''),
      hours: new FormControl(''),
      dob: new FormControl(''),
      ssn: new FormControl(''),
      candidatePayRate: new FormControl(null, Validators.required),
    });
  }

  private getDateString(date: string): string | null {
    return this.datePipe.transform(date, 'MM/dd/yyyy', 'utc');
  }

  private getComments(): void {
    this.commentsService
      .getComments(this.candidateJob?.commentContainerId as number, null)
      .pipe(takeUntil(this.destroy$))
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
        this.changeDetectorRef.markForCheck();
      });
  }

  private patchForm(value: OrderCandidateJob): void {
    this.candidateJob = value;
    this.candidateSSNRequired = value.candidateSSNRequired;
    this.candidateDOBRequired = value.candidateDOBRequired;
    if(value.candidatePhone1Required != null){
      let phone1Configuration = JSON.parse(value.candidatePhone1Required);
      if(phone1Configuration.isEnabled){
        this.candidatePhone1RequiredValue = phone1Configuration.value;
      }
    }
    if(value.candidateAddressRequired != null){
      let addressConfiguration = JSON.parse(value.candidateAddressRequired);
      if(addressConfiguration.isEnabled){
        this.candidateAddressRequiredValue = addressConfiguration.value;
      }
    }
    if (this.candidateJob) {
      this.setCancellationControls(this.candidateJob.jobCancellation?.penaltyCriteria || 0);
      this.getComments();
      if (!this.isAgency) {
        this.getOrderPermissions(value.orderId);
      }
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
        offeredBillRate: formatNumber(CheckNumberValue(this.candidateJob.offeredBillRate), 'en-US', '0.2-2'),
        comments: this.candidateJob.requestComment,
        guaranteedWorkWeek: this.candidateJob.guaranteedWorkWeek,
        clockId: this.candidateJob.clockId,
        allowDeployCredentials: this.candidateJob.allowDeployCredentials,
        rejectReason: this.candidateJob.rejectReason,
        jobCancellationReason: CancellationReasonsMap[this.candidateJob.jobCancellation?.jobCancellationReason || 0],
        penaltyCriteria: PenaltiesMap[this.candidateJob.jobCancellation?.penaltyCriteria || 0],
        rate: this.candidateJob.jobCancellation?.rate,
        hours: this.candidateJob.jobCancellation?.hours,
        dob: value.candidateProfile.dob,
        ssn: value.candidateProfile.ssn,
        candidatePayRate: this.candidateJob.candidatePayRate,
      });

      if (!this.isRejected) {
        this.fieldsEnableHandlear();
      }
      this.subscribeCandidateCancellationReasons();
    }
    this.changeDetectorRef.markForCheck();
  }

  private setCancellationControls(value: PenaltyCriteria): void {
    this.showHoursControl = value === PenaltyCriteria.RateOfHours || value === PenaltyCriteria.FlatRateOfHours;
    this.showPercentage = value === PenaltyCriteria.RateOfHours;
  }

  private fieldsEnableHandlear(): void {
    if (this.isAgency && !this.isOnBoard && !this.isCancelled) {
      this.form.get('comments')?.enable();
    }
    if (!this.isAgency && !this.isCancelled) {
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

  private subscribeOnReasonsList(): Observable<RejectReason[]> {
    return merge(
      this.store.select(OrderManagementContentState.rejectionReasonsList),
      this.store.select(OrderManagementState.rejectionReasonsList)
    ).pipe(map((reasons) => reasons ?? []));
  }

  private onRejectSuccess(): void {
    merge(
      this.action$.pipe(
        ofActionSuccessful(RejectCandidateForOrganisationSuccess),
        mergeMap(() => this.store.dispatch(new ReloadOrganisationOrderCandidatesLists()))
      ),
      this.action$.pipe(
        ofActionSuccessful(RejectCandidateForAgencySuccess),
        mergeMap(() => this.store.dispatch(new ReloadOrderCandidatesLists()))
      )
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private subscribeOnCancelOrganizationCandidateJobSuccess(): void {
    this.action$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(CancelOrganizationCandidateJobSuccess))
      .subscribe(() => {
        this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());
      });
  }

  private subscribeToCandidateJob(): void {
    (this.isAgency ? this.candidateJobState$ : this.candidatesJob$)
      .pipe(filter(Boolean), takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data.jobId === this.candidate?.candidateJobId) {
          this.resetStatusesFormControl();
          this.createForm();
          this.patchForm(data);
          this.adjustCandidatePayRateField();
        }
      });
  }

  private getCandidatePayRateSetting(): void {
    const organizationId = this.candidate?.organizationId;

    if (organizationId) {
      this.settingService
        .getViewSettingKey(
          OrganizationSettingKeys.CandidatePayRate,
          OrganizationalHierarchy.Organization,
          organizationId,
          organizationId
        ).pipe(takeUntil(this.destroy$))
        .subscribe(({ CandidatePayRate }) => {
          this.isCandidatePayRateVisible = JSON.parse(CandidatePayRate);
        });
    }
  }

  private adjustCandidatePayRateField(): void {
    const candidatePayRateControl = this.form.get('candidatePayRate');
    setTimeout(() => {
      if (this.isCandidatePayRateVisible && this.isAgency && this.isOffered) {
        candidatePayRateControl?.enable();
      } else {
        candidatePayRateControl?.disable();
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  private deleteUpdateFieldInRate(): void {
    this.candidateJob?.billRates.filter((rate) => Object.prototype.hasOwnProperty.call(rate, 'isUpdated'))
    .forEach((rate) => {
      delete rate.isUpdated;
    });
  }

  private checkForBillRateUpdate(rates: BillRate[]): boolean {
    return rates.some((rate) => !!rate.isUpdated);
  }


  private subscribeCandidateCancellationReasons() {
    if (this.candidateJob) {
      let payload: CandidateCancellationReasonFilter = {
        locationId: this.candidateJob?.order.locationId,
        regionId: this.candidateJob?.order.regionId
      };
      this.store.dispatch(new GetCandidateCancellationReason(payload));
      this.candidateCancellationReasons$
        .pipe(takeUntil(this.destroy$)).subscribe((value) => {
          this.candidateCancellationReasons =value;
        });

    }
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().subscribe(({ canCreateOrder}) => {
      this.canCreateOrder = canCreateOrder;
    });
  }
}
