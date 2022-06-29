import { ProfileTimeSheetActionType } from '../enums/timesheets.enum';
import { TimesheetsModel } from '../store/model/timesheets.model';

export const DEFAULT_TIMESHEETS_STATE: TimesheetsModel = {
  timesheets: null,
  profileTimesheets: [],
  profileOpen: false,
  timeSheetDialogOpen: false,
  selectedTimeSheetId: null,
  editDialogType: ProfileTimeSheetActionType.Add,
  profileDialogTimesheet: null,
  timesheetDetails: {
    uploads: [
      {
        name: 'SandersP.pdf',
        type: 'pdf',
      },
      {
        name: 'SandersP.csv',
        type: 'csv',
      },
    ],
    invoices: [
      {
        id: '123',
        name: 'Invoice_SenderP'
      }
    ],
  },
}
