import { TimesheetsTableColumns, TIMETHEETS_STATUSES } from '../enums';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

export interface Timesheet {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  statusText: TIMETHEETS_STATUSES;
  orderId: string;
  skill: string;
  location: string;
  startDate: string;
  department: string;
  agencyName: string;
  orgName: string;
  billRate: number;
  totalDays: number;
  status: TIMETHEETS_STATUSES;
  workWeek: string;
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

export interface TimesheetsSelectedRowEvent {
  rowIndex: number;
  data: Timesheet;
  isInteracted?: boolean;
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
