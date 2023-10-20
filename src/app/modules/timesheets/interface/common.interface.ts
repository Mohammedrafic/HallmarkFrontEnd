import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { SelectionSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';

import { FieldType, FieldWidthStyle } from '@core/enums';
import { DropdownOption } from '@core/interface';
import { BillRateCalculationType } from '@shared/models';
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
  historicalData: DialogConfigBlock;
  miles: DialogConfigBlock;
  expenses: DialogConfigBlock;
}

export interface RawRecordValue {
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
  value: number;
  state: number;
  stateText: RecordStatus;
  timesheetRecordId?: number;
  hadLunchBreak?: boolean;
  isTimeInNull?: boolean;

}

export interface RawTimesheetRecordsDto {
  timesheets: RecordDto[];
  miles: RecordDto[];
  expenses: RecordDto[];
  timesheetsCalculated: RecordDto[];
  milesCalculated: RecordDto[];
  expensesCalculated: RecordDto[];
  invoiceHistoricalRecords: RecordDto[];
}

export interface TimesheetRecordsDto {
  [RecordFields.Time]: RecordsDetails;
  [RecordFields.HistoricalData]: RecordsDetails;
  [RecordFields.Miles]: RecordsDetails;
  [RecordFields.Expenses]: RecordsDetails;
}

export interface RecordsDetails {
  [RecordsMode.Edit]: RecordValue[];
  [RecordsMode.View]: RecordValue[];
}

export interface RecordValue {
  billRate: number;
  billRateConfigId: number;
  billRateConfigName: string;
  costCenterFormattedName: string;
  costCenterName: string;
  day: string;
  departmentId: number;
  description?: string;
  disableMealBreak: boolean;
  disableTime: boolean;
  doNotRequireTime: boolean;
  extDepartmentId: string;
  hadLunchBreak?: boolean;
  id: number;
  isGenerated?: boolean;
  isTimeInNull?: boolean;
  location: string;
  locationId: number;
  state: number;
  stateText: RecordStatus;
  timeIn: string;
  timeOut?: string | null;
  timesheetRecordId?: number | null;
  total: number;
  value: number;
  dayOfWeek?: number;
  hours?: number;
  invoiceId?: number;
  timesheetId?: number;
  type?: BillRateCalculationType;
}

export type RecordDto = Omit<RecordValue, 'day'>;

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
