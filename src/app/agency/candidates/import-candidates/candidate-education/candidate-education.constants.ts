import { ColDef } from "@ag-grid-community/core";

import { GridErroredCellComponent } from "@shared/components/import-dialog-content/grid-errored-cell/grid-errored-cell.component";

export const candidateEducationColumns: ColDef[] = [
  {
    field: 'degreeType',
    width: 150,
    headerName: 'Degree Type',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'schoolName',
    width: 150,
    headerName: 'School Name',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'graduationMonth',
    width: 220,
    headerName: 'Graduation Month/Year',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'fieldOfStudy',
    width: 150,
    headerName: 'Field of Study',
    cellRenderer: GridErroredCellComponent,
  },
];
