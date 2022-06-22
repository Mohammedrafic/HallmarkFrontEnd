import { TIMETHEETS_STATUSES } from '../enums/timesheets.enum';

export interface ITimesheet {
  id: number;
  name: string;
  statusText: TIMETHEETS_STATUSES;
  orderId: string;
  skillName: string;
  workWeek: string;
  departmentName: string;
  billRate: number;
  agencyName: string;
  totalHours: string;
}

export interface ITimesheetsFilter {
  orderBy?: string;
  pageNumber: number;
  pageSize: number;
  date?: string;
  search?: string;
  orderId?: string;
  status?: string[];
  skill?: string[];
  department?: string[];
  billRate?: number;
  agencyName?: string[];
  totalHours?: number;
}
