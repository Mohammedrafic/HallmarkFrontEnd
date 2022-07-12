import { RecordFields } from './../enums/timesheet-common.enum';
import { FormGroup } from '@angular/forms';

import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { SelectionSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';

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

export interface MileRecord {
  id: number;
  day: string;
  costCenter: string;
  billRateType: string;
  amount: number;
  rate: number;
  total: number;
}

export interface ExpensesRecord {
  id: number;
  day: string;
  costCenter: string;
  billRateType: string;
  description: string;
  total: number;
}

export interface TimesheetRecord {
  id: number;
  day: string;
  timeIn: string;
  timeOut: string;
  costCenter: number;
  billRateType: number;
  amount: number;
  rate: number;
  total: number;
}

export interface TimesheetRecordsDto {
  [RecordFields.Time]: RecordValue[];
  [RecordFields.Miles]: RecordValue[];
  [RecordFields.Expenses]: RecordValue[];
}

export type RecordValue = TimesheetRecord | MileRecord | ExpensesRecord;

export interface TimesheetAttachments {
  attachments: TimesheetUploadedFile[];
}

export interface TabConfig {
  title: string;
  amount?: number;
}

export interface TabCountConfig {
  pending: number;
  missing: number;
  rejected: number;
}

export interface TableSettingsConfig {
  allowWrap: boolean;
  wrapSettings: TextWrapSettingsModel;
  selectionOptions: SelectionSettingsModel;
  isLockMenuButtonsShown: boolean;
  moreMenuWithDeleteButton: ItemModel[];
  moreMenuWithCloseButton: ItemModel[];
}
