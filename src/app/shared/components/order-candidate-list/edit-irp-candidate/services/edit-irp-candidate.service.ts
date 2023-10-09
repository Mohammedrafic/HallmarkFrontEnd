import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { CustomFormGroup, DropdownOption } from '@core/interface';
import {
  atpStipendRate,
  CandidateField,
  CandidateForm,
  ratePerhourConfig
} from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';
import {
  CreateCandidateDto,
  CreateOfferedCandidateDto,
  DisableControls,
  UpdateCandidateDto,
  UpdateOfferedCandidateDto,
  UpdateOnboardCandidateDto,
} from '@shared/components/order-candidate-list/edit-candidate-list.helper';
import { OrderCandidateApiService } from '@shared/components/order-candidate-list/order-candidate-api.service';
import {
  CandidateDetails,
  CreateIrpCandidateDto,
  CreateOfferedIrpCandidateDto,
  EditCandidateDialogState,
} from '@shared/components/order-candidate-list/interfaces';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { ApplicantStatus } from '@shared/models/order-management.model';
import { RejectReason, RejectReasonwithSystem } from '@shared/models/reject-reason.model';
import { OrderClosureReasonType } from '@shared/enums/order-closure-reason-type.enum';
import { DateTimeHelper } from '@core/helpers';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Location } from "@shared/models/location.model"
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { RejectedConfigFieldsToShow, RejectedReasonField } from '@shared/components/order-candidate-list/edit-irp-candidate/constants';

@Injectable()
export class EditIrpCandidateService {

  constructor(
    private formBuilder: FormBuilder,
    private orderCandidateApiService: OrderCandidateApiService,
    private store: Store,
    private http: HttpClient
  ) {}

  createCandidateForm(): CustomFormGroup<CandidateForm> {
    return this.formBuilder.group({
      status: [null, Validators.required],
      actualStartDate: [null],
      actualEndDate: [null],
      availableStartDate: [null],
      offeredStartDate: [null],
      offeredEndDate: [null],
      rejectedReason: [null],
      isClosed: [false],
      reason: [null],
      closeDate: [null],
    }) as CustomFormGroup<CandidateForm>;
  }

  disableOfferedDateForOnboardedCandidate(
    status: CandidatStatus,
    details: CandidateDetails,
    form: FormGroup
  ): void {
    if (status === CandidatStatus.OnBoard &&
      details?.offeredStartDate &&
      details?.offeredEndDate) {
      DisableControls(['offeredStartDate', 'offeredEndDate'], form);
    }
  }

  getCandidateAction(
    candidateForm: FormGroup,
    state: EditCandidateDialogState,
    createReplacement: boolean,
    isIRPLTAOrder: boolean
  ): Observable<void> {
    const { status, actualStartDate, actualEndDate } = candidateForm.getRawValue();

    if (status) {
      return this.getActionForStatus(
        candidateForm,
        state,
        createReplacement,
        isIRPLTAOrder
      );
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

  getRejectedReasons(): RejectReason[] {
    return this.store.selectSnapshot(OrderManagementContentState.rejectionReasonsList) || [];
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

  getFieldsForRejectedEmployee(candidateDetails: CandidateDetails): string[] {
    const detailsWithValue = Object.fromEntries(
      Object.entries(candidateDetails).filter(([key, value]) => {
      return RejectedConfigFieldsToShow.includes(key) && value;
    }));

   return ['status', 'rejectedReason', ...Object.keys(detailsWithValue ?? {})];
  }

  private getActionForStatus(
    candidateForm: FormGroup,
    state: EditCandidateDialogState,
    createReplacement: boolean,
    isIRPLTAOrder: boolean
  ): Observable<void> {
    const { status, actualStartDate, actualEndDate } = candidateForm.getRawValue();

    if (isIRPLTAOrder) {
      return this.createActionsForLtaOrder(candidateForm, state, createReplacement);
    } else {
      if (status === CandidatStatus.OnBoard && state.candidate.status !== status) {
        return this.orderCandidateApiService.createIrpCandidate(
          CreateCandidateDto(
            state.candidate,
            state.order.id,
            actualStartDate,
            actualEndDate,
          ));
      } else if (status === CandidatStatus.OnBoard && state.candidate.status === status) {
        return this.orderCandidateApiService.updateIrpCandidate(
          UpdateCandidateDto(
            state.order.organizationId as number,
            state.candidate.candidateJobId,
            actualStartDate,
            actualEndDate
          ));
      } else if (status === CandidatStatus.Cancelled) {
        return this.orderCandidateApiService.cancelIrpCandidate({
          organizationId: state.order.organizationId as number,
          jobId: state.candidate.candidateJobId,
          createReplacement,
          actualEndDate: actualEndDate ? DateTimeHelper.setUtcTimeZone(actualEndDate) : null,
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

  private createLtaCandidateBaseStatus(
    candidateForm: FormGroup,
    state: EditCandidateDialogState,
  ): CreateIrpCandidateDto | CreateOfferedIrpCandidateDto {
    const { status, actualStartDate, actualEndDate, availableStartDate, offeredStartDate, offeredEndDate } =
      candidateForm.getRawValue();

    if (status === CandidatStatus.Offered) {
      return CreateOfferedCandidateDto(
        state.candidate,
        state.order.id,
        offeredStartDate,
        offeredEndDate,
        status,
        availableStartDate,
      );
    }

    return CreateCandidateDto(
      state.candidate,
      state.order.id,
      actualStartDate,
      actualEndDate,
      availableStartDate,
      status
    );
  }

  private createActionsForLtaOrder(
    candidateForm: FormGroup,
    state: EditCandidateDialogState,
    createReplacement: boolean,
  ): Observable<void> {
    const { status, actualStartDate, actualEndDate, availableStartDate, offeredStartDate, offeredEndDate, rejectedReason } =
      candidateForm.getRawValue();

    if (state.candidate.status === CandidatStatus['Not Applied']) {
      const candidateDto = this.createLtaCandidateBaseStatus(candidateForm, state);
      return this.orderCandidateApiService.createIrpCandidate(candidateDto);
    } else if (status === CandidatStatus.Cancelled) {
      return this.orderCandidateApiService.cancelIrpCandidate({
        organizationId: state.order.organizationId as number,
        jobId: state.candidate.candidateJobId,
        createReplacement,
        actualEndDate: actualEndDate ? DateTimeHelper.setUtcTimeZone(actualEndDate) : null,
      });
    } else if (status === CandidatStatus.Offered) {
      return this.orderCandidateApiService.updateIrpCandidate(
        UpdateOfferedCandidateDto(
          state.order.organizationId as number,
          state.candidate.candidateJobId,
          offeredStartDate,
          offeredEndDate,
          status,
          availableStartDate,
          state.order.id
        )
      );
    } else if (status === CandidatStatus.Rejected) {
      return this.orderCandidateApiService.rejectIrpCandidate({
        organizationId: state.order.organizationId as number,
        employeeId: state.candidate.candidateJobId,
        rejectReasonId: rejectedReason
      });
    } else if (status === CandidatStatus.OnBoard) {
      return this.orderCandidateApiService.updateIrpCandidate(
        UpdateOnboardCandidateDto(
          state.order.organizationId as number,
          state.candidate.candidateJobId,
          actualStartDate,
          actualEndDate,
          status,
          offeredStartDate,
          offeredEndDate,
          availableStartDate,
          state.order.id,
        )
      );
    } else {
      return this.orderCandidateApiService.updateIrpCandidate(
        UpdateCandidateDto(
          state.order.organizationId as number,
          state.candidate.candidateJobId,
          actualStartDate,
          actualEndDate,
          availableStartDate!,
          status,
          state.order.id
        ));
    }
  }

  public setValidatorsForRejectedStatus(
    status: CandidatStatus,
    rejectedReasonField: CandidateField,
    form: FormGroup
  ): void {
    if (status === CandidatStatus.Rejected && !rejectedReasonField.showField) {
      rejectedReasonField.showField = true;
      form.get(RejectedReasonField)?.setValidators(Validators.required);
    } else {
      rejectedReasonField.showField = false;
      form.get(RejectedReasonField)?.removeValidators(Validators.required);
    }
  }

    public getPredefinedBillRatesforRatePerHour(orderType: number, departmentId: number, skillId: number): Observable<ratePerhourConfig> {
      let params = new HttpParams()
        .append('orderType', orderType)
        .append('departmentId', departmentId)
        .append('skillId', skillId);

      return this.http.get<ratePerhourConfig>('/api/PayRates/predefinedpayrate/forOrder', { params })
    }

    public getATPstipendRate(zip: string, Actualstartdate: string) : Observable<atpStipendRate>{
      return this.http.get<atpStipendRate>('/api/IRPApplicants/atpstipendrate?zip='+ zip + '&ActualStartdate=' + Actualstartdate)
    }

    public getLocationsByRegionId(regionId: number): Observable<Location[]> {
      return this.http.get<Location[]>(`/api/Locations/region/${regionId}`);
    }
}
