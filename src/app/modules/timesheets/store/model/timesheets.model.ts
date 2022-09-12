import { DataSourceItem, DropdownOption } from '@core/interface';
import { PageOfCollections } from '@shared/models/page.model';
import { RecordFields } from '../../enums';
import {
  Attachment,
  CandidateHoursAndMilesData, CandidateInfo, FilterColumns,
  TabCountConfig, Timesheet, TimesheetAttachments, TimesheetDetailsModel, TimesheetInvoice,
  TimesheetRecordsDto, TimesheetsFilterState
} from '../../interface';


export type TimeSheetsPage = PageOfCollections<Timesheet>;

export interface TimesheetsModel {
  loading: boolean;
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
  isUploadDialogOpen: {
    action: boolean;
    itemId: number | null;
    recordAttachments: Attachment[] | null;
  };
  tabCounts: TabCountConfig | null;
  timesheetsFiltersColumns: FilterColumns;
  timesheetDetails: TimesheetDetailsModel | null;
  organizations: DataSourceItem[];
  selectedOrganizationId: number;
}
