import { ColDef } from "@ag-grid-community/core";

import { GridErroredCellComponent } from "../grid-errored-cell/grid-errored-cell.component";

export const candidateProfileColumns: ColDef[] = [
  {
    field: 'firstName',
    width: 150,
    headerName: 'First Name',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'middleName',
    width: 150,
    headerName: 'Middle Name',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'lastName',
    width: 150,
    headerName: 'Last Name',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'profileStatus',
    width: 150,
    headerName: 'Profile Status',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'dob',
    width: 150,
    headerName: 'DOB',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'email',
    width: 150,
    headerName: 'Email',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'skill',
    width: 150,
    headerName: 'Skills',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'candidateAgencyStatus',
    width: 200,
    headerName: 'Cand. Agency Status',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'classification',
    width: 150,
    headerName: 'Classification',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'ssn',
    width: 150,
    headerName: 'SSN',
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
    field: 'country',
    width: 150,
    headerName: 'Country',
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
    field: 'phone1',
    width: 150,
    headerName: 'Phone 1',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'phone2',
    width: 150,
    headerName: 'Phone 2',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'professionalSummary',
    width: 220,
    headerName: 'Professional Summary',
    cellRenderer: GridErroredCellComponent,
  },
];
