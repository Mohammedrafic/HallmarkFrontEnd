import { PageOfCollections } from '@shared/models/page.model';
import {
  Timesheet,
  TimesheetRecord,
  TimesheetAttachments,
  TimesheetsFilterState,
  CandidateInfo,
  TabCountConfig,
  TimesheetRecordsDto,
} from '../../interface';


export type TimeSheetsPage = PageOfCollections<Timesheet>;

export interface TimesheetsModel {
  timesheets: TimeSheetsPage | null;
  timesheetsFilters: TimesheetsFilterState,
  candidateInfo: CandidateInfo | null;
  candidateChartData: unknown | null;
  candidateAttachments: TimesheetAttachments;
  timeSheetRecords: TimesheetRecordsDto;
  costCenterOptions: unknown[];
  billRateTypes: unknown[];
  isTimeSheetOpen: boolean;
  selectedTimeSheetId: number;
  isAddDialogOpen: boolean;
  tabCounts: TabCountConfig | null;
}
