import { ColDef } from "@ag-grid-community/core";

import { GridErroredCellComponent } from "@shared/components/import-dialog-content/grid-errored-cell/grid-errored-cell.component";

export const departmentsColumns: ColDef[] = [
  {
    field: 'orgName',
    width: 150,
    headerName: 'Organization',
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
    field: 'departmentName',
    width: 200,
    headerName: 'Department Name',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'extDepartmentId',
    width: 200,
    headerName: 'Ext Department ID',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'invoiceDepartmentId',
    width: 200,
    headerName: 'Invoice Department ID',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'facilityContact',
    width: 150,
    headerName: 'Facility Contact',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'facilityEmail',
    width: 150,
    headerName: 'Facility Email',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'facilityPhoneNo',
    width: 200,
    headerName: 'Facility Phone Number',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'inactiveDate',
    width: 150,
    headerName: 'Inactive Date',
    cellRenderer: GridErroredCellComponent,
  },
];
