import { TimesheetsModel } from './../store/model/timesheets.model';
import { FieldWidthStyle } from './../enums/add-edit-timesheet.enum';
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
  widthStyle?: FieldWidthStyle;
  optionsStateKey?: keyof TimesheetsModel;
}

export interface DialogConfigBlock {
  title: string;
  fields: DialogConfigField[];
}

export interface DialogConfig {
  timesheets: DialogConfigBlock;
  miles: DialogConfigBlock;
  expenses: DialogConfigBlock;
}

export interface TimesheetRecordsDto {
  [RecordFields.Time]: RecordValue[];
  [RecordFields.Miles]: RecordValue[];
  [RecordFields.Expenses]: RecordValue[];
}

export interface RecordValue {
  id: number;
  day: string;
  timeIn: string;
  timeOut?: string;
  billRate: number;
  billRateConfigName: string;
  billRateConfigId: number;
  costCenterFormattedName: string;
  costCenterName: string;
  departmentId: number;
  description?: string;
  isGenerated?: boolean;
  extDepartmentId: string;
  total:  number;
  value: 10;
};

export interface TimesheetAttachments {
  attachments: TimesheetAttachment[];
}

export interface TabConfig {
  title: string;
  amount?: number;
  value?: number[];
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

export interface CostCenter {
  id: number;
  name: string;
  extDepartmentId: string;
  formattedName: string;
}


export interface CostCentersDto {
  [key: string]: CostCenter | CostCenter[];
}
