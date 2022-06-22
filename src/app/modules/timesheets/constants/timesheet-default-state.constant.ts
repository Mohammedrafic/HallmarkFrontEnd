import { ProfileTimeSheetActionType } from '../enums/timesheets.enum';
import { TimesheetsModel } from '../store/model/timesheets.model';

export const DEFAULT_TIMESHEETS_STATE: TimesheetsModel = {
  timesheets: null,
  profileTimesheets: [],
  profileOpen: false,
  timeSheetDialogOpen: false,
  selectedTimeSheet: null,
  editDialogType: ProfileTimeSheetActionType.Add,
  profileDialogTimesheet: null,
}
