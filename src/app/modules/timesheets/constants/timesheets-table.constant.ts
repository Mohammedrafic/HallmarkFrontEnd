import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { ColDef } from '@ag-grid-community/core';

import { TimesheetsTableColumns, TIMETHEETS_STATUSES } from '../enums';
import { FilterColumns, FilterDataSource, TimesheetsFilterState } from '../interface';
import {
  TimesheetTableStatusCellComponent
} from '../components/timesheets-table/timesheet-table-status-cell/timesheet-table-status-cell.component';
import { GridValuesHelper } from '../helpers/grid-values.helper';

const valueHelper = new GridValuesHelper();

const commonColumn: ColDef = {
  filter: true,
  sortable: true,
  resizable: true,
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
      field: TimesheetsTableColumns.Name,
      headerName: 'NAME',
      width: 158,
      minWidth: 158,
      cellClass: 'name',
      ...commonColumn,
    },
    {
      field: TimesheetsTableColumns.StatusText,
      headerName: 'STATUS',
      width: 170,
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
      valueFormatter: (params: any) => valueHelper.formatDate(params.value, 'W - ccc M/d/yy'),
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

export const DefaultFilterColumns: FilterColumns = {
  orderId: { type: ControlTypes.Multiselect, valueType: ValueType.Text },
  statusText: { type: ControlTypes.Multiselect, valueType: ValueType.Text },
  skill: { type: ControlTypes.Multiselect, valueType: ValueType.Text },
  department: { type: ControlTypes.Multiselect, valueType: ValueType.Text },
  agencyName: { type: ControlTypes.Multiselect, valueType: ValueType.Text },
  orgName: { type: ControlTypes.Multiselect, valueType: ValueType.Text },
  region: { type: ControlTypes.Multiselect, valueType: ValueType.Text },
  location: { type: ControlTypes.Multiselect, valueType: ValueType.Text }
} as FilterColumns;

export const DefaultFiltersState: TimesheetsFilterState = {
  pageNumber: 1,
  pageSize: 30
};

export const filterOptionFields = {
  text: 'name',
  value: 'name'
};

export const filterColumnDataSource: FilterDataSource = {
  statusText: Object.values(TIMETHEETS_STATUSES).map((val, idx) => ({
    id: idx + 1,
    name: val
  })),
  skill: [
    {
      id: 1,
      name: 'Certified Nursed Assistant'
    },
    {
      id: 2,
      name: 'Qualified Doctor'
    }
  ],
  department: [
    {
      id: 1,
      name: 'Emergency'
    },
    {
      id: 2,
      name: 'Surgery'
    }
  ],
  agencyName: [
    {
      id: 1,
      name: 'AB Staffing'
    },
    {
      id: 2,
      name: 'SQIN'
    }
  ],
  orgName: [
    {
      id: 1,
      name: 'Org 1'
    },
    {
      id: 2,
      name: 'Org 2'
    }
  ],
  region: [
    {
      id: 1,
      name: 'AR region'
    },
    {
      id: 2,
      name: 'AOP region'
    }
  ],
  location: [
    {
      id: 1,
      name: 'Location 1'
    },
    {
      id: 2,
      name: 'Location 2'
    }
  ],
  orderId: [
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
