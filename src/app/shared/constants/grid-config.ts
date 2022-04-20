import { ResizeSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';

export const GRID_CONFIG = {
  initialRowsPerPage: 30,
  rowsPerPageDropDown: [ '30 Rows', '50 Rows', '100 Rows' ],
  isPagingEnabled: true,
  isSortingEnabled: true,
  isResizingEnabled: true,
  isWordWrappingEnabled: true,
  wordWrapSettings: { wrapMode: 'Content' } as TextWrapSettingsModel,
  gridHeight: '660',
  initialRowHeight: 64,
  resizeSettings: { mode:'Auto' } as ResizeSettingsModel,
  gridPageSettings: { pageSizes: true, pageSize: 30 },
  columns: []
}
