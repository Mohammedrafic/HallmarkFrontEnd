import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { CustomFormGroup, DropdownOption } from '@core/interface';
import { CandidateForm } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';
import { CreateCandidateDto, UpdateCandidateDto } from '@shared/components/order-candidate-list/edit-candidate-list.helper';
import { OrderCandidateApiService } from '@shared/components/order-candidate-list/order-candidate-api.service';
import { EditCandidateDialogState } from '@shared/components/order-candidate-list/interfaces';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { ApplicantStatus } from '@shared/models/order-management.model';
import { RejectReason, RejectReasonwithSystem } from '@shared/models/reject-reason.model';
import { OrderClosureReasonType } from '@shared/enums/order-closure-reason-type.enum';

@Injectable()
export class EditIrpCandidateService {

constructor(
    private formBuilder: FormBuilder,
    private orderCandidateApiService: OrderCandidateApiService,
    private store: Store,
  ) {}

  createCandidateForm(): CustomFormGroup<CandidateForm> {
    return this.formBuilder.group({
      status: [null, Validators.required],
      actualStartDate: [null],
      actualEndDate: [null],
      isClosed: [false],
      reason: [null],
      closeDate: [null],
    }) as CustomFormGroup<CandidateForm>;
  }

  getCandidateAction(
    candidateForm: FormGroup,
    state: EditCandidateDialogState,
    createReplacement: boolean,
  ): Observable<void> {
    const { status, actualStartDate, actualEndDate } = candidateForm.getRawValue();

    if (status) {
      return this.getActionForStatus(status, state, actualStartDate, actualEndDate, createReplacement);
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

  createStatusOptions(statuses: ApplicantStatus[]): DropdownOption[] {
    return statuses.map((status) => ({
      text: status.statusText,
      value: status.applicantStatus,
    }));
  }

  createReasonsOptions(reasons: RejectReason[]): DropdownOption[] {
    return reasons.map((reason) => ({
      text: reason.reason,
      value: reason.id as number,
    }));
  }

  setValidatorsForClose(form: CustomFormGroup<CandidateForm>): void {
    form.get('status')?.removeValidators(Validators.required);
    form.get('status')?.updateValueAndValidity();
    form.get('reason')?.setValidators(Validators.required);
    form.get('closeDate')?.setValidators(Validators.required);
  }

  setDefaultValidators(form: CustomFormGroup<CandidateForm>): void {
    form.get('status')?.setValidators(Validators.required);
    form.get('status')?.updateValueAndValidity();
    form.get('reason')?.removeValidators(Validators.required);
    form.get('closeDate')?.removeValidators(Validators.required);
  }

  getClosureReasons(onlyCustom = false): RejectReasonwithSystem[] {
    const reasons = this.store.selectSnapshot(RejectReasonState.closureReasonsPage)?.items || [];

    if (onlyCustom) {
      return reasons.filter((reason: RejectReasonwithSystem) => {
        return reason.orderClosureReasonType === OrderClosureReasonType.Custom;
      });
    }

    return reasons;
  }

  private getActionForStatus(
    status: CandidatStatus,
    state: EditCandidateDialogState,
    actualStartDate: string,
    actualEndDate: string,
    createReplacement: boolean,
  ): Observable<void> {
    if(status === CandidatStatus.OnBoard && state.candidate.status !== status) {
      return this.orderCandidateApiService.createIrpCandidate(
        CreateCandidateDto(
          state.candidate,
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
      return this.orderCandidateApiService.cancelIrpCandidate( {
        organizationId: state.order.organizationId as number,
        jobId: state.candidate.candidateJobId,
        createReplacement,
      });
    } else {
      return this.orderCandidateApiService.createIrpCandidate(
        CreateCandidateDto(
          state.candidate,
          state.order.id,
          actualStartDate,
          actualEndDate,
        ));
    }
  }
}
