import { TableColumnAlign } from "../enums/timesheet-common.enum";

export interface DetailsColumnConfig {
  align: TableColumnAlign;
  width: number;
  header: string;
}

export interface DetailsTableConfig {
  day: DetailsColumnConfig;
  timeIn: DetailsColumnConfig;
  timeOut: DetailsColumnConfig;
  costCenter: DetailsColumnConfig;
  category: DetailsColumnConfig;
  hours: DetailsColumnConfig;
  rate: DetailsColumnConfig;
  total: DetailsColumnConfig;
  actions: DetailsColumnConfig;
}
