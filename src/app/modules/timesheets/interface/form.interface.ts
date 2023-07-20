export interface AddTimesheetForm {
  timeIn: string | Date;
  timeOut?: string | Date;
  departmentId: number;
  billRateConfigId?: number;
  amount?: number;
  description?: string;
  hadLunchBreak?: boolean;
  day?: Date | string;
  value?: number;
}

export interface TimesheetForm {
  searchTerm: string;
  orderIds: string[];
  statusIds: string[];
  skillIds: string[];
  departmentIds: string[];
  agencyIds: string[];
  regionsIds: string[];
  locationIds: string[];
}

