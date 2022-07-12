import { TableColumnAlign } from '../enums';

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

export interface CandidateInfo {
  id: number;
  imgPath: string;
  orderId: string;
  status: string;
  timesheetStatus: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  location: string;
  department: string;
  skill: string;
  startDate: string;
  endDate: string;
  unitName: string;
}
