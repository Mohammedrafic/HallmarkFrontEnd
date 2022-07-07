import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { SelectionSettingsModel } from '@syncfusion/ej2-angular-grids';

import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { GRID_CONFIG } from '@shared/constants';

import { SortingDirections } from '@client/client.config';
import { MoreMenuType, TimesheetsTableColumns, TIMETHEETS_STATUSES } from '../enums';
import { IFilterColumns, IFilterDataSource, ITimesheetsColumnWidth, TableSettingsConfig } from '../interface';

export const ROW_HEIGHT = {
  SCALE_UP_HEIGHT: 140,
  SCALE_DOWN_HEIGHT: 64
};

export const moreMenuWithDelete: ItemModel[] = [
  { text: MoreMenuType.Edit, id: '0' },
  { text: MoreMenuType.Duplicate, id: '1' },
  { text: MoreMenuType.Delete, id: '3' }
];

export const moreMenuWithClose: ItemModel[] = [
  { text: MoreMenuType.Edit, id: '0' },
  { text: MoreMenuType.Duplicate, id: '1' },
  { text: MoreMenuType.Close, id: '2' }
];

export const tableSelectionModel: SelectionSettingsModel = {
  type: 'Single',
  mode: 'Row',
  checkboxMode: 'ResetOnRowClick'
};

export const timesheetsTableColumnWidth: ITimesheetsColumnWidth = {
  checkbox: 50,
  name: 158,
  statusText: 152,
  orderId: 140,
  location: 120,
  skillName: 270,
  workWeek: 240,
  departmentName: 264,
  billRate: 140,
  agencyName: 164,
  totalHours: 160,
  controls: 112
};

export const TIMESHEETS_GRID_CONFIG = {
  ...GRID_CONFIG,
  columns: [
    { field: TimesheetsTableColumns.Checkbox },
    { field: TimesheetsTableColumns.Name, direction: SortingDirections.Descending },
    { field: TimesheetsTableColumns.StatusText, direction: SortingDirections.Descending },
    { field: TimesheetsTableColumns.OrderId, direction: SortingDirections.Descending },
    { field: TimesheetsTableColumns.SkillName, direction: SortingDirections.Descending },
    { field: TimesheetsTableColumns.WorkWeek, direction: SortingDirections.Descending },
    { field: TimesheetsTableColumns.DepartmentName, direction: SortingDirections.Descending },
    { field: TimesheetsTableColumns.BillRate, direction: SortingDirections.Descending },
    { field: TimesheetsTableColumns.AgencyName, direction: SortingDirections.Descending },
    { field: TimesheetsTableColumns.TotalHours, direction: SortingDirections.Descending },
    { field: TimesheetsTableColumns.Controls, direction: SortingDirections.Descending }
  ]
}

export const defaultFilterColumns: IFilterColumns = {
  orderId: { type: ControlTypes.Text, valueType: ValueType.Text },
  statusText: { type: ControlTypes.Multiselect, valueType: ValueType.Text },
  skillName: { type: ControlTypes.Multiselect, valueType: ValueType.Text },
  departmentName: { type: ControlTypes.Multiselect, valueType: ValueType.Text },
  billRate: { type: ControlTypes.Text, valueType: ValueType.Text },
  agencyName: { type: ControlTypes.Multiselect, valueType: ValueType.Text },
  totalHours: { type: ControlTypes.Text, valueType: ValueType.Text },
} as IFilterColumns;

export const filterOptionFields = {
  text: 'name',
  value: 'name'
};

export const TableSettings: TableSettingsConfig = {
  allowWrap: TIMESHEETS_GRID_CONFIG.isWordWrappingEnabled,
  wrapSettings: TIMESHEETS_GRID_CONFIG.wordWrapSettings,
  selectionOptions: tableSelectionModel,
  isLockMenuButtonsShown: false,
  moreMenuWithDeleteButton: moreMenuWithDelete,
  moreMenuWithCloseButton: moreMenuWithClose,
};

export const filterColumnDataSource: IFilterDataSource = {
  statusText: Object.values(TIMETHEETS_STATUSES).map((val, idx) => ({
    id: idx + 1,
    name: val,
  })),
  skillName: [
    {
      id: 1,
      name: 'Certified Nursed Assistant'
    },
    {
      id: 2,
      name: 'Qualified Doctor'
    },
  ],
  departmentName: [
    {
      id: 1,
      name: 'Emergency'
    },
    {
      id: 2,
      name: 'Surgery'
    },
  ],
  agencyName: [
    {
      id: 1,
      name: 'AB Staffing',
    },
    {
      id: 2,
      name: 'SQIN',
    }
  ],
};
