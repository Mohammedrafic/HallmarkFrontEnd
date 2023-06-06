import { FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';

import { DateTimeHelper } from '@core/helpers';
import { CreateIrpCandidateDto, UpdateIrpCandidateDto } from '@shared/components/order-candidate-list/interfaces';
import { CandidateField } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';
import { IrpOrderCandidate, OrderCandidatesList } from '@shared/models/order-management.model';

export const CreateCandidateDto = (
  candidate: IrpOrderCandidate | OrderCandidatesList,
  orderId: number,
  actualStartDate?: string,
  actualEndDate?: string
): CreateIrpCandidateDto => ({
  employeeId: candidate.candidateProfileId,
  orderId,
  actualStartDate: actualStartDate ?? null,
  actualEndDate: actualEndDate ?? null,
  availabilityOverlap: candidate.availabilityOverlap ?? null,
});

export const UpdateCandidateDto = (
  organizationId: number,
  jobId: number,
  actualStartDate: string,
  actualEndDate: string,
): UpdateIrpCandidateDto => ({
  organizationId,
  jobId,
  actualStartDate: DateTimeHelper.toUtcFormat(actualStartDate),
  actualEndDate: DateTimeHelper.toUtcFormat(actualEndDate),
});

export const CancelCandidateDto = (organizationId: number,jobId: number) => ({
  organizationId,
  jobId,
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
