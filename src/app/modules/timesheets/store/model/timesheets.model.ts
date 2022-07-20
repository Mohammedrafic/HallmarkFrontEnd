import { PageOfCollections } from '@shared/models/page.model';
import { RecordFields } from '../../enums';
import {
  CandidateHoursAndMilesData,
  CandidateInfo, DataSourceItem,
  DropdownOption,
  FilterColumns,
  TabCountConfig,
  Timesheet,
  TimesheetAttachments,
  TimesheetDetailsModel,
  TimesheetInvoice,
  TimesheetRecordsDto,
  TimesheetsFilterState,
} from '../../interface';


export type TimeSheetsPage = PageOfCollections<Timesheet>;

export interface TimesheetsModel {
  timesheets: TimeSheetsPage | null;
  timesheetsFilters: TimesheetsFilterState | null;
  candidateInfo: CandidateInfo | null;
  candidateHoursAndMilesData: CandidateHoursAndMilesData | null;
  candidateAttachments: TimesheetAttachments;
  candidateInvoices: TimesheetInvoice[];
  timeSheetRecords: TimesheetRecordsDto;
  costCenterOptions: DropdownOption[];
  billRateTypes: DropdownOption[];
  isTimeSheetOpen: boolean;
  selectedTimeSheet: Timesheet | null;
  isAddDialogOpen: {
    action: boolean;
    dialogType: RecordFields;
    initTime: string;
  };
  tabCounts: TabCountConfig | null;
  timesheetsFiltersColumns: FilterColumns;
  timesheetDetails: TimesheetDetailsModel | null;
  organizations: DataSourceItem[];
}

