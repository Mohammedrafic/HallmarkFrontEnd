import { FieldType } from '@core/enums';
import { DropdownOption } from '@core/interface';

export interface CandidateField {
  field: string;
  title: string;
  disabled: boolean;
  required: boolean;
  type: FieldType;
  cssClass: string;
  dataSource?: DropdownOption[];
}

export interface CandidateForm {
  status: number;
  actualStartDate: string;
  actualEndDate: string;
  isClosed: boolean;
  reason: number;
  closeDate: Date;
}
