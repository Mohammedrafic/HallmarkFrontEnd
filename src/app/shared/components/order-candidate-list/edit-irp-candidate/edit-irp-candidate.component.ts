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

import { catchError, distinctUntilChanged, filter, switchMap, take, takeUntil } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Store } from '@ngxs/store';

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
import { CandidateDetails, ClosePositionDto, EditCandidateDialogState,
} from '@shared/components/order-candidate-list/interfaces';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { CustomFormGroup } from '@core/interface';
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';

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
      this.candidateDialog.show();
      this.getCandidateDetails();
    }
  }

  @Output() handleCloseModal: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() handleSuccessSaveCandidate: EventEmitter<void> = new EventEmitter<void>();

  public readonly optionFields: FieldSettingsModel = OptionField;
  public readonly title: string = CandidateTitle;
  public readonly FieldTypes = FieldType;
  public candidateForm: CustomFormGroup<CandidateForm>;
  public disableSaveButton = false;
  public dialogConfig: ReadonlyArray<CandidateField>;

  private candidateModelState: EditCandidateDialogState;

  constructor(
    private editIrpCandidateService: EditIrpCandidateService,
    private confirmService: ConfirmService,
    private orderCandidateApiService: OrderCandidateApiService,
    private cdr: ChangeDetectorRef,
    private store: Store,
    private orderManagementService: OrderManagementService
  ) {
    super();
  }

  ngOnInit(): void {
    this.dialogConfig = CandidateDialogConfig();
    this.candidateForm = this.editIrpCandidateService.createCandidateForm();
    this.observeCloseControl();
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
    if(this.candidateForm.valid && !this.candidateForm.get('isClosed')) {

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
          okButtonLabel: 'Leave',
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
      this.candidateModelState.order.id, this.candidateModelState.candidate.candidateProfileId
    ).pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe((candidateDetails: CandidateDetails) => {
      const statusConfigField = GetConfigField(this.dialogConfig, StatusField);
      const reasonConfigField = GetConfigField(this.dialogConfig, CloseReasonField);
      const reasons = this.store.selectSnapshot(RejectReasonState.closureReasonsPage)?.items;

      statusConfigField.dataSource = this.editIrpCandidateService
      .createStatusOptions([...candidateDetails.availableStatuses ?? []]);
      reasonConfigField.dataSource = this.editIrpCandidateService.createReasonsOptions(reasons || []);
      
      this.candidateForm.patchValue(candidateDetails);
      this.disableCandidateControls();
      this.cdr.markForCheck();
    });
  }

  private disableCandidateControls(): void {
    if(this.candidateModelState.candidate.status === CandidatStatus.Cancelled) {
      this.candidateForm.disable();
      this.disableSaveButton = true;
    } else {
      this.candidateForm.enable();
      this.disableSaveButton = false;
    }
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
}
