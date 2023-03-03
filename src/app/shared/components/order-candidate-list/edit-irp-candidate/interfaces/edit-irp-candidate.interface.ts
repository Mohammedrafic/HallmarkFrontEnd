import { FieldType } from '@core/enums';
import { ApplicantStatus } from '@shared/models/order-management.model';

export interface CandidateField {
  field: string;
  title: string;
  disabled: boolean;
  required: boolean;
  type: FieldType;
  cssClass: string;
  dataSource?: ApplicantStatus[];
}

export interface CandidateForm {
  status: number;
  actualStartDate: string;
  actualEndDate: string;
}
