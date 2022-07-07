import { TimesheetsModel } from '../store/model/timesheets.model';

export const DefaultTimesheetState: TimesheetsModel = {
  timesheets: null,
  timesheetsFilters: {
    pageNumber: 1,
    pageSize: 30,
  },
  tabCounts: null,
  timeSheetRecords: [],
  candidateInfo: null,
  candidateChartData: null,
  candidateAttachments: {
    attachments: [],
  },
  isTimeSheetOpen: false,
  selectedTimeSheetId: 0,
  billRateTypes: [],
  costCenterOptions: [],
  isAddDialogOpen: false,
}
