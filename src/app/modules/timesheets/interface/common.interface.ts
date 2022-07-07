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

export interface TimesheetRecord {
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
