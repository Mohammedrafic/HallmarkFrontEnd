import { AgencyDataSourceItem, DataSourceItem, DropdownOption } from '@core/interface';
import { OrganizationStructure } from '@shared/models/organization.model';
import { PageOfCollections } from '@shared/models/page.model';
import { RecordFields } from '../../enums';
import {
  AddRecorTimesheetReorder,
  AddRecordBillRate,
  Attachment,
  CandidateHoursAndMilesData, CandidateInfo, FilterColumns,
  TabCountConfig, Timesheet, TimesheetAttachments, TimesheetDetailsModel, TimesheetInvoice,
  TimesheetRecordsDto, TimesheetsFilterState, TimesheetsFilteringOptions,
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
  organizationStructure: OrganizationStructure | null;
  billRateTypes: AddRecordBillRate[];
  isTimeSheetOpen: boolean;
  selectedTimeSheet: Timesheet | null;
  isAddDialogOpen: {
    action: boolean;
    dialogType: RecordFields;
    startDate: string;
    endDate: string;
    orderConstCenterId: number | null;
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
  agencyOrganizations: AgencyDataSourceItem[];
  selectedOrganizationId: number;
  filterOptions: TimesheetsFilteringOptions | null;
  displayTimesheetHistoricalData: boolean;
  timesheetReorders: AddRecorTimesheetReorder[];
}
