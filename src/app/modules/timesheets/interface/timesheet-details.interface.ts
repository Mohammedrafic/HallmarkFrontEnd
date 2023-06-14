import { RecordFields, TableColumnAlign } from '../enums';
import { TimesheetStatistics } from './timesheet-statistics.interface';
import { Attachment } from '@shared/components/attachments/models/attachment.interface';
import { TimesheetInvoice } from './timesheet-invoice.interface';
import { RecordValue } from './common.interface';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn } from '@shared/models/export.model';
import { TimesheetStatus } from '../enums/timesheet-status.enum';
import { FileForUpload } from '@core/interface';
import { AgencyStatus } from '@shared/enums/status';

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

export interface TimesheetDetailsModel {
  agencyAbleSubmitWithoutAttachments: boolean;
  id: number;
  statusText: string;
  status: TimesheetStatus;
  mileageStatusText: string;
  mileageStatus: number;
  canApproveMileage: boolean;
  canApproveTimesheet: boolean;
  canEditMileage: boolean;
  canEditTimesheet: boolean;
  canUploadFiles: boolean;
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
  orderCostCenterId: number;
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
  allowDNWInTimesheets?: boolean;
  mileageTimesheetId: number;
  agencyStatus: AgencyStatus;
  isEmpty: boolean;
  orderSkillName: string;
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
  startDate: string;
  endDate: string;
}

export interface TimesheetDetailsAddDialogState {
  state: boolean;
  type: RecordFields;
  startDate: string;
  endDate: string;
  orderCostCenterId: number | null;
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
  hadLunchBreak?: boolean;
  isTimeInNull?: boolean;
  forceUpdate?: boolean;
}

export interface PutRecord {
  id: number;
  timeIn: string;
  timeOut?: string | null;
  billRateConfigId: number;
  departmentId: number;
  value: number;
  description?: string;
  isTimeInNull?: boolean;
}

export interface PutRecordDto {
  timesheetId: number;
  organizationId: number;
  type: number;
  deleteIds?: number[];
  records?: PutRecord[];
  forceUpdate?: boolean;
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

export interface UploadDialogState {
  state: boolean;
  itemId: number | null;
  recordAttachments: Attachment[] | null;
}

export interface UploadDocumentsModel {
  fileForUpload: FileForUpload[];
  filesForDelete: Attachment[];
}

export interface OverlapErrorMessageDetails {
  title: string;
  message: string;
}
