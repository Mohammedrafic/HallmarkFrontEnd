import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { CustomFormGroup } from '@core/interface';
import { CandidateForm } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';
import {
  CancelCandidateDto,
  CreateCandidateDto,
  UpdateCandidateDto,
} from '@shared/components/order-candidate-list/edit-candidate-list.helper';
import { OrderCandidateApiService } from '@shared/components/order-candidate-list/order-candidate-api.service';
import { EditCandidateDialogState } from '@shared/components/order-candidate-list/interfaces';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';

@Injectable()
export class EditIrpCandidateService {

  constructor(
    private formBuilder: FormBuilder,
    private orderCandidateApiService: OrderCandidateApiService
  ) {}

  public createCandidateForm(): CustomFormGroup<CandidateForm> {
    return this.formBuilder.group({
      status: null,
      actualStartDate: null,
      actualEndDate: null,
    }) as CustomFormGroup<CandidateForm>;
  }

  public getCandidateAction(
    candidateForm: FormGroup,
    state: EditCandidateDialogState
    ): Observable<void> {
    const { status, actualStartDate, actualEndDate } = candidateForm.getRawValue();

    if (status) {
      return this.getActionForStatus(status,state,actualStartDate,actualEndDate);
    } else {
      return this.orderCandidateApiService.updateIrpCandidate(
        UpdateCandidateDto(
          state.order.organizationId as number,
          state.candidate.candidateJobId,
          actualStartDate,
          actualEndDate
        )
      );
    }
  }

  private getActionForStatus(
    status: CandidatStatus,
    state: EditCandidateDialogState,
    actualStartDate: string,
    actualEndDate: string
  ): Observable<void> {
    if(status === CandidatStatus.OnBoard && state.candidate.status !== status) {
      return this.orderCandidateApiService.createIrpCandidate(
        CreateCandidateDto(
          state.candidate.candidateProfileId,
          state.order.id,
          actualStartDate,
          actualEndDate,
        ));
    } else if(status === CandidatStatus.OnBoard && state.candidate.status === status) {
      return this.orderCandidateApiService.updateIrpCandidate(
        UpdateCandidateDto(
          state.order.organizationId as number,
          state.candidate.candidateJobId,
          actualStartDate,
          actualEndDate
        ));
    } else if(status === CandidatStatus.Cancelled) {
      return this.orderCandidateApiService.cancelIrpCandidate(
        CancelCandidateDto(
          state.order.organizationId as number,
          state.candidate.candidateJobId,
        ));
    } else {
      return this.orderCandidateApiService.createIrpCandidate(
        CreateCandidateDto(
          state.candidate.candidateProfileId,
          state.order.id,
          actualStartDate,
          actualEndDate,
        ));
    }
  }
}
