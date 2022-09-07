import { ColDef } from "@ag-grid-community/core";

import { GridErroredCellComponent } from "@shared/components/import-dialog-content/grid-errored-cell/grid-errored-cell.component";

export const locationsColumns: ColDef[] = [
  {
    field: 'regionName',
    width: 150,
    headerName: 'Region',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'locationName',
    width: 200,
    headerName: 'Location Name',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'externalId',
    width: 200,
    headerName: 'Ext Location ID',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'invoiceId',
    width: 200,
    headerName: 'Invoice Location ID',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'address1',
    width: 150,
    headerName: 'Address 1',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'address2',
    width: 150,
    headerName: 'Address 2',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'state',
    width: 150,
    headerName: 'State',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'city',
    width: 150,
    headerName: 'City',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'zip',
    width: 150,
    headerName: 'Zipcode',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'contactPerson',
    width: 200,
    headerName: 'Contact Person',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'contactEmail',
    width: 200,
    headerName: 'Contact Person Email',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'phoneNumber',
    width: 150,
    headerName: 'Phone Number',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'phoneType',
    width: 150,
    headerName: 'Phone Type',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'ext',
    width: 150,
    headerName: 'Ext',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'glNumber',
    width: 150,
    headerName: 'GL Number',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'invoiceNote',
    width: 150,
    headerName: 'Invoice Note',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'inactiveDate',
    width: 150,
    headerName: 'Inactive Date',
    cellRenderer: GridErroredCellComponent,
  },
];
