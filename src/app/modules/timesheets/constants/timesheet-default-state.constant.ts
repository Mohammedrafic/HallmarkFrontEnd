import { RecordFields } from './../enums/timesheet-common.enum';
import { TimesheetsModel } from '../store/model/timesheets.model';
import { DefaultFilterColumns, DefaultFiltersState } from './timesheets-table.constant';

export const DefaultTimesheetState: TimesheetsModel = {
  timesheets: null,
  timesheetsFilters: DefaultFiltersState,
  tabCounts: null,
  timeSheetRecords: {
    [RecordFields.Time]: [],
    [RecordFields.Miles]: [],
    [RecordFields.Expenses]: [],
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
