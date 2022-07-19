import { RecordFields } from './../enums/timesheet-common.enum';
import { TableColumnAlign } from '../enums';
import { TimesheetStatistics } from './timesheet-statistics.interface';
import { TimesheetAttachment } from './timesheet-attachment.interface';
import { TimesheetInvoice } from './timesheet-invoice.interface';

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
  rejectReason: string | null;
}

export interface CostCenterOption {
  id: number;
  name: string;
}

export interface TimesheetDetailsModel {
  id: number;
  statusText: string
  status: number;
  rejectionReason?: string;
  organizationId: number;
  candidateId: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateMiddleName: string;
  noWorkPerformed: boolean;
  departmentId: number;
  skillId: number;
  orderType: number;
  jobId: number;
  orderId: number;
  orderTitle: string;
  orderRegionName: string | null;
  orderLocationName: string | null;
  orderDepartmentName: string | null;
  orderSkillAbbreviation: string | null;
  jobStartDate: string;
  jobEndDate: string;
  unitName: string;
  timesheetStatistic: TimesheetStatistics;
  attachments: TimesheetAttachment[];
  invoices: TimesheetInvoice[];
}

export interface OpenAddDialogMeta {
  currentTab: RecordFields;
  initDate: string;
}