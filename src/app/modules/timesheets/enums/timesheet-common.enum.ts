export enum TableColumnAlign {
  Right = 'Right',
  Left = 'Left',
  Center = 'Center',
}

export enum SubmitBtnText {
  Submit = 'Submit',
  Approve = 'Approve',
}

export enum RecordFields {
  Time = 'timesheets',
  HistoricalData = 'historicalData',
  Miles = 'miles',
  Expenses = 'expenses',
}

export enum TableTabIndex {
  ProfileDetails = 0,
  Time = 1,
  HistoricalData = 2,
  Miles = 3,
  Expenses = 4,
}

export enum TimesheetRecordType {
  Timesheet = 1,
  Miles = 2,
  Expenses = 3,
}

export enum RecordsMode {
  View = 'viewMode',
  Edit = 'editMode',
}

export enum RecordStatus {
  New = 'New',
  Deleted = 'Deleted',
  None = 'None',
}
