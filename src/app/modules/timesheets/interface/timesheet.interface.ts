import { TimesheetsTableColumns, TIMETHEETS_STATUSES } from '../enums/timesheets.enum';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

export interface Timesheet {
  id: number;
  name: string;
  statusText: TIMETHEETS_STATUSES;
  orderId: string;
  skillName: string;
  workWeek: string;
  departmentName: string;
  billRate: number;
  agencyName: string;
  totalHours: number;
  status?: TIMETHEETS_STATUSES
}

export interface TimesheetsFilterState {
  orderBy?: string;
  pageNumber: number;
  pageSize: number;
  date?: string;
  search?: string;
  orderId?: string;
  status?: string[];
  skill?: string[];
  department?: string[];
  agencyName?: string[];
}

export type ITimesheetsColumnWidth = {
  [key in TimesheetsTableColumns]: number;
};

export type IFilterColumns = {
  [key in TimesheetsTableColumns]: {
    type: ControlTypes;
    valueType: ValueType;
    dataSource?: IDataSourceItem[] | any;
  }
}

export type IFilterDataSource = {
  [key in TimesheetsTableColumns]?: IDataSourceItem[] | any;
}

export interface IDataSourceItem {
  id: number;
  name: string;
}
