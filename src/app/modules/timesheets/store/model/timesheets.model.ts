import { PageOfCollections } from '@shared/models/page.model';
import {
  CandidateInfo,
  TabCountConfig,
  Timesheet,
  TimesheetAttachments,
  TimesheetRecordsDto,
  TimesheetsFilterState,
  FilterColumns,
} from '../../interface';
import { CandidateHoursAndMilesData } from '../../interface';


export type TimeSheetsPage = PageOfCollections<Timesheet>;

export interface TimesheetsModel {
  timesheets: TimeSheetsPage | null;
  timesheetsFilters: TimesheetsFilterState,
  candidateInfo: CandidateInfo | null;
  candidateHoursAndMilesData: CandidateHoursAndMilesData | null;
  candidateAttachments: TimesheetAttachments;
  timeSheetRecords: TimesheetRecordsDto;
  costCenterOptions: unknown[];
  billRateTypes: unknown[];
  isTimeSheetOpen: boolean;
  selectedTimeSheetId: number;
  isAddDialogOpen: boolean;
  tabCounts: TabCountConfig | null;
  timesheetsFiltersColumns: FilterColumns;
}
