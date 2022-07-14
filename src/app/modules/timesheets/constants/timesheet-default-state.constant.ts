import { TimesheetsModel } from '../store/model/timesheets.model';
import { DefaultFilterColumns, DefaultFiltersState } from './timesheets-table.constant';

export const DefaultTimesheetState: TimesheetsModel = {
  timesheets: null,
  timesheetsFilters: DefaultFiltersState,
  tabCounts: null,
  timeSheetRecords: {
    timeRecords: [],
    miles: [],
    expenses: [],
  },
  candidateInfo: null,
  candidateHoursAndMilesData: null,
  candidateAttachments: {
    attachments: [],
  },
  candidateInvoices: [],
  isTimeSheetOpen: false,
  selectedTimeSheetId: 0,
  billRateTypes: [],
  costCenterOptions: [],
  isAddDialogOpen: false,
  timesheetsFiltersColumns: DefaultFilterColumns,
  timesheetDetails: null,
}
