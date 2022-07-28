import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';

import { ColDef } from '@ag-grid-community/core';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';

import { FilteringOptionsFields, TimesheetsTableColumns, TimesheetsTableFiltersColumns, TIMETHEETS_STATUSES } from '../enums';
import { FilterColumns, FilterDataSource, TimesheetsFilterState } from '../interface';
import {
  TimesheetTableStatusCellComponent
} from '../components/timesheets-table/timesheet-table-status-cell/timesheet-table-status-cell.component';
import { GridValuesHelper } from '../helpers/grid-values.helper';
import {
  TimesheetTableApproveCellComponent
} from '../components/timesheets-table/timesheet-table-approve-cell/timesheet-table-approve-cell.component';
import { TimeSheetsPage } from '../store/model/timesheets.model';
import { TimesheetTableLinkComponent } from '../components/timesheets-table/timesheet-table-link/timesheet-table-link.component';

const valueHelper = new GridValuesHelper();

const commonColumn: ColDef = {
  sortable: true,
  resizable: true,
  filter: true,
}

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
      headerName: 'STATUS',
      minWidth: 170,
      cellRenderer: TimesheetTableStatusCellComponent,
      cellClass: 'status-cell',
      ...commonColumn,
    },
    {
      field: TimesheetsTableColumns.OrderId,
      headerName: 'ORDER ID',
      width: 140,
      minWidth: 140,
      cellClass: 'name',
      ...commonColumn,
      cellRenderer: TimesheetTableLinkComponent,
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
      valueFormatter: (params: ValueFormatterParams) => valueHelper.formatDate(params.value, 'W - ccc M/d/yy'),
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
      width: 140,
      minWidth: 140,
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
      minWidth: 160
    },
  ];
};

const defaultColumnMapping = {
  type: ControlTypes.Multiselect,
  valueType: ValueType.Id,
  valueField: 'name',
  valueId: 'id',
};

export const DefaultFilterColumns: FilterColumns = {
  orderIds: defaultColumnMapping,
  statusIds: defaultColumnMapping,
  skillIds: defaultColumnMapping,
  departmentIds: defaultColumnMapping,
  agencyIds: defaultColumnMapping,
  regionsIds: defaultColumnMapping,
  locationIds: defaultColumnMapping,
} as FilterColumns;

export const SavedFiltersParams: string[] = [
  'pageNumber',
  'pageSize',
  'organizationId',
  'orderBy',
  'date',
  'searchTerm',
  'statusIds',
];

export const DefaultFiltersState: TimesheetsFilterState = {
  pageNumber: 1,
  pageSize: 30
};

export const DefaultTimesheetCollection: TimeSheetsPage = {
  items: [],
  pageNumber: 1,
  totalPages: 1,
  totalCount: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const filterOptionFields = {
  text: 'name',
  value: 'id'
};

export const filteringOptionsMapping: Map<FilteringOptionsFields, TimesheetsTableFiltersColumns> = new Map()
  .set(FilteringOptionsFields.Agencies, TimesheetsTableFiltersColumns.AgencyIds)
  .set(FilteringOptionsFields.Orders, TimesheetsTableFiltersColumns.OrderIds)
  .set(FilteringOptionsFields.Regions, TimesheetsTableFiltersColumns.RegionsIds)
  .set(FilteringOptionsFields.Skills, TimesheetsTableFiltersColumns.SkillIds)
  .set(FilteringOptionsFields.Statuses, TimesheetsTableFiltersColumns.StatusIds);


export const filterColumnDataSource: FilterDataSource = {
  [TimesheetsTableFiltersColumns.StatusIds]: Object.values(TIMETHEETS_STATUSES).map((val, idx) => ({
    id: idx + 1,
    name: val
  })),
  [TimesheetsTableFiltersColumns.SkillIds]: [
    {
      id: 1,
      name: 'Certified Nursed Assistant'
    },
    {
      id: 2,
      name: 'Qualified Doctor'
    }
  ],
  [TimesheetsTableFiltersColumns.DepartmentIds]: [
    {
      id: 1,
      name: 'Emergency'
    },
    {
      id: 2,
      name: 'Surgery'
    }
  ],
  [TimesheetsTableFiltersColumns.AgencyIds]: [
    {
      id: 1,
      name: 'AB Staffing'
    },
    {
      id: 2,
      name: 'SQIN'
    }
  ],
  [TimesheetsTableFiltersColumns.RegionsIds]: [
    {
      id: 1,
      name: 'AR region'
    },
    {
      id: 2,
      name: 'AOP region'
    }
  ],
  [TimesheetsTableFiltersColumns.LocationIds]: [
    {
      id: 1,
      name: 'Location 1'
    },
    {
      id: 2,
      name: 'Location 2'
    }
  ],
  [TimesheetsTableFiltersColumns.OrderIds]: [
    {
      id: 1,
      name: '20-30-01'
    },
    {
      id: 2,
      name: '20-30-02'
    }
  ]
};

export const BulkApproveSuccessMessage = {
  successMessage: 'Success. Timesheets Approved',
};
