import { ResizeSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';

export const GRID_CONFIG = {
  initialRowsPerPage: 100,
  initialPage: 1,
  rowsPerPageDropDown: ['30 Rows', '50 Rows', '100 Rows'],
  rowsPerPageDropDownObject: [
    { text: '30 Rows', value: 30 },
    { text: '50 Rows', value: 50 },
    { text: '100 Rows', value: 100 },
  ],
  isPagingEnabled: true,
  isSortingEnabled: true,
  isResizingEnabled: true,
  isWordWrappingEnabled: true,
  wordWrapSettings: { wrapMode: 'Content' } as TextWrapSettingsModel,
  gridHeight: '640',
  fullScreenGridHeight: '100%',
  initialRowHeight: 64,
  resizeSettings: { mode: 'Auto' } as ResizeSettingsModel,
  gridPageSettings: { pageSizes: true, pageSize: 100 },
  columns: []
};
