import { ColDef } from '@ag-grid-community/core';

import { GridErroredCellComponent } from '@shared/components/import-dialog-content/grid-errored-cell/grid-errored-cell.component';

export const billRatesColumns: ColDef[] = [
  {
    field: 'orgName',
    width: 150,
    headerName: 'Organization Name',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'region',
    width: 150,
    headerName: 'Region',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'location',
    width: 200,
    headerName: 'Location',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'department',
    width: 200,
    headerName: 'Department Name',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'skill',
    width: 200,
    headerName: 'Skill',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'orderType',
    width: 200,
    headerName: 'Order Type',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'billRateTitle',
    width: 150,
    headerName: 'Bill Rates Title',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'billRateType',
    width: 150,
    headerName: 'Bill Rate Type',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'amountMultiplier',
    width: 200,
    headerName: 'Amount/Multiplier ',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'effectiveDate',
    width: 150,
    headerName: 'Effective Date',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'intervalMin',
    width: 150,
    headerName: 'Interval Min',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'intervalMax',
    width: 150,
    headerName: 'Interval Max',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'considerForWeeklyOT',
    width: 150,
    headerName: 'Consider for Weekly OT',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'considerForDailyOT',
    width: 150,
    headerName: 'Consider for Daily OT',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'considerFor7thDayOT',
    width: 150,
    headerName: 'Consider for 7th Day OT',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'regularLocal',
    width: 150,
    headerName: 'Regular/Local',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'displayInTimesheet',
    width: 150,
    headerName: 'Display in Timesheet',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'displayInJob',
    width: 150,
    headerName: 'Display in Job',
    cellRenderer: GridErroredCellComponent,
  },
];
