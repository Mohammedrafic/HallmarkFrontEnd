import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { SelectionSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';

import { FieldType, FieldWidthStyle } from '@core/enums';
import { DropdownOption } from '@core/interface';
import { Attachment } from '@shared/components/attachments/models/attachment.interface';
import { TimesheetsModel } from '../store/model/timesheets.model';
import { RecordFields, RecordsMode, RecordStatus } from '../enums';

export interface DialogConfigField {
  title: string;
  field: string;
  type: FieldType;
  disabled: boolean;
  required: boolean;
  options?: DropdownOption[];
  valueType?: string;
  visible: boolean;
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

export interface RawTimsheetRecordsDto {
  timesheets: RecordValue[];
  miles: RecordValue[];
  expenses: RecordValue[];
  timesheetsCalculated: RecordValue[];
  milesCalculated: RecordValue[];
  expensesCalculated: RecordValue[];
}

export interface TimesheetRecordsDto {
  [RecordFields.Time]: RecordsDetails;
  [RecordFields.Miles]: RecordsDetails;
  [RecordFields.Expenses]: RecordsDetails;
}

export interface RecordsDetails {
  [RecordsMode.Edit]: RecordValue[];
  [RecordsMode.View]: RecordValue[];
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
  state: number;
  stateText: RecordStatus;
  timesheetRecordId?: number;
  hadLunchBreak?: boolean;
  isTimeInNull?: boolean;
}

export interface TimesheetAttachments {
  attachments: Attachment[];
  id?: number;
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

export type AddRecordBillRate = DropdownOption & {
  efectiveDate: string;
  timeNotRequired: boolean;
  disableMealBreak: boolean;
  disableTime: boolean;
};
