export enum TIMESHEETS_ACTIONS {
  GET_TIMESHEETS = '[timesheets] GET TIMESHEETS',
  CHANGE_TABLE_SELECTED_ITEM = '[timesheets] CHANGE TABLE SELECTED ITEM',
  GET_PROFILE_TIMESHEETS = '[timesheets] GET PROFILE TIMESHEETS',
  OPEN_PROFILE = '[timesheets] OPEN PROFILE',
  OPEN_PROFILE_TIMESHEET_ADD_DIALOG = '[timesheets] OPEN PROFILE TIMESHEETS ADD DIALOG',
  CLOSE_PROFILE_TIMESHEET_ADD_DIALOG = '[timesheets] CLOSE PROFILE TIMESHEET ADD DIALOG',
}

export enum TIMETHEETS_STATUSES {
  PENDING_APPROVE = 'pending apr.',
  MISSING = 'missing',
  ORG_APPROVED = 'org. approved',
  REJECTED = 'rejected',
}

export enum ProfileTimeSheetActionType {
  Add = 'add',
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
