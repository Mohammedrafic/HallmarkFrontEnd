import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, Validators } from '@angular/forms';

import { catchError, distinctUntilChanged, filter, of, skip, Subscription, switchMap, take, takeUntil, tap } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Store } from '@ngxs/store';

import { Comment } from '@shared/models/comment.model';
import { DateTimeHelper, Destroyable } from '@core/helpers';
import {
  CandidateDialogConfig,
  CandidateTitle,
  CloseReasonField,
  DefaultConfigFieldsToShow,
  OfferedConfigFieldsToShow,
  OnboardConfigFieldsToShow,
  OptionField,
  StatusField,
} from '@shared/components/order-candidate-list/edit-irp-candidate/constants/edit-irp-candidate.constant';
import { FieldType } from '@core/enums';
import { EditIrpCandidateService } from '@shared/components/order-candidate-list/edit-irp-candidate/services';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CANCEL_CONFIRM_TEXT,
  CLOSE_IRP_POSITION,
  CloseOrderIRP_PERMISSION,
  DELETE_CONFIRM_TITLE,
  ManageOrderIRP_PERMISSION,
  RECORD_MODIFIED,
} from '@shared/constants';
import { CandidateField, CandidateForm } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';
import { OrderCandidateApiService } from '@shared/components/order-candidate-list/order-candidate-api.service';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
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
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { DurationService } from '@shared/services/duration.service';
import { OrderType } from '@shared/enums/order-type';
import { PermissionService } from 'src/app/security/services/permission.service';
import { OrderCandidateJob } from '@shared/models/order-management.model';
import { CommentsService } from '@shared/services/comments.service';

@Component({
  selector: 'app-edit-irp-candidate',
  templateUrl: './edit-irp-candidate.component.html',
  styleUrls: ['./edit-irp-candidate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditIrpCandidateComponent extends Destroyable implements OnInit {
  @ViewChild('candidateDialog') candidateDialog: DialogComponent;

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


  public comments: Comment[] = [];
  @Input() public externalCommentConfiguration ?: boolean | null;
  @Input() CanOrganizationViewOrdersIRP: boolean;
  @Input() CanOrganizationEditOrdersIRP: boolean;

  private candidateModelState: EditCandidateDialogState;
  private endDateFormControlValue: Date;
  private candidateDetails: CandidateDetails;
  private actualStartDateSubscription: Subscription | null;
  private offeredDateSubscription: Subscription | null;

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
  ) {
    super();
    this.dialogConfig = CandidateDialogConfig();
    this.candidateForm = this.editIrpCandidateService.createCandidateForm();

  }

  ngOnInit(): void {
    this.observeCloseControl();
    this.observeStatusControl();
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

  private getCandidateDetails(): void {
    this.orderCandidateApiService.getIrpCandidateDetails(
      this.candidateModelState.order.id, this.candidateModelState.candidate.candidateProfileId,this.isIRPLTAOrder)
    .pipe(
        filter(Boolean),
        tap((candidateDetails: CandidateDetails) => {
          this.candidateDetails = candidateDetails;
          this.updateVisibilityConfig(this.candidateModelState.candidate.status, candidateDetails);
          this.handleOfferedStatus(
            this.candidateModelState.candidate.status,
            candidateDetails.offeredStartDate as string,
            candidateDetails.offeredEndDate as string
          );

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
          this.editIrpCandidateService.disableOfferedDateForOnboardedCandidate(
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

  private watchForOfferedDateValue(): void {
    const offeredStartDate = this.candidateForm.get('offeredStartDate');
    const offeredEndDate = this.candidateForm.get('offeredEndDate');

    if(offeredStartDate && offeredEndDate) {
      this.offeredDateSubscription = offeredStartDate.valueChanges.pipe(
        filter((value: string) => !!value ),
        skip(1),
        distinctUntilChanged(),
        takeUntil(this.componentDestroy()),
      ).subscribe((value: string) => {
        const actualEndDate = this.calculateEndDate(value);

        offeredEndDate?.patchValue(actualEndDate, { emitEvent: false, onlySelf: true });
      });
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
       || value === CandidatStatus.Cancelled ||value === CandidatStatus.Offboard;
      this.candidateForm.get('availableStartDate')?.patchValue(
        DateTimeHelper.setCurrentTimeZone(this.availableStartDate as string), { emitEvent: false, onlySelf: true }
      );
      this.handleCancelledStatus(value);
      this.handleOfferedStatus(
       value,
       this.candidateDetails?.offeredStartDate as string,
       this.candidateDetails?.offeredEndDate as string
      );
      this.cdr.markForCheck();
  });
  }

  private handleOfferedStatus(
    status: CandidatStatus,
    startDate?: string,
    endDate?: string
  ): void {
    if(!status || (status !== CandidatStatus.Offered && status !== CandidatStatus.OnBoard)) {
      return;
    }

    this.candidateForm.patchValue({
      offeredStartDate: DateTimeHelper.setCurrentTimeZone(startDate ?? this.candidateDetails.actualStartDate as string),
      offeredEndDate: DateTimeHelper.setCurrentTimeZone(endDate ?? this.candidateDetails.actualEndDate as string),
    }, { emitEvent: false, onlySelf: true });
  }

  private updateVisibilityConfig(status: CandidatStatus, candidateDetails?: CandidateDetails): void {
    if (!status) {
      return;
    }

    const hasOnboardedCandidateOfferedDate = status === CandidatStatus.OnBoard &&
      candidateDetails?.offeredStartDate &&
      candidateDetails?.offeredEndDate;

    if (status === CandidatStatus.Offered) {
      UpdateVisibilityConfigFields(this.dialogConfig, OfferedConfigFieldsToShow);
      return;
    }

    if (hasOnboardedCandidateOfferedDate) {
      UpdateVisibilityConfigFields(this.dialogConfig, OnboardConfigFieldsToShow);
      DisableControls(['offeredStartDate', 'offeredEndDate'], this.candidateForm);
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

  private handleCancelledStatus(status: CandidatStatus): void {
    if (!status || this.candidateModelState.candidate.status === CandidatStatus.Cancelled) {
      return;
    }

    const endDateFormControl = this.candidateForm.get('actualEndDate');
    const startDateFormControl = this.candidateForm.get('actualStartDate');
    const isClosedFormControl = this.candidateForm.get('isClosed');
    const endDateConfigField = this.getConfigField('actualEndDate');

    if (status === CandidatStatus.Cancelled) {
      startDateFormControl?.patchValue(this.candidateDetails?.actualStartDate);
      startDateFormControl?.disable();
      endDateConfigField.required = true;
      endDateConfigField.minDate = this.candidateDetails?.actualStartDate
        ? new Date(this.candidateDetails.actualStartDate) : null;
      endDateConfigField.maxDate = this.candidateDetails?.actualEndDate
        ? new Date(this.candidateDetails.actualEndDate) : null;
      this.endDateFormControlValue = endDateFormControl?.value;
      endDateFormControl?.reset();
      endDateFormControl?.setValidators([Validators.required]);
      isClosedFormControl?.setValue(false);
      isClosedFormControl?.disable();
      this.checkActualStartDate();
    } else {
      this.removeEndDateControlLimitations(endDateFormControl as FormControl, endDateConfigField);
      endDateFormControl?.setValue(endDateFormControl?.value);
      startDateFormControl?.enable({ emitEvent: false, onlySelf: true });
      isClosedFormControl?.enable();
    }

    endDateFormControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
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
}
