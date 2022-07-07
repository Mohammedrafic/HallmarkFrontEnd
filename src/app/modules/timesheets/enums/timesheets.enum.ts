export enum TIMESHEETS_ACTIONS {
  GET_TIMESHEETS = '[timesheets] GET TIMESHEETS',
  CHANGE_TABLE_SELECTED_ITEM = '[timesheets] CHANGE TABLE SELECTED ITEM',
  GET_TIMESHEET_RECORDS = '[timesheets] GET TIMESHEET RECORDS',
  OPEN_PROFILE = '[timesheets] OPEN PROFILE',
  OPEN_PROFILE_TIMESHEET_ADD_DIALOG = '[timesheets] OPEN PROFILE TIMESHEETS ADD DIALOG',
  CLOSE_PROFILE_TIMESHEET_ADD_DIALOG = '[timesheets] CLOSE PROFILE TIMESHEET ADD DIALOG',
  POST_PROFILE_TIMESHEET = '[timesheets] POST PROFILE TIMESHEET',
  PATCH_PROFILE_TIMESHEET = '[timesheets] PATCH PROFILE TIMESHEET',
  DELETE_PROFILE_TIMESHEET = '[timesheets] DELETE PROFILE TIMESHEET',
}

export enum TIMETHEETS_STATUSES {
  PENDING_APPROVE = 'pending apr.',
  MISSING = 'missing',
  ORG_APPROVED = 'org. approved',
  REJECTED = 'rejected',
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
  Name = 'name',
  StatusText = 'statusText',
  OrderId = 'orderId',
  SkillName = 'skillName',
  Location = 'location',
  WorkWeek = 'workWeek',
  DepartmentName = 'departmentName',
  BillRate = 'billRate',
  AgencyName = 'agencyName',
  TotalHours = 'totalHours',
  Controls = 'controls',
}

export enum DialogAction {
  Open = 'open',
  Close = 'close',
}
