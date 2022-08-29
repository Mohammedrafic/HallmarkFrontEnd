import { RecordFields, TableColumnAlign } from '../enums';
import { TimesheetStatistics } from './timesheet-statistics.interface';
import { Attachment } from '@shared/components/attachments/models/attachment.interface';
import { TimesheetInvoice } from './timesheet-invoice.interface';
import { RecordValue } from './common.interface';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn } from '@shared/models/export.model';
import { Invoice, InvoiceDetail } from '../../invoices/interfaces';
import { PendingApprovalInvoice } from '../../invoices/interfaces/pending-approval-invoice.interface';

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
  statusText: string;
  status: number;
  mileageStatusText: string;
  mileageStatus: number;
  canApproveMileage: boolean;
  canApproveTimesheet: boolean;
  canEditMileage: boolean;
  canEditTimesheet: boolean;
  rejectionReason?: string;
  organizationId: number;
  candidateId: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateMiddleName: string;
  noWorkPerformed: boolean;
  departmentId: number;
  formattedId: string;
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
  attachments: Attachment[];
  invoices: TimesheetInvoice[];
  weekEndDate: string;
  weekStartDate: string;
  candidateWorkPeriods: WorkWeek<string>[];
  isNotExist?: boolean;
  mileageTimesheetId: number;
}

export interface WorkWeek<T> {
  weekStartDate: T;
  weekEndDate: T;
}

export interface CustomExport {
  columns: ExportColumn[];
  fileName: string;
  fileType: ExportedFileType;
}

export interface OpenAddDialogMeta {
  currentTab: RecordFields;
  initDate: string;
}

export interface RecordsPutDto {
  timesheetId: number;
  organizationId: number;
  type: number;
  deleteIds: number[];
  records: RecordValue[];
}

export interface AddRecordDto {
  timesheetId: number;
  organizationId: number;
  type: number;
  timeIn: string;
  timeOut?: string;
  billRateConfigId: number;
  departmentId: number;
  description?: string,
  value?: number;
}

export interface PutRecord {
  id: number;
  timeIn: string;
  timeOut?: string;
  billRateConfigId: number;
  departmentId: number;
  value: number;
  description?: string;
}

export interface PutRecordDto {
  timesheetId: number;
  organizationId: number;
  type: number;
  deleteIds?: number[];
  records?: PutRecord[];
}

export interface AddMileageDto {
  organizationId: number;
  jobId: number;
  weekStartDate: string;
}

export interface MileageCreateResponse {
  timesheetId: number;
  type: number;
  jobId: number;
  organizationId: number;
  weekStart: string;
  status: number;
}
