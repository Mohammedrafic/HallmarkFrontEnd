import { ColumnApi, GridApi } from "@ag-grid-community/core";

export const resetAgGridHorizontalScroll = (gridApi?: GridApi, columnApi?: ColumnApi): void => {
  const cell = columnApi?.getAllDisplayedColumns()[0];
  if (cell) {
    gridApi?.ensureColumnVisible(cell);
  }
};
