import { ColDef } from "@ag-grid-community/core";

import { GridErroredCellComponent } from "@shared/components/import-dialog-content/grid-errored-cell/grid-errored-cell.component";

export const candidateExperienceColumns: ColDef[] = [
   {
     field: 'employer',
     width: 150,
     headerName: 'Employer',
     cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'jobTitle',
    width: 150,
    headerName: 'Job Title',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'startDate',
    width: 200,
    headerName: 'Start Month/Year',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'endDate',
    width: 200,
    headerName: 'End Month/Year',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'comments',
    width: 150,
    headerName: 'Comments',
    cellRenderer: GridErroredCellComponent,
  },
];
