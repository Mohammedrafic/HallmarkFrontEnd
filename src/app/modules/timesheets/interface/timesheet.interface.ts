import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { DataSourceItem } from '@core/interface';

import { FilteringOptionsFields, TimesheetsTableFiltersColumns, TIMETHEETS_STATUSES } from '../enums';
import { AgencyStatus } from '@shared/enums/status';
import { Grid } from '@syncfusion/ej2-grids';
import { GridReadyEvent, RowNode } from '@ag-grid-community/core';
import { BehaviorSubject } from 'rxjs';

export interface Timesheet {
  id: number;
  name: string;
  candidateFirstName: string;
  candidateLastName: string;
  candidateMiddleName: string;
  candidateId: string;
  statusText: TIMETHEETS_STATUSES;
  mileageStatus: number;
  mileageTimesheetId: number;
  orderId: string;
  skill: string;
  location: string;
  startDate: string;
  formattedId: string;
  department: string;
  agencyName: string;
  organizationId: number;
  organizationName: string;
  orgName: string;
  billRate: number;
  totalDays: number;
  status: TIMETHEETS_STATUSES;
  mileageStatusText: TIMETHEETS_STATUSES;
  workWeek: string;
  agencyStatus: AgencyStatus;
  orderPublicId: number;
  orgPrefix: string;
}

export interface TimesheetsFilterState {
  orderBy?: string;
  pageNumber?: number;
  pageSize?: number;
  organizationId?: number;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  orderIds?: string[] | string;
  locationIds?: string[] | number[];
  regionsIds?: string[] | number[];
  departmentIds?: string[];
  agencyIds?: string[];
  statusIds?: string[] | number[];
  totalHours?: number;
  billRate?: number;
  skillIds?: string[];
  isAgency?: boolean;
  timesheetIds?: number[];
  contactEmails?: string[];
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

export interface TimesheetsGrid extends Grid {
  gridInstance$: BehaviorSubject<GridReadyEvent>
}
export interface TimesheetGridSelections {
  selectedTimesheetIds: number[];
  rowNodes: RowNode[];
}
