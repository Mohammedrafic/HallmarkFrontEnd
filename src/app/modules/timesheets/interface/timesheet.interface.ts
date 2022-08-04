import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

import { FilteringOptionsFields, TimesheetsTableFiltersColumns, TIMETHEETS_STATUSES } from '../enums';

export interface Timesheet {
  id: number;
  name: string;
  candidateFirstName: string;
  candidateLastName: string;
  candidateMiddleName: string;
  candidateId: string;
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
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  orderIds?: string[];
  locationIds?: string[];
  regionsIds?: string[];
  departmentIds?: string[];
  agencyIds?: string[];
  statusIds?: string[] | number[];
  totalHours?: number;
  billRate?: number;
  skillIds?: string[];
  isAgency?: boolean;
}

export interface TimesheetWeekFilter {
  startDate: string;
  endDate: string;
}

export interface TimesheetsSelectedRowEvent {
  rowIndex: number;
  data: Timesheet;
  isInteracted?: boolean;
}

export type FilterColumns = {
  [key in TimesheetsTableFiltersColumns]: {
    type: ControlTypes;
    valueType: ValueType;
    dataSource?: DataSourceItem[] | any;
    valueField?: string;
    valueId?: string;
  }
}

export type TimesheetsFilteringOptions = {
  [key in FilteringOptionsFields]: DataSourceItem[];
}

export type FilterDataSource = {
  [key in TimesheetsTableFiltersColumns]?: DataSourceItem[] | any;
}

export interface DataSourceItem {
  id: number;
  name: string;
}
