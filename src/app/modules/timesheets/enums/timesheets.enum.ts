export enum TIMESHEETS_ACTIONS {
  GET_TIMESHEETS = '[timesheets] GET TIMESHEETS',
  CHANGE_TABLE_SELECTED_ITEM = '[timesheets] CHANGE TABLE SELECTED ITEM',
  OPEN_PROFILE = '[timesheets] OPEN PROFILE',
  OPEN_PROFILE_TIMESHEET_ADD_DIALOG = '[timesheets] OPEN PROFILE TIMESHEETS ADD DIALOG',
  CLOSE_PROFILE_TIMESHEET_ADD_DIALOG = '[timesheets] CLOSE PROFILE TIMESHEET ADD DIALOG',
  POST_PROFILE_TIMESHEET = '[timesheets] POST PROFILE TIMESHEET',
  PATCH_PROFILE_TIMESHEET = '[timesheets] PATCH PROFILE TIMESHEET',
  DELETE_PROFILE_TIMESHEET = '[timesheets] DELETE PROFILE TIMESHEET',
  GET_TABS_COUNTS = '[timesheets] GET TABS COUNTS',
  SET_FILTERS_DATA_SOURCE = '[timesheets] SET FILTERS DATA SOURCE',
  UPDATE_FILTERS_STATE = '[timesheets] UPDATE FILTERS STATE',
  AGENCY_SUBMIT_TIMESHEET = '[timesheets] AGENCY SUBMIT TIMESHEET',
  ORGANIZATION_APPROVE_TIMESHEET = '[timesheets] ORGANIZATION APPROVE TIMESHEET',
  REJECT_TIMESHEET = '[timesheets] REJECT TIMESHEET',
  DELETE_TIMESHEET = '[timesheets] DELETE TIMESHEET',
}

export enum TimesheetDetailsActions {
  GetTimesheetRecords = '[timesheets] Get timesheet records',
  GetCandidateInfo = '[timesheet details] Get candidate info',
  GetCandidateChartData = '[timesheet details] Get candidate chart data',
  GetCandidateAttachments = '[timesheet details] Get candidate attachments',
  GetCandidateInvoices = '[timesheet details] Get candidate invoices',
  GetCandidateCostCenters = '[timesheet details] Get candidate cost centers',
  GetCandidateBillRates = '[timesheet details] Get candidate bill rates',
  PatchTimesheetRecords = '[timesheet details] Patch timesheet records',
  UploadFiles = '[timesheet details] Upload files',
  DeleteFile = '[timesheet details] Delete file',
}

export enum TIMETHEETS_STATUSES {
  PENDING_APPROVE = 'pending apr.',
  PENDING_APPROVE_ASTERIX = 'pending apr.*',
  MISSING = 'missing',
  ORG_APPROVED = 'org. approved',
  REJECTED = 'rejected',
  INCOMPLETE = 'incomplete',
  APPROVED = 'approved',
}

export enum ExportType {
  Excel_file = 'Excel File',
  CSV_file = 'CSV File',
  Custom = 'Custom'
}

export enum MoreMenuType {
  Edit = 'Edit',
  Duplicate = 'Duplicate',
  Close = 'Close',
  Delete = 'Delete'
}

export enum TimesheetsTableColumns {
  Checkbox = 'checkbox',
  Approve = 'approve',
  Name = 'name',
  StatusText = 'statusText',
  OrderId = 'orderId',
  Skill = 'skill',
  Location = 'location',
  Region = 'region',
  OrgName = 'orgName',
  WorkWeek = 'workWeek',
  StartDate = 'startDate',
  Department = 'department',
  BillRate = 'billRate',
  AgencyName = 'agencyName',
  TotalDays = 'totalDays',
  Controls = 'controls',
}

export enum DialogAction {
  Open = 'open',
  Close = 'close',
}
