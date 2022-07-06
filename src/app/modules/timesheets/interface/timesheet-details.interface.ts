import { DialogAction } from '../enums';
import { TableColumnAlign } from '../enums/timesheet-common.enum';

export interface DetailsColumnConfig {
  align: TableColumnAlign;
  width: number;
  header: string;
  dataSource?: any[];
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

export interface DialogActionPayload {
  dialogState: boolean;
  id:  number;
}

export interface TimesheetUploadedFile {
  name: string;
  type: string;
}
