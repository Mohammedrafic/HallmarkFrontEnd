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
  organizationId: number;
  candidateId: number;
  candidateName: string;
  candidateSurname: string;
  isDidNotWork: boolean;
  orderId: number;
  orderTitle: string;
  orderRegionName: string | null;
  orderLocationName: string | null;
  orderDepartmentName: string | null;
  orderSkillAbbreviation: string | null;
  jobStartDate: string;
  jobEndDate: string;
  organizationName: string | null;
  agencyName: string | null;
  timesheetStatistic: TimesheetStatistics;
  attachments: TimesheetAttachment[];
  invoices: TimesheetInvoice[];

  rejectReason?: string;
}
