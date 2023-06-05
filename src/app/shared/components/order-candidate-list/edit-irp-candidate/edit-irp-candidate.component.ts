import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  Output,
  EventEmitter, ChangeDetectorRef,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Comment } from '@shared/models/comment.model';
import { catchError, distinctUntilChanged, filter, switchMap, take, takeUntil, skip, tap, of, map, Observable } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Select, Store } from '@ngxs/store';

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
import { CANCEL_CONFIRM_TEXT, CLOSE_IRP_POSITION, DELETE_CONFIRM_TITLE, RECORD_MODIFIED } from '@shared/constants';
import { CandidateField, CandidateForm } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';
import { OrderCandidateApiService } from '@shared/components/order-candidate-list/order-candidate-api.service';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
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
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { DurationService } from '@shared/services/duration.service';
import { OrderType } from '@shared/enums/order-type';
import { Order, OrderCandidateJob } from '@shared/models/order-management.model';
import { adaptOrder } from '@client/order-management/components/irp-tabs/order-details/helpers';
import { UserState } from 'src/app/store/user.state';
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
      this.isOnboarded = modalState.candidate.status === CandidatStatus.OnBoard;
      this.getCandidateDetails();
    }
  }

  @Output() handleCloseModal: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() handleSuccessSaveCandidate: EventEmitter<void> = new EventEmitter<void>();
  @Input() public commentContainerId:number;
  public readonly optionFields: FieldSettingsModel = OptionField;
  public readonly title: string = CandidateTitle;
  public readonly FieldTypes = FieldType;
  public candidateForm: CustomFormGroup<CandidateForm>;
  public disableSaveButton = false;
  public dialogConfig: ReadonlyArray<CandidateField>;
  public isOnboarded = false;
  public comments: Comment[] = [];
  @Input() public externalCommentConfiguration ?: boolean | null;
  @Input() CanOrganizationViewOrdersIRP: boolean;

  private candidateModelState: EditCandidateDialogState;

  constructor(
    private editIrpCandidateService: EditIrpCandidateService,
    private confirmService: ConfirmService,
    private orderCandidateApiService: OrderCandidateApiService,
    private cdr: ChangeDetectorRef,
    private store: Store,
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
    this.watchForActualDateValues();
    this.getComments();
  }

  private getComments(): void {
    this.commentsService.getComments(this.commentContainerId, null)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
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

  public saveCandidate(): void {
    if(this.candidateForm.valid && !this.candidateForm.get('isClosed')?.value) {
      this.editIrpCandidateService.getCandidateAction(this.candidateForm, this.candidateModelState)
      .pipe(
        catchError((error: HttpErrorResponse) => this.orderCandidateApiService.handleError(error)),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        this.handleSuccessSaveCandidate.emit();
        this.hideDialog();
        this.orderManagementService.setCandidate(true);
      });

    } else if (this.candidateForm.valid && this.candidateForm.get('isClosed')?.value) {
      this.confirmService.confirm(
        CLOSE_IRP_POSITION,
        {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Close',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => !!confirm),
          switchMap(() => {
            const closeDto: ClosePositionDto = {
              jobId: this.candidateModelState.candidate.candidateJobId,
              reasonId: this.candidateForm.get('reason')?.value,
              closingDate: DateTimeHelper.toUtcFormat(this.candidateForm.get('closeDate')?.value as Date),
            };

            return this.orderCandidateApiService.closeIrpPosition(closeDto);

          }),
          take(1),
        ).subscribe(() => {
          this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
          this.handleSuccessSaveCandidate.emit();
          this.hideDialog();
        });
    } else {
      this.candidateForm.markAllAsTouched();
    }
  }

  private getCandidateDetails(): void {
    this.orderCandidateApiService.getIrpCandidateDetails(
      this.candidateModelState.order.id, this.candidateModelState.candidate.candidateProfileId)
    .pipe(
        filter(Boolean),
        tap((candidateDetails: CandidateDetails) => {
          const statusConfigField = GetConfigField(this.dialogConfig, StatusField);
          const reasonConfigField = GetConfigField(this.dialogConfig, CloseReasonField);
          const reasons = this.store.selectSnapshot(RejectReasonState.closureReasonsPage)?.items;

          statusConfigField.dataSource = this.editIrpCandidateService
          .createStatusOptions([...candidateDetails.availableStatuses ?? []]);
          reasonConfigField.dataSource = this.editIrpCandidateService.createReasonsOptions(reasons || []);
          this.candidateForm.patchValue({
            actualStartDate: DateTimeHelper.convertDateToUtc(candidateDetails.actualStartDate as string),
            actualEndDate: DateTimeHelper.convertDateToUtc(candidateDetails.actualEndDate as string),
          }, { emitEvent: false, onlySelf: true });
        }),
        switchMap(() => {
          if (this.candidateModelState.candidate.status === CandidatStatus.Cancelled
            || this.candidateModelState.candidate.status === CandidatStatus.Offboard) {
              const jobDto: JobDetailsDto = {
                OrganizationId: this.candidateModelState.order.organizationId as number,
                JobId: this.candidateModelState.candidate.candidateJobId,
              };

            return this.orderCandidateApiService.getPositionDetails(jobDto)
            .pipe(
              tap((job) => {
                this.setStatusSourceForDisabled(job.applicantStatus);
                this.setCloseData(job);
                this.disableDialogControls();
              })
            );
          }

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
        return !!value && this.candidateModelState.order.orderType === OrderType.Traveler;
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
  }

  private hideDialog(): void {
    this.handleCloseModal.emit(false);
    this.candidateDialog.hide();
    this.disableSaveButton = false;
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

  private setStatusSourceForDisabled(jobStatus: {
    applicantStatus: number;
    statusText: string;
  }): void {
    const statusConfig = GetConfigField(this.dialogConfig, StatusField);

    statusConfig.dataSource = [{
      text: jobStatus.statusText,
      value: jobStatus.applicantStatus,
    }];
  }

  private setCloseData(job: OrderCandidateJob): void {
    this.candidateForm.patchValue({
      status: job.applicantStatus.applicantStatus,
      isClosed: true,
      reason: job.positionClosureReasonId,
      closeDate: DateTimeHelper.convertDateToUtc(job.closeDate as string),
    });
  }

  private disableDialogControls(): void {
    this.disableSaveButton = true;
    this.candidateForm.disable();
  }
}
