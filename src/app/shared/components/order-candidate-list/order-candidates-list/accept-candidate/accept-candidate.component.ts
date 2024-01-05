import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  CancellationReasonsMap,
  PenaltiesMap,
} from '@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants';

import {
  CandidateDOBRequired,
  CandidateSSNRequired,
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  deployedCandidateMessage,
  DEPLOYED_CANDIDATE,
  CandidatePHONE1Required,
  CandidateADDRESSRequired,
  OrganizationSettingKeys,
  OrganizationalHierarchy,
  CLEAR_START_ON,
} from '@shared/constants';
import { PenaltyCriteria } from '@shared/enums/candidate-cancellation';
import { RejectReason } from '@shared/models/reject-reason.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { filter, Observable, Subject, takeUntil, of, take } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { OrderManagementState } from '@agency/store/order-management.state';
import { ApplicantStatus, Order, OrderCandidateJob, OrderCandidatesList, RegularRatesData, clearToStartDataset } from '@shared/models/order-management.model';
import { BillRate } from '@shared/models/bill-rate.model';
import {
  GetAgencyAvailableSteps,
  GetRejectReasonsForAgency,
  RejectCandidateForAgencySuccess,
  RejectCandidateJob,
  ReloadOrderCandidatesLists,
  UpdateAgencyCandidateJob,
} from '@agency/store/order-management.actions';
import { ApplicantStatus as ApplicantStatusEnum, CandidatStatus, ConfigurationValues } from '@shared/enums/applicant-status.enum';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import PriceUtils from '@shared/utils/price.utils';
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';
import { DeployedCandidateOrderInfo } from '@shared/models/deployed-candidate-order-info.model';
import { CheckNumberValue, DateTimeHelper } from '@core/helpers';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { CandidatePayRateSettings } from '@shared/constants/candidate-pay-rate-settings';
import { CommonHelper } from '@shared/helpers/common.helper';
import { formatNumber } from '@angular/common';
import { PermissionService } from 'src/app/security/services/permission.service';
import { DropDownListComponent, SelectEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { OrderManagementService } from '@client/order-management/components/order-management-content/order-management.service';
import { SettingsViewService } from '@shared/services';
import { positionIdStatuses } from '@agency/candidates/add-edit-candidate/add-edit-candidate.constants';
import { ReloadOrganisationOrderCandidatesLists, SaveClearToStart, SaveClearToStartSucceeded } from '@client/store/order-managment-content.actions';

@Component({
  selector: 'app-accept-candidate',
  templateUrl: './accept-candidate.component.html',
  styleUrls: ['./accept-candidate.component.scss'],
  providers: [MaskedDateTimeService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcceptCandidateComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;
  @ViewChild('statusSelect') set setStatusSelect (content: DropDownListComponent) {
    if (content) {
      this.statusSelect = content;
    }
  }
  @Output() closeModalEvent: EventEmitter<void> = new EventEmitter();
  @Output() updateDetails = new EventEmitter<void>();

  @Input() candidate: OrderCandidatesList;
  @Input() isTab = false;
  @Input() isAgency = false;
  @Input() actionsAllowed: boolean;
  @Input() deployedCandidateOrderInfo: DeployedCandidateOrderInfo[];
  @Input() candidateOrderIds: string[];
  @Input() isOrderOverlapped: boolean;
  @Input() order: Order;
  @Input() isCandidatePayRateVisible: boolean;
  @Input() reloadOnUpdate = false;

  @Select(OrderManagementState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  @Select(OrderManagementState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  @Select(OrderManagementState.availableSteps)
  applicantStatuses$: Observable<ApplicantStatus[]>;

  form: FormGroup;

  public candidateJob: OrderCandidateJob;
  public candidatStatus = CandidatStatus;
  public billRatesData: BillRate[] = [];
  public rejectReasons: RejectReason[] = [];
  public isReadOnly = false;
  public openRejectDialog = new Subject<boolean>();
  public priceUtils = PriceUtils;
  public showHoursControl = false;
  public showPercentage = false;
  public verifyNoPenalty = false;
  public candidatePayRateRequired: boolean;
  public candidateSSNRequired = false;
  public candidateDOBRequired: boolean;
  public payRateSetting = CandidatePayRateSettings;
  public candidatePhone1RequiredValue = '';
  public candidateAddressRequiredValue = '';
  public canCreateOrder : boolean;
  public optionFields = { text: 'statusText', value: 'statusText' };
  public comments: Comment[] = [];
  public agencyCanRevert: boolean;
  private statusSelect: DropDownListComponent;

  public isEnableClearedToStartForAcceptedCandidates:boolean = false;
  public isClearedToStartEnable:boolean = true;
  public clearToStartDataset:clearToStartDataset = new clearToStartDataset();
  public clearedToStart:boolean = false;

  get isRejected(): boolean {
    return this.isReadOnly && this.candidateStatus === ApplicantStatusEnum.Rejected;
  }

  get isApplied(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.Applied;
  }

  get showCandidatePayRate(): boolean {
    return ![ApplicantStatusEnum.NotApplied,ApplicantStatusEnum.Applied, ApplicantStatusEnum.Shortlisted,
      ApplicantStatusEnum.PreOfferCustom].includes(this.candidateStatus);
  }

  get isOffered(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.Offered;
  }

  get isOnboard(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.OnBoarded;
  }

  get isAccepted(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.Accepted;
  }

  get isCancelled(): boolean {
    return this.candidateStatus === ApplicantStatusEnum.Cancelled;
  }

  get candidateStatus(): ApplicantStatusEnum {
    return this.candidate.status || (this.candidate.candidateStatus as any);
  }

  get isDeployedCandidate(): boolean {
    return !!this.candidate.deployedCandidateInfo && this.candidate.status !== ApplicantStatusEnum.OnBoarded;
  }

  get showGuaranteedWorkWeek(): boolean {
    return (
      this.candidateStatus === ApplicantStatusEnum.Shortlisted ||
      this.candidateStatus === ApplicantStatusEnum.PreOfferCustom ||
      this.candidateStatus === ApplicantStatusEnum.Offered ||
      this.candidateStatus === ApplicantStatusEnum.Accepted ||
      this.isOnboard
    );
  }

  get showWithdrawAction(): boolean {
    return (
      [ApplicantStatusEnum.Shortlisted, ApplicantStatusEnum.PreOfferCustom].includes(this.candidateStatus) &&
      ((!this.isWithdraw && !this.isDeployedCandidate) || this.isAgency)
    );
  }

  get showApplyAction(): boolean {
    return this.isApplied;
  }

  get showAccepteAction(): boolean {
    return this.candidate?.candidateStatus !== ApplicantStatusEnum.Accepted
    && this.candidate?.candidateStatus !== ApplicantStatusEnum.Offboard && !this.isReadOnly;
  }

  get isAgencyAndOnboard(): boolean {
    return this.isAgency && this.candidateStatus === ApplicantStatusEnum.OnBoarded;
  }

  get showRejectButton(): boolean {
    return (!this.isRejected && !this.showWithdrawAction && !this.isAgencyAndOnboard
      && this.candidate?.candidateStatus !== ApplicantStatusEnum.Offboard) || !this.isReadOnly;
  }

  get revertStatusSelected(): boolean {
    return !!this.revertedStatus;
  }

  private unsubscribe$: Subject<void> = new Subject();
  private isWithdraw: boolean;
  private revertedStatus: ApplicantStatus;

  constructor(
    private store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private commentsService: CommentsService,
    private changeDetectionRef: ChangeDetectorRef,
    private permissionService: PermissionService,
    private orderManagementService: OrderManagementService,
    private settingService: SettingsViewService,
  ) {
    this.createForm();
  }

  ngOnChanges(): void {
    this.switchFormState();
    this.checkReadOnlyStatuses();
    this.adjustCandidatePayRateField();
  }

  ngOnInit(): void {
    this.subscribeOnPermissions();
    this.patchForm();
    this.subscribeOnReasonsList();
    this.subscribeOnSuccessRejection();
    this.clearToStartCheck();
  }

  clearToStartCheck(){
    this.orderManagementService.getCurrentClearToStartVal().pipe(takeUntil(this.unsubscribe$)).subscribe(val=>{
      if(val != null){
        this.clearedToStart = val;
      }else{
        this.clearedToStart = this.candidate && this.candidate.clearToStart ? this.candidate.clearToStart : false;
      }
    });
    if(this.candidate && positionIdStatuses.includes(this.candidate.status)){
      this.clearedToStartCheck();
    }else if(this.candidate && !this.candidate.status && this.candidate.candidateStatus && positionIdStatuses.includes(this.candidate.candidateStatus)){
      this.clearedToStartCheck();
    }else{
      this.isEnableClearedToStartForAcceptedCandidates = false;
    }
  }

  private clearedToStartCheck():void {
    if(this.candidate && this.candidate.organizationId && (this.candidate.candidateJobId || this.candidate.jobId)){
      this.isEnableClearedToStartForAcceptedCandidates = false;
      this.isClearedToStartEnable =  this.candidate.status ? this.candidate.status == ApplicantStatusEnum.Accepted ? false : true : this.candidate.candidateStatus == ApplicantStatusEnum.Accepted ? false : true;

      this.settingService
        .getViewSettingKey(
          OrganizationSettingKeys.EnableClearedToStartForAcceptedCandidates,
          OrganizationalHierarchy.Organization,
          this.candidate.organizationId,
          this.candidate.organizationId,
          false,
          this.candidate.candidateJobId ? this.candidate.candidateJobId : this.candidate.jobId
        ).pipe(takeUntil(this.unsubscribe$))
        .subscribe(({ EnableClearedToStartForAcceptedCandidates }) => {
          this.isEnableClearedToStartForAcceptedCandidates = JSON.parse(EnableClearedToStartForAcceptedCandidates);
        });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onClose(): void {
    if (this.form.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => confirm),
          take(1)
        ).subscribe(() => {
          this.resetStatusSelectValue();
          this.closeDialog();
        });
    } else {
      this.resetStatusSelectValue();
      this.closeDialog();
    }
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

    if (this.candidatePayRateRequired && this.form.get('candidatePayRate')?.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.shouldChangeCandidateStatus()
      .pipe(
        take(1),
        filter((isConfirm) => isConfirm)
      )
      .subscribe(() => {
        this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Accepted, statusText: 'Accepted' });
      });
  }

  public onApply(): void {
    if (this.form.valid) {
      if (this.candidateSSNRequired) {
        if (!this.form.controls["ssn"].value) {
          this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateSSNRequired));
          return;
        }
      }
      if(this.candidatePhone1RequiredValue === ConfigurationValues.Apply){
        if(this.candidateJob?.candidateProfileContactDetails != null){
          if(this.candidateJob?.candidateProfileContactDetails.phone1 === null
            || this.candidateJob?.candidateProfileContactDetails.phone1 === ''){
            this.store.dispatch(new ShowToast(MessageTypes.Error, CandidatePHONE1Required(ConfigurationValues.Apply)));
            return;
          }
        }else{
          this.store.dispatch(new ShowToast(MessageTypes.Error, CandidatePHONE1Required(ConfigurationValues.Apply)));
          return;
        }
      }

      if(this.candidateAddressRequiredValue === ConfigurationValues.Apply){
        if(this.candidateJob?.candidateProfileContactDetails != null){
            if(CommonHelper.candidateAddressCheck(this.candidateJob?.candidateProfileContactDetails)){
                this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateADDRESSRequired(ConfigurationValues.Apply)));
                return;
            }
        }else{
          this.store.dispatch(new ShowToast(MessageTypes.Error, CandidateADDRESSRequired(ConfigurationValues.Apply)));
          return;
        }
      }

      this.shouldChangeCandidateStatus()
        .pipe(take(1))
        .subscribe((isConfirm) => {
          if (isConfirm) {
            this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Applied, statusText: 'Applied' });
            this.updateDetails.emit();
          }
        });
    }
  }

  private shouldChangeCandidateStatus(): Observable<boolean> {
    const options = {
      title: DEPLOYED_CANDIDATE,
      okButtonLabel: 'Proceed',
      okButtonClass: 'ok-button',
    };

    return this.isDeployedCandidate && this.isAgency && this.isOrderOverlapped
      ? this.confirmService.confirm(deployedCandidateMessage(this.candidateOrderIds), options)
      : of(true);
  }

  public onWithdraw(): void {
    this.isWithdraw = true;
    this.updateAgencyCandidateJob({ applicantStatus: ApplicantStatusEnum.Withdraw, statusText: 'Withdraw' });
  }

  public onReject(): void {
    this.store.dispatch(new GetRejectReasonsForAgency());
    this.openRejectDialog.next(true);
  }

  public rejectCandidateJob(event: { rejectReason: number }): void {
    this.isReadOnly = true;
    this.candidate.status = ApplicantStatusEnum.Rejected;

    if (this.candidateJob) {
      const payload = {
        organizationId: this.candidateJob.organizationId,
        jobId: this.candidateJob.jobId,
        rejectReasonId: event.rejectReason,
      };

      const value = this.rejectReasons.find((reason: RejectReason) => reason.id === event.rejectReason)?.reason;
      this.form.patchValue({ rejectReason: value });
      this.store.dispatch(new RejectCandidateJob(payload));

      if (!this.reloadOnUpdate) {
        this.closeDialog();
      }
      
      this.updateDetails.emit();
    }
  }

  public calculateActualEndDate(startDate: Date, daysToAdd: number): Date { 
    const actualEndDate = new Date(startDate); actualEndDate.setDate(startDate.getDate() + daysToAdd);
     return actualEndDate; 
  }

  public setRevertedStatus(event: SelectEventArgs): void {
    this.revertedStatus = event.itemData as ApplicantStatus;
  }

  public revertStatus(): void {
    this.updateAgencyCandidateJob( this.revertedStatus);
  }

  private updateAgencyCandidateJob(applicantStatus: ApplicantStatus): void {
    const value = this.form.getRawValue();
    const jobStartDate = new Date(this.candidateJob?.order.jobStartDate); 
    const jobEndDate = new Date(this.candidateJob.order.jobEndDate);
    const finalDate = this.candidateJob.offeredStartDate && this.candidateJob.offeredStartDate !== '' ? new Date(this.candidateJob.offeredStartDate) : jobStartDate; 
    const daysDifference =  DateTimeHelper.getDateDiffInDays(jobStartDate, jobEndDate);
    const actualEndDate = this.calculateActualEndDate(finalDate, daysDifference).toISOString(); 
    const accepted = applicantStatus.applicantStatus ===ApplicantStatusEnum.Accepted;
    if (accepted && (!value.actualStartDate || !value.actualEndDate)) {
      value.actualStartDate = this.candidateJob?.offeredStartDate;
      value.actualEndDate = actualEndDate;
     }   
    this.store
      .dispatch(
        new UpdateAgencyCandidateJob({
          organizationId: this.candidateJob.organizationId,
          jobId: this.candidateJob.jobId,
          orderId: this.candidateJob.orderId,
          nextApplicantStatus: applicantStatus,
          candidateBillRate: value.candidateBillRate,
          offeredBillRate: value.offeredBillRate || null,
          requestComment: value.comments,
          expAsTravelers: value.expAsTravelers,
          availableStartDate: DateTimeHelper.setUtcTimeZone(new Date(value.availableStartDate)),
          actualStartDate: value.actualStartDate ? DateTimeHelper.setUtcTimeZone(value.actualStartDate) : null,
          actualEndDate: value.actualEndDate ? DateTimeHelper.setUtcTimeZone(value.actualEndDate) : null,
          clockId: this.candidateJob.clockId,
          guaranteedWorkWeek: this.candidateJob.guaranteedWorkWeek,
          allowDeployWoCredentials: false,
          billRates: this.billRatesData,
          offeredStartDate: this.candidateJob.offeredStartDate,
          candidatePayRate: value.candidatePayRate,
        })
      ).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        this.store.dispatch(new ReloadOrderCandidatesLists());
        this.closeDialog();
      });
      this.updateDetails.emit();
  }

  private createForm(): void {
    this.form = new FormGroup({
      jobId: new FormControl(''),
      date: new FormControl(''),
      billRates: new FormControl(''),
      candidatePayRate: new FormControl(null, [Validators.required]),
      availableStartDate: new FormControl('', [Validators.required]),
      candidateBillRate: new FormControl('', [Validators.required]),
      locationName: new FormControl(''),
      yearExp: new FormControl(''),
      expAsTravelers: new FormControl(''),
      offeredBillRate: new FormControl(''),
      comments: new FormControl(''),
      rejectReason: new FormControl(''),
      guaranteedWorkWeek: new FormControl(''),
      offeredStartDate: new FormControl(''),
      clockId: new FormControl(''),
      actualStartDate: new FormControl(''),
      actualEndDate: new FormControl(''),
      jobCancellationReason: new FormControl(''),
      penaltyCriteria: new FormControl(''),
      rate: new FormControl(''),
      hours: new FormControl(''),
      dob: new FormControl(''),
      ssn: new FormControl(''),
    });
  }

  private getComments(): void {
    this.commentsService
      .getComments(this.candidateJob?.commentContainerId as number, null)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
        this.changeDetectionRef.markForCheck();
      });
  }

  private patchForm(): void {
    this.candidateJobState$
    .pipe(
      filter((job) => !!job),
      takeUntil(this.unsubscribe$)
    ).subscribe((value) => {
      this.candidateJob = value;
      this.agencyCanRevert = this.isAgency && value.applicantStatus.applicantStatus === ApplicantStatusEnum.Rejected;

      if (this.agencyCanRevert ) {
        this.store.dispatch(new GetAgencyAvailableSteps(value.organizationId, value.jobId));
      }
      
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
      
      const jobStartDate = value.actualStartDate || value.order.jobStartDate as unknown as string;
      const jobEndDate = value.actualEndDate || value.order.jobEndDate as unknown as string;

      this.setCancellationControls(value.jobCancellation?.penaltyCriteria || 0);
      this.getComments();
      this.billRatesData = [...value.billRates];
      const regularRates = this.orderManagementService.setRegularRates(this.billRatesData, jobStartDate);
      const billRate = regularRates.regular || regularRates.regularLocal || value.order.hourlyRate;
      this.form.patchValue({
        jobId: `${value.organizationPrefix}-${value.orderPublicId}`,
        date: [DateTimeHelper.setCurrentTimeZone(jobStartDate), DateTimeHelper.setCurrentTimeZone(jobEndDate)],
        billRates: billRate && PriceUtils.formatNumbers(billRate),
        availableStartDate: value.availableStartDate ?
          DateTimeHelper.formatDateUTC(value.availableStartDate, 'MM/dd/yyyy') : '',
        candidateBillRate: PriceUtils.formatNumbers(value.candidateBillRate),
        locationName: value.order.locationName,
        yearExp: value.yearsOfExperience,
        expAsTravelers: value.expAsTravelers,
        offeredBillRate: formatNumber(CheckNumberValue(value.offeredBillRate), 'en-US', '0.2-2'),
        comments: value.requestComment,
        rejectReason: value.rejectReason,
        guaranteedWorkWeek: value.guaranteedWorkWeek,
        offeredStartDate: value.offeredStartDate ? DateTimeHelper.formatDateUTC(
          DateTimeHelper.setUtcTimeZone(value.offeredStartDate).toString(), 'MM/dd/yyyy') : '',
        clockId: value.clockId,
        actualStartDate: value.actualStartDate ? DateTimeHelper.formatDateUTC(
          DateTimeHelper.setUtcTimeZone(value.actualStartDate).toString(), 'MM/dd/yyyy') : '',
        actualEndDate: value.actualEndDate ? DateTimeHelper.formatDateUTC(
          DateTimeHelper.setUtcTimeZone(value.actualEndDate).toString(), 'MM/dd/yyyy') : '',
        jobCancellationReason: CancellationReasonsMap[value.jobCancellation?.jobCancellationReason || 0],
        penaltyCriteria: PenaltiesMap[value.jobCancellation?.penaltyCriteria || 0],
        rate: value.jobCancellation?.rate,
        hours: value.jobCancellation?.hours,
        dob: value.candidateProfile.dob,
        ssn: value.candidateProfile.ssn,
        candidatePayRate: this.candidateJob.candidatePayRate,
      });
      this.changeDetectionRef.detectChanges();
    });
  }

  private subscribeOnReasonsList(): void {
    this.rejectionReasonsList$.pipe(takeUntil(this.unsubscribe$)).subscribe((reasons) => {
      this.rejectReasons = reasons;
      this.changeDetectionRef.markForCheck();
    });
  }

  private subscribeOnSuccessRejection(): void {
    this.actions$
      .pipe(ofActionSuccessful(RejectCandidateForAgencySuccess), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.form.disable();
        this.store.dispatch(new ReloadOrderCandidatesLists());
      });
  }

  private checkReadOnlyStatuses(): void {
    const readOnlyStatuses = [
      ApplicantStatusEnum.Rejected,
      ApplicantStatusEnum.Applied,
      ApplicantStatusEnum.Shortlisted,
      ApplicantStatusEnum.OnBoarded,
      ApplicantStatusEnum.Offboard,
      ApplicantStatusEnum.PreOfferCustom,
    ];
    if (readOnlyStatuses.includes(this.candidateStatus)) {
      this.isReadOnly = true;
    }
  }

  private switchFormState(): void {
    if (this.isApplied) {
      this.form?.enable();
    } else {
      this.form?.disable();
    }
  }

  private adjustCandidatePayRateField(): void {
    const candidatePayRateControl = this.form.get('candidatePayRate');

    if (this.isCandidatePayRateVisible && this.isOffered) {
      candidatePayRateControl?.enable();
    } else {
      candidatePayRateControl?.disable();
    }

    this.candidatePayRateRequired = this.isCandidatePayRateVisible && this.isOffered && this.isAgency;
  }

  private closeDialog(): void {
    this.closeModalEvent.emit();
    this.billRatesData = [];
    this.isReadOnly = false;
    this.isWithdraw = false;
    this.resetStatusSelectValue();
    this.form.markAsPristine();
  }

  private setCancellationControls(value: PenaltyCriteria): void {
    this.showHoursControl = value === PenaltyCriteria.RateOfHours || value === PenaltyCriteria.FlatRateOfHours;
    this.showPercentage = value === PenaltyCriteria.RateOfHours;
    this.verifyNoPenalty = value === PenaltyCriteria.NoPenalty;
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().subscribe(({ canCreateOrder}) => {
      this.canCreateOrder = canCreateOrder;
    });
  }

  private resetStatusSelectValue(): void {
    if (this.statusSelect) {
      this.statusSelect.value = null as unknown as number;
    }
  }

  public onSwitcher(event: { checked: boolean }): void {
    this.clearedToStart = event.checked;
    if(event.checked){
      this.store.dispatch(new ShowToast(MessageTypes.Success, CLEAR_START_ON));
    }
    this.clearToStartDataset.clearToStart = event.checked;
    this.clearToStartDataset.jobId = this.candidate.jobId ? this.candidate.jobId : this.candidateJob?.jobId;
    this.clearToStartDataset.organizationId = this.candidate.organizationId;
    this.store.dispatch(new SaveClearToStart(this.clearToStartDataset));
    this.actions$.pipe(ofActionDispatched(SaveClearToStartSucceeded), take(1))
                  .subscribe(() => {
                    this.orderManagementService.setCurrentClearToStartVal(event.checked);
                    this.store.dispatch(new ReloadOrganisationOrderCandidatesLists());                    
                  });

  }
}
