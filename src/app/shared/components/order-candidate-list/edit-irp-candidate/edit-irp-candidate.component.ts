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

import { catchError, filter, take, takeUntil } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Store } from '@ngxs/store';

import { Destroyable } from '@core/helpers';
import {
  CandidateDialogConfig,
  CandidateTitle,
  OptionField, StatusField,
} from '@shared/components/order-candidate-list/edit-irp-candidate/constants/edit-irp-candidate.constant';
import { FieldType } from '@core/enums';
import { EditIrpCandidateService } from '@shared/components/order-candidate-list/edit-irp-candidate/services';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, RECORD_MODIFIED } from '@shared/constants';
import { CandidateField, CandidateForm } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';
import { OrderCandidateApiService } from '@shared/components/order-candidate-list/order-candidate-api.service';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import {
  DisableControls,
  GetConfigField,
} from '@shared/components/order-candidate-list/edit-candidate-list.helper';
import { CandidateDetails, EditCandidateDialogState } from '@shared/components/order-candidate-list/interfaces';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { CustomFormGroup } from '@core/interface';
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';

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
    this.editIrpCandidateService.getCandidateAction(this.candidateForm, this.candidateModelState).pipe(
      catchError((error: HttpErrorResponse) => this.orderCandidateApiService.handleError(error)),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      this.handleSuccessSaveCandidate.emit();
      this.hideDialog();
      this.orderManagementService.setCandidate(true);
    });
  }

  private getCandidateDetails(): void {
    this.orderCandidateApiService.getIrpCandidateDetails(
      this.candidateModelState.order.id, this.candidateModelState.candidate.candidateProfileId
    ).pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe((candidateDetails: CandidateDetails) => {
      const statusConfigField = GetConfigField(this.dialogConfig, StatusField);
      statusConfigField.dataSource = [...candidateDetails.availableStatuses ?? []];

      this.candidateForm.patchValue(candidateDetails);
      this.disableCandidateControls();
      this.cdr.markForCheck();
    });
  }

  private disableCandidateControls(): void {
    if (this.candidateModelState.candidate.status === CandidatStatus.OnBoard) {
      DisableControls(['actualStartDate','actualEndDate'], this.candidateForm);
    } else if(this.candidateModelState.candidate.status === CandidatStatus.Cancelled) {
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
}
