import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { catchError, distinctUntilChanged, filter, of, skip, Subscription, switchMap, take, takeUntil, tap } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Store } from '@ngxs/store';

import { Comment } from '@shared/models/comment.model';
import { DateTimeHelper, Destroyable } from '@core/helpers';
import {
  AcceptConfigFieldsToShow,
  CancelReasonField,
  CandidateDialogConfig,
  CandidateTitle,
  CloseReasonField,
  DefaultConfigFieldsToShow,
  OfferedConfigFieldsToShow,
  OfferedDates,
  OfferedStatusFlow,
  OnboardConfigFieldsToShow,
  OptionField,
  RejectedReasonField,
  StatusField,
  SwitcherValue,
  SwitcherValueEnum,
} from '@shared/components/order-candidate-list/edit-irp-candidate/constants/edit-irp-candidate.constant';
import { FieldType } from '@core/enums';
import { EditIrpCandidateService } from '@shared/components/order-candidate-list/edit-irp-candidate/services';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CANCEL_CONFIRM_TEXT,
  CLOSE_IRP_POSITION,
  CloseOrderIRP_PERMISSION,
  DefaultMaxDate,
  DefaultMinDate,
  DELETE_CONFIRM_TITLE,
  ManageOrderIRP_PERMISSION,
  RECORD_MODIFIED,
} from '@shared/constants';
import { atpStipendRate, CandidateField, CandidateForm } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';
import { OrderCandidateApiService } from '@shared/components/order-candidate-list/order-candidate-api.service';
import { ApplicantStatus, CandidatStatus } from '@shared/enums/applicant-status.enum';
import {
  DisableControls,
  GetConfigField,
  UpdateVisibilityConfigFields,
} from '@shared/components/order-candidate-list/edit-candidate-list.helper';
import {
  CandidateDetails,
  ClosePositionDto,
  EditCandidateDialogState,
  JobDetailsDto,
} from '@shared/components/order-candidate-list/interfaces';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { CustomFormGroup } from '@core/interface';
import { OrderManagementService, } from '@client/order-management/components/order-management-content/order-management.service';
import { DurationService } from '@shared/services/duration.service';
import { OrderType } from '@shared/enums/order-type';
import { PermissionService } from 'src/app/security/services/permission.service';
import { Order, OrderCandidateJob } from '@shared/models/order-management.model';
import { CommentsService } from '@shared/services/comments.service';
import { SettingsKeys } from '@shared/enums/settings';
import { OrganizationSettingsService } from '@shared/services/organization-settings.service';
import { Configuration } from '@shared/models/organization-settings.model';
import { Location } from "@shared/models/location.model"
import { GetRejectReasonsForOrganisation } from '@client/store/order-managment-content.actions';
import { SystemType } from '@shared/enums/system-type.enum';
import { ProfileStatusesEnum } from '@client/candidates/candidate-profile/candidate-profile.constants';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { BillRate } from '@shared/models';
import { Duration } from '@shared/enums/durations';

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
      this.orderDetailsData = orderDetails;
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
      this.watchForActualDateValues();
      this.watchForOfferedDateValue();
    } else {
      this.clearDatesSubscription();
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
  public isAppliedorShortlisted = false;
  public showactualStartEndDate:boolean;
  public availableStartDate:string | Date;
  public candidateJobId:number;
  public candidateCommentContainerId: number;
  public canCloseOrderIRP: boolean;
  public canManageOrderIRP:boolean;
  public ratePerHour : number = 96;
  public benefitpercentofsw : number;
  public wagePercent : number;
  public isTurnedOn : boolean;
  public payrateData: Configuration[];
  public RegionDetails: Location[];
  public readonly profileStatus = ProfileStatusesEnum;

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
  public showbenefits: boolean = true;
  public showError: boolean = false;
  public SwitcherCalcvariables = SwitcherValue;
  public shownonbenefits: boolean = true;
  public candidateModelState: EditCandidateDialogState;
  public readonly statuses = CandidatStatus;
  public comments: Comment[] = [];
  @Input() public externalCommentConfiguration ?: boolean | null;
  @Input() CanOrganizationViewOrdersIRP: boolean;
  @Input() CanOrganizationEditOrdersIRP: boolean;

  private endDateFormControlValue: Date;
  private candidateDetails: CandidateDetails;
  private actualStartDateSubscription: Subscription | null;
  private offeredDateSubscription: Subscription | null;
  private orderDetailsData: Order;

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
    private orderManagementContentService: OrderManagementContentService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.dialogConfig = CandidateDialogConfig();
    this.candidateForm = this.editIrpCandidateService.createCandidateForm();
    this.subscribeForSettings();
  }

  ngOnInit(): void {
    this.getRejectedReasons();
    this.observeCloseControl();
    this.observeStatusControl();
    this.createATPform();
    this.watchForValueChanges();
  }

  public watchForValueChanges(){
    this.candidateForm.get('actualStartDate')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: Date) => {
      const duration = this.orderDetailsData.duration;

      if (isNaN(duration) || !(value instanceof Date)) {
        return;
      }

      this.autoSetupJobEndDateControl(duration, value);
      this.cdr.markForCheck();
    });

    if(this.AtpCalcForm){
      this.AtpCalcForm.get("hoursWorked")?.valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe((data) => {
        if(data){
          this.hoursWorked = data;
          this.getATPstipendRate();
        }
      })

      this.AtpCalcForm.get("costSaving")?.valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe((data) => {
        if(data){
          this.costSaving = data;
          this.getATPstipendRate();
        }
      });

      this.AtpCalcForm.get("calculations")?.valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe((data) => {
        if(data == SwitcherValueEnum.Benefits){
          this.showbenefits = true;
          this.shownonbenefits = false;
        } else if (data == SwitcherValueEnum.NonBenefits){
          this.shownonbenefits = true;
          this.showbenefits = false;
        } else {
          this.showbenefits = true;
          this.shownonbenefits = true;
        }
        this.getATPstipendRate();
      });

      this.candidateForm.get("actualStartDate")?.valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe((data) => {
        if(data){
          this.candidateDetails.actualStartDate = data;
          if(this.candidateForm.get('status')?.value === ApplicantStatus.OnBoarded){
            this.getATPstipendRate();
          }
        }
      });
    }
  }

  createATPform(): void {
    this.AtpCalcForm = this.formBuilder.group({
      hoursWorked: [this.hoursWorked, [Validators.required]],
      costSaving: [this.costSaving, [Validators.required]],
      calculations : [SwitcherValueEnum.All]
    });
    this.performCalculations();
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
      const actualEndDate = this.candidateForm.get('actualEndDate')?.value;

      this.closingDate = actualEndDate || new Date();
      this.showReplacementPdOrdersDialog();

      return;
    }

    this.saveCandidate();
  }

  private subscribeForSettings(): void {
    this.organizationSettingService.getOrganizationSettings().subscribe(data => {
      this.payrateData = data.filter(settingdata => settingdata.settingKey === SettingsKeys.ATPRateCalculation);
      this.configdata = Object.assign({},...this.payrateData);
      this.configdata = this.configdata.value && JSON.parse(this.configdata.value);
      if(this.configdata){
        this.benefitpercentofsw = this.configdata.benefitPercent;
        this.costSaving = this.configdata.costSavings;
        this.wagePercent = this.configdata.wagePercent;
        this.isTurnedOn = this.configdata.isEnabled;
      }
      this.createATPform();
    });
  }

  public getOrderDetails(orderDetails : Order){
    const jobStartDate = DateTimeHelper.setUtcTimeZone(orderDetails.jobStartDate);
    const jobEndDate = DateTimeHelper.setUtcTimeZone(orderDetails.jobEndDate);
    this.orderManagementContentService
      .getRegularBillRate(OrderType.LongTermAssignment, orderDetails.departmentId, orderDetails.skillId, jobStartDate, jobEndDate)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((billRate: BillRate) => {
        this.ratePerHour = parseInt(billRate?.rateHour.toFixed(2)) || 0;
      });
    }

  private getATPstipendRate() {
    if (!this.candidateDetails.actualStartDate) {
      return;
    }

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
        }
        this.stipendBenefits = (!Number.isNaN(this.meal + this.lodging)) ? this.meal + this.lodging : 0;
        this.stipendNonBenefits = (!Number.isNaN(this.meal + this.lodging)) ? this.meal + this.lodging : 0;
        this.adjustedTotalBenefits = (!Number.isNaN(this.salaryWagesandBenefits - (this.benefitsBenefits + this.costSavingBenefits + this.stipendBenefits))) ?
        (this.salaryWagesandBenefits - (this.benefitsBenefits + this.costSavingBenefits + this.stipendBenefits)) : 0;
        this.adjustedTotalNonBenefits = (!Number.isNaN(this.salaryWagesandBenefits - (this.benefitsNonBenefits + this.costSavingBenefits + this.stipendNonBenefits))) ?
                (this.salaryWagesandBenefits - (this.benefitsNonBenefits + this.costSavingBenefits + this.stipendNonBenefits)) : 0;
        this.stipendHourlyRate = (!Number.isNaN(this.stipendBenefits / this.hoursWorked)) ? (this.stipendBenefits / this.hoursWorked) : 0;
        this.contractLabourBenefit = (!Number.isNaN(this.adjustedTotalBenefits / this.hoursWorked)) ? (this.adjustedTotalBenefits / this.hoursWorked) : 0;
        this.contractLabourNonBenefit = (!Number.isNaN(this.adjustedTotalNonBenefits / this.hoursWorked)) ? (this.adjustedTotalNonBenefits / this.hoursWorked) : 0;
        this.fullyLoadedBenefit = (!Number.isNaN(this.contractLabourBenefit + this.stipendHourlyRate)) ? this.contractLabourBenefit + this.stipendHourlyRate : 0;
        this.fullyLoadedNonBenefit = (!Number.isNaN(this.contractLabourNonBenefit + this.stipendHourlyRate)) ? this.contractLabourNonBenefit + this.stipendHourlyRate : 0;
        this.performCalculations();
        this.cdr.detectChanges();
      }
    },(error) => {
      if(error){
        this.meal = this.lodging = 0;
      }
    })
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


  private autoSetupJobEndDateControl(duration: Duration, jobStartDate: Date): void {
    const jobStartDateValue = new Date(jobStartDate.getTime());
    const jobEndDateValue = new Date(this.candidateDetails.actualEndDate);
    const jobEndDateControl = this.candidateForm.get('actualEndDate') as AbstractControl;
    if(this.candidateModelState.candidate.status === CandidatStatus.Cancelled){
      jobEndDateControl.patchValue(jobEndDateValue);
    } else {
      const jobEndDate: Date = this.durationService.getEndDate(duration, jobStartDateValue);
      jobEndDateControl.patchValue(jobEndDate);
    }
  }


  private performCalculations(): void {
    this.salaryWagesandBenefits = (!Number.isNaN(this.ratePerHour * this.hoursWorked != null)) ? this.ratePerHour * this.hoursWorked : 0;
    this.costSavingBenefits = (!Number.isNaN((this.salaryWagesandBenefits * this.costSaving) / 100)) ? ((this.salaryWagesandBenefits * this.costSaving) / 100) : 0;
    this.benefitsBenefits = (!Number.isNaN(this.salaryWagesandBenefits * (this.benefitpercentofsw / 100))) ? (this.salaryWagesandBenefits * (this.benefitpercentofsw / 100)) : 0;
    this.benefitsNonBenefits = (!Number.isNaN(this.salaryWagesandBenefits * (this.wagePercent / 100))) ? (this.salaryWagesandBenefits * (this.wagePercent / 100)) : 0;
    this.cdr.detectChanges();
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
      this.editIrpCandidateService.getCandidateAction(
        this.candidateForm,
        this.candidateModelState,
        createReplacement,
        this.isIRPLTAOrder
      ).pipe(
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

  // eslint-disable-next-line max-lines-per-function
  private getCandidateDetails(): void {
    this.orderCandidateApiService.getIrpCandidateDetails(
      this.candidateModelState.order.id, this.candidateModelState.candidate.candidateProfileId,this.isIRPLTAOrder)
    .pipe(
        filter(Boolean),
        tap((candidateDetails: CandidateDetails) => {
          this.candidateDetails = candidateDetails;
          this.getATPstipendRate();
          this.updateVisibilityConfig(this.candidateModelState.candidate.status, candidateDetails);
          this.handleOfferedStatus(
            this.candidateModelState.candidate.status,
            candidateDetails.offeredStartDate as string,
            candidateDetails.offeredEndDate as string
          );
          this.handleAcceptedStatus(this.candidateModelState.candidate.status, candidateDetails);

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
          const rejectionReasonField = GetConfigField(this.dialogConfig, RejectedReasonField);
          const cancelReasonField = GetConfigField(this.dialogConfig, CancelReasonField);

          rejectionReasonField.dataSource = this.editIrpCandidateService.createReasonsOptions(this.editIrpCandidateService.getRejectedReasons());
          cancelReasonField.dataSource = this.editIrpCandidateService.createReasonsOptions(
            this.editIrpCandidateService.getCancelEmployeeReasons().filter(reason => {
              return this.candidateModelState.candidate.status === CandidatStatus.Cancelled || reason.organizationId;
            })
          );

          this.populateCancellationReasonIdField();

          if (this.candidateModelState.candidate.status === CandidatStatus.Cancelled
            || this.candidateModelState.candidate.status === CandidatStatus.Offboard) {
            const jobDto: JobDetailsDto = {
              OrganizationId: this.candidateModelState.order.organizationId as number,
              JobId: this.candidateModelState.candidate.candidateJobId,
            };

            reasonConfigField.dataSource = this.editIrpCandidateService.createReasonsOptions(this.editIrpCandidateService.getClosureReasons());

            return this.orderCandidateApiService.getPositionDetails(jobDto)
            .pipe(
              tap((job) => {
                this.setStatusSourceForDisabled(job.applicantStatus);
                this.setCloseData(job);
                this.disableDialogControls();
              })
            );
          }

          this.candidateForm.enable({ emitEvent: false, onlySelf: true });
          this.populateFormForRejectedEmployee();

          this.editIrpCandidateService.disableOfferedDateControls(
            this.candidateModelState.candidate.status,
            this.candidateDetails,
            this.candidateForm
          );
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

  private populateCancellationReasonIdField(): void {
    if (this.candidateModelState.candidate.status === CandidatStatus.Cancelled) {
      this.candidateForm.get(CancelReasonField)?.patchValue(this.candidateDetails.cancellationReasonId, { emitEvent: false, onlySelf: true })
    }
  }

  private watchForOfferedDateValue(): void {
    const offeredStartDate = this.candidateForm.get('offeredStartDate');
    const offeredEndDate = this.candidateForm.get('offeredEndDate');

    if(offeredStartDate && offeredEndDate) {
      this.offeredDateSubscription = offeredStartDate.valueChanges.pipe(
        distinctUntilChanged(),
        takeUntil(this.componentDestroy()),
      ).subscribe((value: string) => {
        const actualEndDate = this.calculateEndDate(value);

        offeredEndDate?.patchValue(actualEndDate, { emitEvent: false, onlySelf: true });
      });
    }
  }

  private populateFormForRejectedEmployee(): void {
    if(this.candidateModelState.candidate.status === CandidatStatus.Rejected) {
      const fieldsToShow = this.editIrpCandidateService.getFieldsForRejectedEmployee(this.candidateDetails);
      this.isAppliedorShortlisted = fieldsToShow.includes('availableStartDate');
      this.showactualStartEndDate = fieldsToShow.includes('actualStartDate') && fieldsToShow.includes('actualEndDate');

      UpdateVisibilityConfigFields(this.dialogConfig, fieldsToShow);

      this.candidateForm.patchValue({
        ...this.candidateDetails,
        status: CandidatStatus.Rejected,
        rejectedReason: this.candidateDetails.rejectionReasonId,
      }, { emitEvent: false, onlySelf: true });

      const enableStatusControl = this.orderDetailsData.orderType === OrderType.LongTermAssignment
      && this.candidateModelState.candidate.profileStatus !== this.profileStatus.OnHold
      && this.orderDetailsData.status !== OrderStatus.Filled && this.orderDetailsData.status !== OrderStatus.Cancelled
      && this.orderDetailsData.status !== OrderStatus.Closed;
      this.disableSaveButton = !enableStatusControl;
      DisableControls(fieldsToShow, this.candidateForm, enableStatusControl);
    }
  }

  private watchForActualDateValues(): void {
    this.actualStartDateSubscription = this.candidateForm.get('actualStartDate')?.valueChanges.pipe(
      filter((value: string) => {
        return !!value && this.candidateModelState.order.orderType === OrderType.LongTermAssignment
          && this.candidateForm.get('status')?.value !== CandidatStatus.Cancelled;
      }),
      skip(1),
      distinctUntilChanged(),
      takeUntil(this.componentDestroy()),
    ).subscribe((value: string) => {
      const actualEndDate = this.calculateEndDate(value);

      this.candidateForm.get('actualEndDate')?.patchValue(actualEndDate, { emitEvent: false, onlySelf: true });
    }) || null;


    this.candidateForm.get("status")?.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.componentDestroy()),
    ).subscribe((status : string) => {
      if(JSON.parse(status) == ApplicantStatus.OnBoarded){
        if(this.meal !== 0){
          this.showATPform = true;
          this.showError = false;
        } else {
          this.showATPform = false;
          this.showError = true;
        }
      } else {
        this.showATPform = false;
        this.showError = false;
      }
    });

  }


  private calculateEndDate(value: string): Date {
    const actualStartDate = new Date(value);
    const jobStartDate = this.candidateModelState.order.jobStartDate;
    const jobEndDate = this.candidateModelState.order.jobEndDate;
    const endDate = this.durationService.getEndDate(
      this.candidateModelState.order.duration,
      actualStartDate, {
        jobStartDate,
        jobEndDate,
      });

    return endDate;
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
      this.updateVisibilityConfig(value, this.candidateDetails);
      this.isAppliedorShortlisted = value === CandidatStatus.Applied || value === CandidatStatus.Shortlisted;
      this.showactualStartEndDate = value === CandidatStatus.OnBoard
       || value === CandidatStatus.Cancelled || value === CandidatStatus.Offboard || value === CandidatStatus.Accepted;
      this.candidateForm.get('availableStartDate')?.patchValue(
        DateTimeHelper.setCurrentTimeZone(this.availableStartDate as string), { emitEvent: false, onlySelf: true }
      );
      this.handleRejectStatus(value);
      this.handleCancelledStatus(value);
      this.handleOfferedStatus(
       value,
       this.candidateDetails?.offeredStartDate as string,
       this.candidateDetails?.offeredEndDate as string
      );
      this.cdr.markForCheck();
  });
  }

  private handleAcceptedStatus(status: CandidatStatus, details: CandidateDetails): void {
    if(!status || status !== CandidatStatus.Accepted) {
      return;
    }

    this.showactualStartEndDate = status === CandidatStatus.Accepted;
    const formValues = this.editIrpCandidateService.setCurrentTimeToDates(details);

    this.candidateForm.patchValue(formValues, { emitEvent: false, onlySelf: true });
  }

  private handleOfferedStatus(
    status: CandidatStatus,
    startDate?: string,
    endDate?: string
  ): void {
    const isStatusEqualCandidateStatus = status === CandidatStatus.OnBoard && this.candidateModelState.candidate.status === CandidatStatus.OnBoard;

    if(!status || (!OfferedStatusFlow.includes(status) && !(isStatusEqualCandidateStatus))) {
      return;
    }

    const actualStartDate = isStatusEqualCandidateStatus && !startDate ? startDate : this.candidateDetails.actualStartDate;
    const actualEndDate = isStatusEqualCandidateStatus && !endDate ? endDate : this.candidateDetails.actualEndDate;
    const offeredStartDate = startDate || actualStartDate ? DateTimeHelper.setCurrentTimeZone(startDate ?? actualStartDate as string) : null;
    const offeredEndDate = endDate || actualEndDate ? DateTimeHelper.setCurrentTimeZone(endDate ?? actualEndDate as string) : null;

    this.candidateForm.patchValue({
      offeredStartDate,
      offeredEndDate,
    }, { emitEvent: false, onlySelf: true });
  }

  private updateVisibilityConfig(status: CandidatStatus, candidateDetails?: CandidateDetails): void {
    if (!status) {
      return;
    }

    const hasOnboardedCandidateOfferedDate = status === CandidatStatus.OnBoard &&
      candidateDetails?.offeredStartDate &&
      candidateDetails?.offeredEndDate;

    const hasCancelledOffboardCandidate = (status === CandidatStatus.Cancelled || status === CandidatStatus.Offboard) &&
      candidateDetails?.offeredStartDate &&
      candidateDetails?.offeredEndDate;

    if (status === CandidatStatus.Offered) {
      UpdateVisibilityConfigFields(this.dialogConfig, OfferedConfigFieldsToShow);
      return;
    }

    if (hasOnboardedCandidateOfferedDate || hasCancelledOffboardCandidate) {
      const isCandidateCancelled = status === CandidatStatus.Cancelled;
      const fieldsToShow = isCandidateCancelled ? [...OnboardConfigFieldsToShow, CancelReasonField] : OnboardConfigFieldsToShow;

      UpdateVisibilityConfigFields(this.dialogConfig, fieldsToShow);
      DisableControls(OfferedDates, this.candidateForm, false);

      return;
    }

    if (status === CandidatStatus.Accepted) {
      UpdateVisibilityConfigFields(this.dialogConfig, AcceptConfigFieldsToShow);
      DisableControls(OfferedDates, this.candidateForm, false);
      return;
    }

    if (status === CandidatStatus.Cancelled) {
      const cancelReasonConfigField = this.getConfigField(CancelReasonField);
      cancelReasonConfigField.showField = true;

      return;
    }

    UpdateVisibilityConfigFields(this.dialogConfig,  DefaultConfigFieldsToShow);
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

  private handleRejectStatus(status: CandidatStatus): void {
    if (!status) {
      return;
    }

    const rejectedReasonField = this.getConfigField(RejectedReasonField);
    this.editIrpCandidateService.setValidatorsForRejectedStatus(status, rejectedReasonField, this.candidateForm);
  }

  private handleCancelledStatus(status: CandidatStatus): void {
    if (!status || this.candidateModelState.candidate.status === CandidatStatus.Cancelled) {
      return;
    }

    const endDateFormControl = this.candidateForm.get('actualEndDate');
    const startDateFormControl = this.candidateForm.get('actualStartDate');
    const cancelReasonFormControl = this.candidateForm.get(CancelReasonField);
    const isClosedFormControl = this.candidateForm.get('isClosed');
    const endDateConfigField = this.getConfigField('actualEndDate');
    const cancelReasonConfigField = this.getConfigField(CancelReasonField);

    if (status === CandidatStatus.Cancelled) {
      startDateFormControl?.patchValue(DateTimeHelper.setCurrentTimeZone(this.candidateDetails.actualStartDate as string));
      startDateFormControl?.disable();
      endDateConfigField.required = true;
      cancelReasonConfigField.showField = true;
      endDateConfigField.minDate = this.candidateDetails?.actualStartDate
        ? DateTimeHelper.setCurrentTimeZone(this.candidateDetails.actualStartDate as string) : DefaultMinDate;
      endDateConfigField.maxDate = this.candidateDetails?.actualEndDate
        ? DateTimeHelper.setCurrentTimeZone(this.candidateDetails.actualEndDate as string) : DefaultMaxDate;
      this.endDateFormControlValue = endDateFormControl?.value;
      endDateFormControl?.reset();
      endDateFormControl?.setValidators([Validators.required]);
      cancelReasonFormControl?.setValidators([Validators.required]);
      isClosedFormControl?.setValue(false);
      isClosedFormControl?.disable();
      this.checkActualStartDate();
    } else {
      this.removeEndDateControlLimitations(endDateFormControl as FormControl, endDateConfigField);
      cancelReasonFormControl?.setValidators([]);
      endDateFormControl?.setValue(endDateFormControl?.value);
      startDateFormControl?.enable({ emitEvent: false, onlySelf: true });
      isClosedFormControl?.enable();
    }

    endDateFormControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  private removeEndDateControlLimitations(endDateFormControl: FormControl, endDateConfigField: CandidateField): void {
    endDateConfigField.required = false;
    endDateConfigField.minDate = DefaultMinDate;
    endDateConfigField.maxDate = DefaultMaxDate;
    endDateFormControl.setValidators([]);
  }

  private getConfigField(field: string): CandidateField {
    return this.dialogConfig.find((item) => item.field === field) as CandidateField;
  }

  private clearDatesSubscription(): void {
    this.actualStartDateSubscription?.unsubscribe();
    this.actualStartDateSubscription = null;
    this.offeredDateSubscription?.unsubscribe();
    this.offeredDateSubscription = null;
  }

  private checkActualStartDate(): void {
    if (
      this.candidateDetails?.actualStartDate
      && DateTimeHelper.isFutureDate(this.candidateDetails.actualStartDate as string)
    ) {
      this.candidateForm.get('actualEndDate')?.patchValue(this.candidateDetails.actualStartDate);
    }
  }

  private getRejectedReasons(): void {
    this.store.dispatch(new GetRejectReasonsForOrganisation(SystemType.IRP));
  }
}
