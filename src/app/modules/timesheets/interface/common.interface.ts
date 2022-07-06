import { FormGroup } from '@angular/forms';

import { FieldType } from '../enums';
import { TimesheetUploadedFile } from './timesheet-details.interface';


export interface DropdownOption {
  text: string;
  value: string | number;
}

export interface DialogConfigField {
  title: string;
  field: string;
  type: FieldType;
  disabled: boolean;
  required: boolean;
  options?: DropdownOption[];
  valueType?: string;
}

export interface DialogConfig {
  title: string;
  fields: DialogConfigField[][];
}

export interface CandidateTimesheet {
  id?: number;
  day: Date;
  form?: FormGroup;
  timeIn: string;
  timeOut: string;
  costCenter: string;
  category: string;
  hours: number;
  rate: number;
  total: number;
}

export interface TimesheetAttachments {
  attachments: TimesheetUploadedFile[];
}

export interface TabConfig {
  title: string;
  amount?: number;
}
