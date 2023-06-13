export enum TIMESHEETS_ACTIONS {
  GET_TIMESHEETS = '[timesheets] GET TIMESHEETS',
  CHANGE_TABLE_SELECTED_ITEM = '[timesheets] CHANGE TABLE SELECTED ITEM',
  OPEN_PROFILE = '[timesheets] OPEN PROFILE',
  OPEN_PROFILE_TIMESHEET_ADD_DIALOG = '[timesheets] OPEN PROFILE TIMESHEETS ADD DIALOG',
  TOGGLE_TIMESHEET_UPLOAD_ATTACHMENTS_DIALOG = '[timesheets] TOGGLE TIMESHEET UPLOAD ATTACHMENTS DIALOG',
  UPLOAD_MILES_ATTACHMENTS = '[timesheets] UPLOAD MILES ATTACHMENTS',
  DELETE_MILES_ATTACHMENT = '[timesheets] DELETE MILES ATTACHMENT',
  CLOSE_PROFILE_TIMESHEET_ADD_DIALOG = '[timesheets] CLOSE PROFILE TIMESHEET ADD DIALOG',
  POST_PROFILE_TIMESHEET = '[timesheets] POST PROFILE TIMESHEET',
  PATCH_PROFILE_TIMESHEET = '[timesheets] PATCH PROFILE TIMESHEET',
  DELETE_PROFILE_TIMESHEET = '[timesheets] DELETE PROFILE TIMESHEET',
  GET_TABS_COUNTS = '[timesheets] GET TABS COUNTS',
  SET_FILTERS_DATA_SOURCE = '[timesheets] SET FILTERS DATA SOURCE',
  GET_FILTERS_DATA_SOURCE = '[timesheets] GET FILTERS DATA SOURCE',
  UPDATE_FILTERS_STATE = '[timesheets] UPDATE FILTERS STATE',
  RESET_FILTERS_STATE = '[timesheets] RESET FILTERS STATE',
  AGENCY_SUBMIT_TIMESHEET = '[timesheets] AGENCY SUBMIT TIMESHEET',
  ORGANIZATION_APPROVE_TIMESHEET = '[timesheets] ORGANIZATION APPROVE TIMESHEET',
  SUBMIT_TIMESHEET = '[timesheets] SUBMIT TIMESHEET',
  REJECT_TIMESHEET = '[timesheets] REJECT TIMESHEET',
  DELETE_TIMESHEET = '[timesheets] DELETE TIMESHEET',
  GET_TIMESHEET_DETAILS = '[timesheets] GET TIMESHEET DETAILS',
  GET_ORGANIZATIONS = '[timesheets] GET ORGANIZATIONS',
  SELECT_ORGANIZATION = '[timesheets] SELECT ORGANIZATION',
  BULK_APPROVE = '[timesheets] BULK APPROVE',
  PREVIEW_ATTACHMENT = '[timesheets] PREVIEW ATTACHMENT',
  DOWNLOAD_ATTACHMENT = '[timesheets] DOWNLOAD Attachment',
  DELETE_ATTACHMENT = '[timesheets] DELETE Attachment',
  EXPORT_TIMESHEETS='[timesheets] Export TIMESHEETS',
  RESET_FILTER_OPTIONS ='[timesheets] Reset Filter Options TIMESHEETS'
}

export enum TimesheetDetailsActions {
  GetTimesheetRecords = '[timesheets details] Get timesheet records',
  GetCandidateInfo = '[timesheet details] Get candidate info',
  GetCandidateChartData = '[timesheet details] Get candidate chart data',
  GetCandidateAttachments = '[timesheet details] Get candidate attachments',
  GetCandidateInvoices = '[timesheet details] Get candidate invoices',
  GetCandidateCostCenters = '[timesheet details] Get candidate cost centers',
  GetCandidateBillRates = '[timesheet details] Get candidate bill rates',
  PatchTimesheetRecords = '[timesheet details] Patch timesheet records',
  UploadFiles = '[timesheet details] Upload files',
  DeleteFile = '[timesheet details] Delete file',
  DownloadAttachment = '[timesheet details] download attachment',
  AddTimesheetRecord = '[timesheet details] Add timesheet record',
  NoWorkPerformed = '[timesheet details] No work performed',
  GetDetailsByDate ='[timesheet details] Get timesheet details by date',
  RecalculateTimesheets = '[timesheet details] Recalculate timesheets by job id',
  ForceAddRecord = '[timesheet details] Force add overlaping record',
  ForceUpdateRecords = '[timesheet details] Force update overlaping records',
}

export enum TIMETHEETS_STATUSES {
  INCOMPLETE = 'incomplete',
  PENDING_APPROVE = 'pending approval',
  PENDING_APPROVE_ASTERIX = 'pending approval*',
  ORG_APPROVED = 'org. approved',
  MISSING = 'missing',
  REJECTED = 'rejected',
  APPROVED = 'approved',
  NO_MILEAGES_EXIST = 'no mileages exist',
  ARCHIVED = 'archived',
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
  MileageStatusText = 'mileageStatusText',
  OrderId = 'orderId',
  Skill = 'skill',
  Location = 'location',
  Region = 'region',
  OrgName = 'organizationName',
  WorkWeek = 'workWeek',
  StartDate = 'startDate',
  Department = 'department',
  BillRate = 'billRate',
  AgencyName = 'agencyName',
  TotalDays = 'totalDays',
  Controls = 'controls',
}

export enum TimesheetsTableFiltersColumns {
  OrderBy = 'orderBy',
  PageNumber = 'pageNumber',
  PageSize = 'pageSize',
  OrganizationId = 'organizationId',
  StartDate = 'startDate',
  EndDate = 'endDate',
  SearchTerm = 'searchTerm',
  OrderIds = 'orderIds',
  LocationIds = 'locationIds',
  RegionsIds = 'regionsIds',
  DepartmentIds = 'departmentIds',
  AgencyIds = 'agencyIds',
  StatusIds = 'statusIds',
  TotalHours = 'totalHours',
  BillRate = 'billRate',
  SkillIds = 'skillIds',
  ContactEmails = 'contactEmails',
}

export enum FilteringOptionsFields {
  Agencies = 'agencies',
  Orders = 'orders',
  Regions = 'regions',
  Skills = 'skills',
  Statuses = 'statuses'
}
