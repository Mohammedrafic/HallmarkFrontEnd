import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

import { TimesheetsTableColumns, TIMETHEETS_STATUSES } from '../enums';

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
  organizationId: number;
  organizationName: string;
  orgName: string;
  billRate: number;
  totalDays: number;
  status: TIMETHEETS_STATUSES;
  workWeek: string;
}

export interface TimesheetsFilterState {
  orderBy?: string;
  pageNumber?: number;
  pageSize?: number;
  organizationId?: number;
  date?: string;
  search?: string;
  orderId?: string[];
  status?: string;
  statusIds?: string[];
  statusText?: string[];
  skillName?: string[];
  departmentName?: string[];
  location?: string[];
  region?: string[];
  orgName?: string[];
  agencyName?: string[];
  isAgency?: boolean;
}

export interface TimesheetsSelectedRowEvent {
  rowIndex: number;
  data: Timesheet;
  isInteracted?: boolean;
}

export type ITimesheetsColumnWidth = {
  [key in TimesheetsTableColumns]?: number;
};

export type FilterColumns = {
  [key in TimesheetsTableColumns]: {
    type: ControlTypes;
    valueType: ValueType;
    dataSource?: DataSourceItem[] | any;
  }
}

export type FilterDataSource = {
  [key in TimesheetsTableColumns]?: DataSourceItem[] | any;
}

export interface DataSourceItem {
  id: number;
  name: string;
}
