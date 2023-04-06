import { RecordFields } from './../enums/timesheet-common.enum';
import { TimesheetsModel } from '../store/model/timesheets.model';
import { DefaultFilterColumns } from './timesheets-table.constant';

export const DefaultTimesheetState: TimesheetsModel = {
  loading: false,
  timesheets: null,
  timesheetsFilters: null,
  tabCounts: null,
  timeSheetRecords: {
    timesheets: {
      editMode: [],
      viewMode: [],
    },
    miles: {
      editMode: [],
      viewMode: [],
    },
    expenses: {
      editMode: [],
      viewMode: [],
    },
  },
  candidateInfo: null,
  candidateHoursAndMilesData: null,
  candidateAttachments: {
    attachments: [],
  },
  candidateInvoices: [],
  isTimeSheetOpen: false,
  selectedTimeSheet: null,
  billRateTypes: [],
  costCenterOptions: [],
  isAddDialogOpen: {
    action: false,
    dialogType: RecordFields.Time,
    startDate: '',
    endDate: '',
    orderConstCenterId: null,
  },
  isUploadDialogOpen: {
    action: false,
    itemId: null,
    recordAttachments: null,
  },
  timesheetsFiltersColumns: DefaultFilterColumns,
  timesheetDetails: null,
  organizations: [],
  selectedOrganizationId: 0,
  filterOptions: null,
};
