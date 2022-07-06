import { PageOfCollections } from '@shared/models/page.model';
import { Timesheet, CandidateTimesheet, TimesheetAttachments, TimesheetsFilterState } from '../../interface';


export type TimeSheetsPage = PageOfCollections<Timesheet>;

export interface TimesheetsModel {
  timesheets: TimeSheetsPage | null;
  timesheetsFilters: TimesheetsFilterState,
  candidateInfo: unknown | null;
  candidateChartData: unknown | null;
  candidateAttachments: TimesheetAttachments;
  candidateTimeSheets: CandidateTimesheet[];
  costCenterOptions: unknown[];
  billRateTypes: unknown[];
  isTimeSheetOpen: boolean;
  selectedTimeSheetId: number;
  isAddDialogOpen: boolean;
}
