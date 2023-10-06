import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  SimpleChanges,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { catchError, distinctUntilChanged, filter, switchMap, take, takeUntil, skip, tap, of, Observable, Subject, takeWhile, combineLatest } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Store } from '@ngxs/store';

import { Comment } from '@shared/models/comment.model';
import { DateTimeHelper, Destroyable } from '@core/helpers';
import {
  CandidateDialogConfig,
  CandidateTitle,
  CloseReasonField,
  OptionField, StatusField,
} from '@shared/components/order-candidate-list/edit-irp-candidate/constants/edit-irp-candidate.constant';
import { FieldType } from '@core/enums';
import { EditIrpCandidateService } from '@shared/components/order-candidate-list/edit-irp-candidate/services';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CANCEL_CONFIRM_TEXT,
  CLOSE_IRP_POSITION,
  DELETE_CONFIRM_TITLE,
  INVALID_ZIP,
  RECORD_MODIFIED,
} from '@shared/constants';
import { atpStipendRate, CandidateField, CandidateForm } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';
import { OrderCandidateApiService } from '@shared/components/order-candidate-list/order-candidate-api.service';
import { ApplicantStatus, CandidatStatus } from '@shared/enums/applicant-status.enum';
import {
  GetConfigField,
} from '@shared/components/order-candidate-list/edit-candidate-list.helper';
import { CandidateDetails, ClosePositionDto, EditCandidateDialogState, JobDetailsDto,
} from '@shared/components/order-candidate-list/interfaces';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { CustomFormGroup } from '@core/interface';
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { DurationService } from '@shared/services/duration.service';
import { OrderType } from '@shared/enums/order-type';
import { PermissionService } from 'src/app/security/services/permission.service';
import { Order, OrderCandidateJob } from '@shared/models/order-management.model';
import { CommentsService } from '@shared/services/comments.service';
import { ManageOrderIRP_PERMISSION, CloseOrderIRP_PERMISSION } from '@shared/constants';
import { SettingsKeys } from '@shared/enums/settings';
import { OrganizationSettingsService } from '@shared/services/organization-settings.service';
import { Configuration } from '@shared/models/organization-settings.model';
import { Location } from "@shared/models/location.model"

@Component({
  selector: 'app-edit-irp-candidate',
  templateUrl: './edit-irp-candidate.component.html',
  styleUrls: ['./edit-irp-candidate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditIrpCandidateComponent extends Destroyable implements OnInit {
  @ViewChild('candidateDialog') candidateDialog: DialogComponent;
  configdata: any;
  zipcode: any;
  stipendData: atpStipendRate;

  @Input() set orderDetails(orderDetails : Order) {
    if(orderDetails){
      this.getOrderDetails(orderDetails);
      this.getLocationDetails(orderDetails);
    }
  };
  @Input() set handleOpenModal(modalState: EditCandidateDialogState) {
    if(modalState.isOpen) {
      this.candidateModelState = {...modalState};
      this.subscribeOnPermissions();
      this.isOnboarded = modalState.candidate.status === CandidatStatus.OnBoard;
      this.candidateJobId=this.candidateModelState.candidate.candidateJobId;
      this.getCandidateDetails();
    }
  }

  @Output() handleCloseModal: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() handleSuccessSaveCandidate: EventEmitter<void> = new EventEmitter<void>();
  @Input() public commentContainerId:number;
  @Input() public isIRPLTAOrder:boolean;
  public readonly optionFields: FieldSettingsModel = OptionField;
  public readonly title: string = CandidateTitle;
  public readonly FieldTypes = FieldType;
  public candidateForm: CustomFormGroup<CandidateForm>;
  public disableSaveButton = false;
  public dialogConfig: ReadonlyArray<CandidateField>;
  public isOnboarded = false;
  public canOnboardCandidateIRP:boolean;
  public canRejectedCandidateIRP:boolean;
  public replacementPdOrdersDialogOpen = false;
  public closingDate: Date;
  public isAppliedorShortlisted:boolean=false;
  public showactualStartEndDate:boolean;
  public availableStartDate:string | Date;
  public candidateJobId:number;
  public candidateCommentContainerId: number;
  public canCloseOrderIRP: boolean;
  public canManageOrderIRP:boolean;
  public ratePerHour : number = 96;
  public benefitpercentofsw : number;
  public wagePercent : number;
  public payrateData: Configuration[];
  public RegionDetails: Location[];

  //Calculation Variables
  public AtpCalcForm: FormGroup;
  hoursWorked : number = 36;
  costSaving: number;
  salaryWagesandBenefits: number;
  costSavingBenefits: number;
  adjustedTotalBenefits: number;
  stipendBenefits : number;
  stipendNonBenefits : number;
  adjustedTotalNonBenefits: number;
  stipendHourlyRate: number;
  contractLabourBenefit: number;
  contractLabourNonBenefit: number;
  fullyLoadedBenefit: number;
  fullyLoadedNonBenefit: number;
  benefitsBenefits: number;
  benefitsNonBenefits : number;
  meal : number;
  lodging : number;
  public showATPform: boolean = false;

  public comments: Comment[] = [];
  @Input() public externalCommentConfiguration ?: boolean | null;
  @Input() CanOrganizationViewOrdersIRP: boolean;
  @Input() CanOrganizationEditOrdersIRP: boolean;

  private candidateModelState: EditCandidateDialogState;
  private endDateFormControlValue: Date;
  private candidateDetails: CandidateDetails;

  constructor(
    private editIrpCandidateService: EditIrpCandidateService,
    private confirmService: ConfirmService,
    private orderCandidateApiService: OrderCandidateApiService,
    private cdr: ChangeDetectorRef,
    private store: Store,
    private permissionService: PermissionService,
    private orderManagementService: OrderManagementService,
    private durationService: DurationService,
    private commentsService: CommentsService,
    private organizationSettingService: OrganizationSettingsService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.dialogConfig = CandidateDialogConfig();
    this.candidateForm = this.editIrpCandidateService.createCandidateForm();
    this.subscribeForSettings();
  }

  ngOnInit(): void {
    this.observeCloseControl();
    this.observeStatusControl();
    this.watchForActualDateValues();
    this.createATPform();
    this.watchForValueChanges();
  }

  public watchForValueChanges(){
    if(this.AtpCalcForm){
      this.AtpCalcForm.get("hoursWorked")?.valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe((data) => {
        if(data){
          this.ratePerHour = data;
          this.performCalculations();
        }
      })
  
      this.AtpCalcForm.get("costSaving")?.valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe((data) => {
        if(data){
          this.costSaving = data;
          this.performCalculations();  
        }
      })
    }
  }

  createATPform(): void {
    this.performCalculations();
    this.AtpCalcForm = this.formBuilder.group({
      hoursWorked: [this.hoursWorked, [Validators.required]],
      costSaving: [this.costSaving, [Validators.required]]
    });

  }

  ngOnChanges(changes : SimpleChanges): void {
    this.performCalculations();
    this.watchForValueChanges();
  }

  save(): void {
    const { status, closeDate } = this.candidateForm.getRawValue();

    if (!this.candidateForm.valid) {
      this.candidateForm.markAllAsTouched();
      return;
    }

    if (this.candidateForm.get('isClosed')?.value) {
      this.confirmService.confirm(
        CLOSE_IRP_POSITION,
        {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Close',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => confirm),
          tap(() => {
            this.closingDate = closeDate || new Date();
            this.showReplacementPdOrdersDialog();
          }),
          take(1),
        ).subscribe();

      return;
    }

    if (status === CandidatStatus.Cancelled) {
      this.closingDate = new Date();
      this.showReplacementPdOrdersDialog();

      return;
    }

    this.saveCandidate();
  }

  private subscribeForSettings(): void {
    this.organizationSettingService.getOrganizationSettings().subscribe(data => {
      this.payrateData = data.filter(settingdata => settingdata.settingKey === SettingsKeys.ATPRateCalculation);
      this.configdata = Object.assign({},...this.payrateData);
      this.configdata = JSON.parse(this.configdata.value);
      if(this.configdata){
        this.benefitpercentofsw = this.configdata.benefitPercent;
        this.costSaving = this.configdata.costSavings;
        this.wagePercent = this.configdata.wagePercent;  
      }
      this.createATPform();
    });
  }

  public getOrderDetails(orderDetails : Order){
      this.editIrpCandidateService.getPredefinedBillRatesforRatePerHour(1, orderDetails.departmentId, orderDetails.skillId).pipe(
        takeUntil(this.componentDestroy()),
        take(1)
      ).subscribe(data => {
        if(data) {
          this.ratePerHour = data.amountMultiplier;
        }
      }) ;
    }

  private getATPstipendRate() {
    this.editIrpCandidateService.getATPstipendRate(this.zipcode, DateTimeHelper.setUtcTimeZone(this.candidateDetails.actualStartDate as Date)).pipe(
      takeUntil(this.componentDestroy()),
      take(1)
    ).subscribe((data) => {
      if(data){
        this.stipendData = data;
        this.meal = this.stipendData.mealrate;
        this.lodging = this.stipendData.lodgingrate;
        if(this.meal == 0 || this.lodging == 0){
          this.showATPform = false;
          this.store.dispatch(new ShowToast(MessageTypes.Error, INVALID_ZIP))
        }
        this.stipendBenefits = (!Number.isNaN(this.meal + this.lodging)) ? this.meal + this.lodging : 0;
        this.stipendNonBenefits = (!Number.isNaN(this.meal + this.lodging)) ? this.meal + this.lodging : 0;
      }
    })
    this.performCalculations();
  }

  private getLocationDetails(orderDetails : Order) {
    this.editIrpCandidateService.getLocationsByRegionId(orderDetails.regionId).pipe(
      takeUntil(this.componentDestroy()), take(1)).subscribe(data=> {
      if(data){
        this.RegionDetails = data;
        for(let i=0; i<this.RegionDetails.length; i++){
         if(this.RegionDetails[i].id === orderDetails.locationId){
          this.zipcode = this.RegionDetails[i].zip;
         }
        }
      }
    });
  }
  
  private performCalculations(): void {
    this.salaryWagesandBenefits = (!Number.isNaN(this.ratePerHour * this.hoursWorked != null)) ? this.ratePerHour * this.hoursWorked : 0;
    this.costSavingBenefits = (!Number.isNaN(this.salaryWagesandBenefits / this.costSaving)) ? (this.salaryWagesandBenefits / this.costSaving) : 0; 
    this.benefitsBenefits = (!Number.isNaN(this.salaryWagesandBenefits * (this.benefitpercentofsw / 100))) ? (this.salaryWagesandBenefits * (this.benefitpercentofsw / 100)) : 0;
    this.benefitsNonBenefits = (!Number.isNaN(this.salaryWagesandBenefits * (this.wagePercent / 100))) ? (this.salaryWagesandBenefits * (this.wagePercent / 100)) : 0;
    this.adjustedTotalBenefits = (!Number.isNaN(this.salaryWagesandBenefits - (this.benefitsBenefits + this.costSavingBenefits + this.stipendBenefits))) ? 
                                  (this.salaryWagesandBenefits - (this.benefitsBenefits + this.costSavingBenefits + this.stipendBenefits)) : 0;
    this.adjustedTotalNonBenefits = (!Number.isNaN(this.salaryWagesandBenefits - (this.benefitsNonBenefits + this.costSavingBenefits + this.stipendNonBenefits))) ? 
                                  (this.salaryWagesandBenefits - (this.benefitsNonBenefits + this.costSavingBenefits + this.stipendNonBenefits)) : 0;
    this.stipendHourlyRate = (!Number.isNaN(this.stipendBenefits / this.hoursWorked)) ? (this.stipendBenefits / this.hoursWorked) : 0;
    this.contractLabourBenefit = (!Number.isNaN(this.adjustedTotalBenefits / this.hoursWorked)) ? (this.adjustedTotalBenefits / this.hoursWorked) : 0;
    this.contractLabourNonBenefit = (!Number.isNaN(this.adjustedTotalNonBenefits / this.hoursWorked)) ? (this.adjustedTotalNonBenefits / this.hoursWorked) : 0;
    this.fullyLoadedBenefit = (!Number.isNaN(this.contractLabourBenefit + this.stipendHourlyRate)) ? this.contractLabourBenefit + this.stipendHourlyRate : 0;
    this.fullyLoadedNonBenefit = (!Number.isNaN(this.contractLabourNonBenefit + this.stipendHourlyRate)) ? this.contractLabourNonBenefit + this.stipendHourlyRate : 0;
    this.cdr.markForCheck();
  }

  showReplacementPdOrdersDialog(show = true): void {
    this.replacementPdOrdersDialogOpen = show;
    this.cdr.markForCheck();
  }

  setCreateReplacement(createReplacement: boolean) {
    this.saveCandidate(createReplacement);
  }

  private getComments(): void {
    this.commentsService.getComments(this.candidateCommentContainerId, null)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
        this.cdr.markForCheck();
    });
  }

  public closeModal(): void {
    if (this.candidateForm?.touched) {
      this.confirmService.confirm(
        CANCEL_CONFIRM_TEXT,
        {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          take(1),
          filter(Boolean),
        ).subscribe(() => {
          this.hideDialog();
        });
    } else {
      this.hideDialog();
    }
  }

  public trackByCandidateField(index: number, config: CandidateField): string {
    return config.field;
  }

  private saveCandidate(createReplacement = false): void {
    if (!this.candidateForm.get('isClosed')?.value) {
      this.editIrpCandidateService.getCandidateAction(this.candidateForm, this.candidateModelState, createReplacement,this.isIRPLTAOrder)
      .pipe(
        catchError((error: HttpErrorResponse) => this.orderCandidateApiService.handleError(error)),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        this.handleSuccessSaveCandidate.emit();
        this.hideDialog();
        this.orderManagementService.setCandidate(true);
      });
    } else {
      if (this.canManageOrderIRP && this.canCloseOrderIRP) {
        this.closeIrpPosition(createReplacement);
      }
      else {
        if (!this.canManageOrderIRP) {
          this.store.dispatch(new ShowToast(MessageTypes.Error, ManageOrderIRP_PERMISSION));
        }
        else if (!this.canCloseOrderIRP) {
          this.store.dispatch(new ShowToast(MessageTypes.Error, CloseOrderIRP_PERMISSION));
        }
      }
    }
  }

  private closeIrpPosition(createReplacement: boolean): void {
    const closeDto: ClosePositionDto = {
      jobId: this.candidateModelState.candidate.candidateJobId,
      reasonId: this.candidateForm.get('reason')?.value,
      closingDate: DateTimeHelper.setUtcTimeZone(this.candidateForm.get('closeDate')?.value as Date),
      createReplacement,
    };

    this.orderCandidateApiService.closeIrpPosition(closeDto)
      .pipe(
        catchError((error: HttpErrorResponse) => this.orderCandidateApiService.handleError(error)),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      this.handleSuccessSaveCandidate.emit();
      this.hideDialog();
    });
  }

  private getCandidateDetails(): void {
    this.orderCandidateApiService.getIrpCandidateDetails(
      this.candidateModelState.order.id, this.candidateModelState.candidate.candidateProfileId,this.isIRPLTAOrder)
    .pipe(
        filter(Boolean),
        tap((candidateDetails: CandidateDetails) => {
          this.candidateDetails = candidateDetails;
          this.getATPstipendRate();
          this.candidateCommentContainerId = candidateDetails.commentContainerId;
          this.getComments();
          const statusConfigField = GetConfigField(this.dialogConfig, StatusField);

          statusConfigField.dataSource = this.editIrpCandidateService
          .createStatusOptions([...candidateDetails.availableStatuses ?? []]);
          if(!this.canOnboardCandidateIRP){
            const objWithIdIndex = statusConfigField.dataSource.findIndex((obj:any) => obj.text === "Onboard");
            if (objWithIdIndex > -1) {
              statusConfigField.dataSource.splice(objWithIdIndex, 1);
            }
          }
          if(!this.canRejectedCandidateIRP){
            const objWithIdIndex = statusConfigField.dataSource.findIndex((obj:any) => obj.text === "Reject");
            if (objWithIdIndex > -1) {
              statusConfigField.dataSource.splice(objWithIdIndex, 1);
            }
          }
          this.availableStartDate = candidateDetails.actualStartDate;
          this.candidateForm.patchValue({
            actualStartDate: DateTimeHelper.setCurrentTimeZone(candidateDetails.actualStartDate as string),
            actualEndDate: DateTimeHelper.setCurrentTimeZone(candidateDetails.actualEndDate as string),
          }, { emitEvent: false, onlySelf: true });
        }),
        switchMap(() => {
          const reasonConfigField = GetConfigField(this.dialogConfig, CloseReasonField);

          if (this.candidateModelState.candidate.status === CandidatStatus.Cancelled
            || this.candidateModelState.candidate.status === CandidatStatus.Offboard) {
            const jobDto: JobDetailsDto = {
              OrganizationId: this.candidateModelState.order.organizationId as number,
              JobId: this.candidateModelState.candidate.candidateJobId,
            };

            reasonConfigField.dataSource = this.editIrpCandidateService
              .createReasonsOptions(this.editIrpCandidateService.getClosureReasons());

            return this.orderCandidateApiService.getPositionDetails(jobDto)
            .pipe(
              tap((job) => {
                this.setStatusSourceForDisabled(job.applicantStatus);
                this.setCloseData(job);
                this.disableDialogControls();
              })
            );
          }

          this.candidateForm.enable();
          reasonConfigField.dataSource = this.editIrpCandidateService
            .createReasonsOptions(this.editIrpCandidateService.getClosureReasons(true));

          return of(null);
        }),
        takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.candidateDialog.show();
      this.cdr.markForCheck();
    });
  }

  private watchForActualDateValues(): void {
    this.candidateForm.get('actualStartDate')?.valueChanges.pipe(
      filter((value: string) => {
        return !!value && this.candidateModelState.order.orderType === OrderType.LongTermAssignment
          && this.candidateForm.get('status')?.value !== CandidatStatus.Cancelled;
      }),
      skip(1),
      distinctUntilChanged(),
      takeUntil(this.componentDestroy()),
    ).subscribe((value: string) => {
      const actualStartDate = new Date(value);
      const jobStartDate = this.candidateModelState.order.jobStartDate;
      const jobEndDate = this.candidateModelState.order.jobEndDate;
      const actualEndDate = this.durationService.getEndDate(
        this.candidateModelState.order.duration,
        actualStartDate, {
          jobStartDate,
          jobEndDate,
        });

      this.candidateForm.get('actualEndDate')?.patchValue(actualEndDate, { emitEvent: false, onlySelf: true });
    });

    this.candidateForm.get('actualEndDate')?.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.componentDestroy()),
    ).subscribe((date: Date) => {
      this.setIsClosedFormControlState(this.candidateForm.get('status')?.value, date);
      this.cdr.markForCheck();
    });

    this.candidateForm.get("status")?.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.componentDestroy()),
    ).subscribe((status : string) => {
      if(JSON.parse(status) == ApplicantStatus.OnBoarded){
        this.showATPform = true;
      } else {
        this.showATPform = false;
      }
    });
  }

  private hideDialog(): void {
    this.handleCloseModal.emit(false);
    this.candidateDialog.hide();
    this.disableSaveButton = false;
    this.removeEndDateControlLimitations(
      this.candidateForm.get('actualEndDate') as FormControl,
      this.getConfigField('actualEndDate')
    );
    this.candidateForm.reset();
  }

  private observeCloseControl(): void {
    this.candidateForm.get('isClosed')?.valueChanges
    .pipe(
      distinctUntilChanged(),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((value) => {
      if (value) {
        this.editIrpCandidateService.setValidatorsForClose(this.candidateForm);
      } else {
        this.editIrpCandidateService.setDefaultValidators(this.candidateForm);
      }

      this.candidateForm.markAsUntouched();
      this.candidateForm.updateValueAndValidity();
      this.cdr.markForCheck();
    });
  }

  private observeStatusControl(): void {
    this.candidateForm.get('status')?.valueChanges
    .pipe(
      distinctUntilChanged(),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((value) => {
     this.isAppliedorShortlisted = value === CandidatStatus.Applied || value === CandidatStatus.Shortlisted;
     this.showactualStartEndDate = value === CandidatStatus.OnBoard
       || value === CandidatStatus.Cancelled ||value === CandidatStatus.Offboard;
     this.candidateForm.get('availableStartDate')?.patchValue(
       DateTimeHelper.setCurrentTimeZone(this.availableStartDate as string), { emitEvent: false, onlySelf: true }
     );
     this.handleCancelledStatus(value);
     this.cdr.markForCheck();
  });
  }

  private setStatusSourceForDisabled(jobStatus: {
    applicantStatus: number;
    statusText: string;
  }): void {
    const statusConfig = GetConfigField(this.dialogConfig, StatusField);

    statusConfig.dataSource = [{
      text: jobStatus.statusText,
      value: jobStatus.applicantStatus,
    }];
    if(!this.canOnboardCandidateIRP){
      const objWithIdIndex = statusConfig.dataSource.findIndex((obj:any) => obj.text === "Onboard");
      if (objWithIdIndex > -1) {
        statusConfig.dataSource.splice(objWithIdIndex, 1);
      }
    }
    if(!this.canRejectedCandidateIRP){
      const objWithIdIndex = statusConfig.dataSource.findIndex((obj:any) => obj.text === "Reject");
      if (objWithIdIndex > -1) {
        statusConfig.dataSource.splice(objWithIdIndex, 1);
      }
    }
  }
  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe(({ canOnboardCandidateIRP,canRejectCandidateIRP,canCloseOrderIRP,canManageOrderIRP }) => {
      this.canOnboardCandidateIRP=canOnboardCandidateIRP;
      this.canRejectedCandidateIRP=canRejectCandidateIRP;
      this.canCloseOrderIRP=canCloseOrderIRP;
      this.canManageOrderIRP=canManageOrderIRP;
    });
  }

  private setCloseData(job: OrderCandidateJob): void {
    this.candidateForm.patchValue({
      status: job.applicantStatus.applicantStatus,
      isClosed: true,
      reason: job.positionClosureReasonId,
      closeDate: DateTimeHelper.setCurrentTimeZone(job.closeDate as string),
    });
  }

  private disableDialogControls(): void {
    this.disableSaveButton = true;
    this.candidateForm.disable();
  }

  private handleCancelledStatus(status: CandidatStatus): void {
    if (!status) {
      return;
    }

    const endDateFormControl = this.candidateForm.get('actualEndDate');
    const startDateFormControl = this.candidateForm.get('actualStartDate');
    const endDateConfigField = this.getConfigField('actualEndDate');

    if (status === CandidatStatus.Cancelled) {
      startDateFormControl?.disable();
      endDateConfigField.required = true;
      endDateConfigField.minDate = this.candidateDetails?.actualStartDate
        ? new Date(this.candidateDetails.actualStartDate) : null;
      endDateConfigField.maxDate = this.candidateDetails?.actualEndDate
        ? new Date(this.candidateDetails.actualEndDate) : null;
      this.endDateFormControlValue = endDateFormControl?.value;
      endDateFormControl?.reset();
      endDateFormControl?.setValidators([Validators.required]);
    } else {
      this.removeEndDateControlLimitations(endDateFormControl as FormControl, endDateConfigField);
      endDateFormControl?.setValue(this.endDateFormControlValue);
      startDateFormControl?.enable();
    }

    endDateFormControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  private setIsClosedFormControlState(status: CandidatStatus, endDate: Date): void {
    if (!status) {
      return;
    }

    const isClosedFormControl = this.candidateForm.get('isClosed');
    const closeDateConfigField = this.getConfigField('closeDate');
    if (status === CandidatStatus.Cancelled && (!endDate || !DateTimeHelper.isFutureDate(endDate.toISOString()))) {
      isClosedFormControl?.setValue(false);
      isClosedFormControl?.disable();
    } else {
      isClosedFormControl?.enable();
    }

    if (status === CandidatStatus.Cancelled && endDate && DateTimeHelper.isFutureDate(endDate.toISOString())) {
      closeDateConfigField.maxDate = endDate;
    } else {
      closeDateConfigField.maxDate = null;
    }
  }

  private removeEndDateControlLimitations(endDateFormControl: FormControl, endDateConfigField: CandidateField): void {
    endDateConfigField.required = false;
    endDateConfigField.minDate = null;
    endDateConfigField.maxDate = null;
    endDateFormControl.setValidators([]);
  }

  private getConfigField(field: string): CandidateField {
    return this.dialogConfig.find((item) => item.field === field) as CandidateField;
  }
}
