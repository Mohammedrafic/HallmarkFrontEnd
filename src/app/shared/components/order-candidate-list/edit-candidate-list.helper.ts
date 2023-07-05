import { FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';

import { DateTimeHelper } from '@core/helpers';
import { CreateIrpCandidateDto, UpdateIrpCandidateDto } from '@shared/components/order-candidate-list/interfaces';
import { CandidateField } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';
import { IrpOrderCandidate, OrderCandidatesList } from '@shared/models/order-management.model';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';

export const CreateCandidateDto = (
  candidate: IrpOrderCandidate | OrderCandidatesList,
  orderId: number,
  actualStartDate?: string,
  actualEndDate?: string,
  availableStartDate?:string,
  status?:CandidatStatus
): CreateIrpCandidateDto => ({
  employeeId: candidate.candidateProfileId,
  orderId,
  actualStartDate: actualStartDate ? DateTimeHelper.setUtcTimeZone(actualStartDate) : null,
  actualEndDate: actualEndDate ? DateTimeHelper.setUtcTimeZone(actualEndDate) : null,
  availabilityOverlap: candidate.availabilityOverlap ?? null,
  availableStartDate:availableStartDate ?? null,
  workflowStepType:status!
});

export const UpdateCandidateDto = (
  organizationId: number,
  jobId: number,
  actualStartDate: string,
  actualEndDate: string,
  availableStartDate?:string,
  status?:CandidatStatus,
  orderId?:number
): UpdateIrpCandidateDto => ({
  organizationId,
  jobId,
  actualStartDate: actualStartDate ? DateTimeHelper.setUtcTimeZone(actualStartDate) : null,
  actualEndDate: actualEndDate ? DateTimeHelper.setUtcTimeZone(actualEndDate) : null,
  availableStartDate:availableStartDate ? DateTimeHelper.setUtcTimeZone(availableStartDate) : null ,
  workflowStepType:status!,
  orderId:orderId ?? null
});

export const GetConfigField = (config: ReadonlyArray<CandidateField>, field: string): CandidateField => {
  return config.find((item: CandidateField) => item.field === field) as CandidateField;
};

export const DisableControls = (controlList: string[], form: FormGroup): void => {
  controlList.forEach((control: string) => {
    form.get(control)?.disable();
  });
};

export const getOrientationDate = (departmentDate: string | null): string => {
  return departmentDate ?
    `Oriented from ${formatDate(departmentDate, 'MM/dd/yyyy', 'en-US')}` : 'Not oriented';
};
