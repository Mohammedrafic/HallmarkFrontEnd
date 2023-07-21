import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';

import { ColDef, ValueGetterParams } from '@ag-grid-community/core';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';

import { FilteringOptionsFields, TimesheetsTableColumns, TimesheetsTableFiltersColumns,
  TIMETHEETS_STATUSES } from '../enums';
import { FilterColumns, TimesheetsFilterState } from '../interface';
import { TimesheetTableApproveCellComponent,
} from '../components/timesheets-table/timesheet-table-approve-cell/timesheet-table-approve-cell.component';
import { TimeSheetsPage } from '../store/model/timesheets.model';
import { TimesheetTableLinkComponent,
} from '../components/timesheets-table/timesheet-table-link/timesheet-table-link.component';
import { GridValuesHelper } from '../helpers';
import { TableStatusCellComponent } from '@shared/components/table-status-cell/table-status-cell.component';

const commonColumn: ColDef = {
  sortable: true,
  comparator: () => 0,
  resizable: true,
  filter: true,
};

export const TimesheetsColumnsDefinition = (isAgency = false): ColumnDefinitionModel[] => {
  return [
    {
      field: TimesheetsTableColumns.Checkbox,
      headerName: '',
      width: 50,
      minWidth: 50,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      ...commonColumn,
    },
    {
      field: TimesheetsTableColumns.Approve,
      headerName: '',
      width: 100,
      minWidth: 100,
      hide: true,
      cellClass: 'approve-cell',
      cellRenderer: TimesheetTableApproveCellComponent,
    },
    {
      field: TimesheetsTableColumns.Name,
      headerName: 'NAME',
      width: 158,
      minWidth: 158,
      cellClass: 'name',
      ...commonColumn,
      cellRenderer: TimesheetTableLinkComponent,
      valueFormatter: (params: ValueFormatterParams) => `${params.data.candidateFirstName} ${params.data.candidateLastName}`,
    },
    {
      field: TimesheetsTableColumns.StatusText,
      headerName: 'TIMESHEET STATUS',
      minWidth: 170,
      cellRenderer: TableStatusCellComponent,
      cellClass: 'status-cell',
      ...commonColumn,
    },
    {
      field: TimesheetsTableColumns.MileageStatusText,
      headerName: 'MILES STATUS',
      minWidth: 170,
      cellRenderer: TableStatusCellComponent,
      cellClass: 'status-cell',
      valueGetter: (params: ValueGetterParams) => {
        const status = params.data.mileageStatusText || '';

        return status.toLowerCase() !== TIMETHEETS_STATUSES.NO_MILEAGES_EXIST
          ? status : '';
      },
      resizable: true,
      filter: true,
      sortable: false,
    },
    {
      field: TimesheetsTableColumns.OrderId,
      headerName: 'JOB ID',
      width: 140,
      minWidth: 140,
      cellClass: 'name',
      ...commonColumn,
      cellRenderer: TimesheetTableLinkComponent,
      valueFormatter: (params: ValueFormatterParams) => params.data.formattedId,
    },
    {
      field: TimesheetsTableColumns.Skill,
      headerName: 'SKILL',
      width: 270,
      minWidth: 270,
      ...commonColumn,
    },
    {
      field: TimesheetsTableColumns.Location,
      headerName: 'LOCATION',
      width: 200,
      minWidth: 200,
      wrapText: true,
      ...commonColumn,
    },
    {
      field: TimesheetsTableColumns.StartDate,
      headerName: 'WORK WEEK',
      width: 240,
      minWidth: 240,
      cellClass: 'bold',
      ...commonColumn,
      valueFormatter: (params: ValueFormatterParams) => {
        const weekNum = params.data.workWeek;
        return `${weekNum} - ${GridValuesHelper.formatDate(params.value, 'ccc MM/dd/yyyy')}`;
      },
    },
    {
      field: TimesheetsTableColumns.Department,
      headerName: 'DEPARTMENT',
      width: 264,
      minWidth: 264,
      wrapText: true,
      ...commonColumn,
    },
    {
      field: TimesheetsTableColumns.BillRate,
      headerName: 'BILL RATE $',
      type: 'rightAligned',
      width: 140,
      minWidth: 140,
      ...commonColumn,
    },
    {
      field: isAgency ? TimesheetsTableColumns.OrgName : TimesheetsTableColumns.AgencyName,
      headerName: isAgency ? 'Org NAME' : 'Agency Name',
      width: 164,
      minWidth: 164,
      wrapText: true,
      ...commonColumn,
    },
    {
      field: TimesheetsTableColumns.TotalDays,
      headerName: 'TOTAL DAYS',
      width: 160,
      minWidth: 160,
      ...commonColumn,
    },
  ];
};

const defaultInputMapping = {
  type: ControlTypes.Text,
  valueType: ValueType.Text,
};

const defaultColumnMapping = {
  type: ControlTypes.Multiselect,
  valueType: ValueType.Id,
  valueField: 'name',
  valueId: 'id',
};

const skillsColumnMapping = {
  type: ControlTypes.Multiselect,
  valueType: ValueType.Id,
  valueField: 'name',
  valueId: 'masterSkillsId',
};

const contactEmailsColumnMapping = {
  type: ControlTypes.Autocomplete,
  valueType: ValueType.Id,
  valueField: 'fullName',
  valueId: 'email',
};

export const DefaultFilterColumns: FilterColumns = {
  searchTerm: defaultInputMapping,
  orderIds: defaultInputMapping,
  statusIds: defaultColumnMapping,
  skillIds: skillsColumnMapping ,
  departmentIds: defaultColumnMapping,
  agencyIds: defaultColumnMapping,
  regionsIds: defaultColumnMapping,
  locationIds: defaultColumnMapping,
  contactEmails: contactEmailsColumnMapping,
} as FilterColumns;

export const SavedFiltersParams: TimesheetsTableFiltersColumns[] = [
  TimesheetsTableFiltersColumns.PageNumber,
  TimesheetsTableFiltersColumns.PageSize,
  TimesheetsTableFiltersColumns.OrganizationId,
  TimesheetsTableFiltersColumns.OrderBy,
  TimesheetsTableFiltersColumns.StartDate,
  TimesheetsTableFiltersColumns.EndDate,
  TimesheetsTableFiltersColumns.StatusIds,
];

export const DefaultFiltersState: TimesheetsFilterState = {
  pageNumber: 1,
  pageSize: 100,
};

export const DefaultTimesheetCollection: TimeSheetsPage = {
  items: [],
  pageNumber: 1,
  totalPages: 1,
  totalCount: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const filteringOptionsMapping: Map<FilteringOptionsFields, TimesheetsTableFiltersColumns> = new Map()
  .set(FilteringOptionsFields.Agencies, TimesheetsTableFiltersColumns.AgencyIds)
  .set(FilteringOptionsFields.Orders, TimesheetsTableFiltersColumns.OrderIds)
  .set(FilteringOptionsFields.Regions, TimesheetsTableFiltersColumns.RegionsIds)
  .set(FilteringOptionsFields.Skills, TimesheetsTableFiltersColumns.SkillIds)
  .set(FilteringOptionsFields.Statuses, TimesheetsTableFiltersColumns.StatusIds);

export const BulkApproveSuccessMessage = {
  successMessage: 'Success. Timesheets Approved',
};
