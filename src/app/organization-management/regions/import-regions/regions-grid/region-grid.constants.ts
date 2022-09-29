import { ColDef } from "@ag-grid-community/core";

import { GridErroredCellComponent } from "@shared/components/import-dialog-content/grid-errored-cell/grid-errored-cell.component";

export const regionsColumns: ColDef[] = [
  {
    field: 'orgName',
    width: 150,
    headerName: 'Organization',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'regionName',
    width: 150,
    headerName: 'Region',
    cellRenderer: GridErroredCellComponent,
  },
]