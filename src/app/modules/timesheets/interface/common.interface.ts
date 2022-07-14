import { ColDef } from '@ag-grid-community/core';
import { RecordFields } from './../enums/timesheet-common.enum';
import { FormGroup } from '@angular/forms';

import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { SelectionSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';

import { FieldType } from '../enums';
import { TimesheetAttachment } from './timesheet-attachment.interface';


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
  costCenter: number;
  billRateType: number;
  amount: number;
  rate: number;
  total: number;
  billRateConfigName: string;
}

export interface ExpensesRecord {
  id: number;
  day: string;
  costCenter: number;
  billRateType: number;
  description: string;
  amount: number;
  billRateConfigName: string;
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
  attachments: TimesheetAttachment[];
}

export interface TabConfig {
  title: string;
  amount?: number;
  value?: number;
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
