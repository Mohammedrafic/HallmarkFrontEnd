import { PageOfCollections } from '@shared/models/page.model';
import {
  CandidateHoursAndMilesData,
  CandidateInfo,
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
  timesheetsFilters: TimesheetsFilterState,
  candidateInfo: CandidateInfo | null;
  candidateHoursAndMilesData: CandidateHoursAndMilesData | null;
  candidateAttachments: TimesheetAttachments;
  candidateInvoices: TimesheetInvoice[];
  timeSheetRecords: TimesheetRecordsDto;
  costCenterOptions: unknown[];
  billRateTypes: unknown[];
  isTimeSheetOpen: boolean;
  selectedTimeSheetId: number;
  isAddDialogOpen: boolean;
  tabCounts: TabCountConfig | null;
  timesheetsFiltersColumns: FilterColumns;
  timesheetDetails: TimesheetDetailsModel | null;
}

