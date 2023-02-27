import { FormGroup } from '@angular/forms';

import { CreateIrpCandidateDto, UpdateIrpCandidateDto } from '@shared/components/order-candidate-list/interfaces';
import { DateTimeHelper } from '@core/helpers';
import { CandidateField } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';

export const CreateCandidateDto = (
  employeeId: number,
  orderId: number,
  actualStartDate?: string,
  actualEndDate?: string
): CreateIrpCandidateDto => ({
  employeeId,
  orderId,
  actualStartDate: actualStartDate ?? null,
  actualEndDate: actualEndDate ?? null,
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
