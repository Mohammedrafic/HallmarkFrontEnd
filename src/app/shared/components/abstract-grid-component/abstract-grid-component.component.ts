import { ResizeSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';

import { GRID_CONFIG } from '../../constants/grid-config';

export abstract class AbstractGridComponentComponent {
// grid
  gridDataSource: object[] = [];
  allowPaging = GRID_CONFIG.isPagingEnabled;
  pageSettings = GRID_CONFIG.gridPageSettings;
  gridHeight = GRID_CONFIG.gridHeight;
  rowHeight = GRID_CONFIG.initialRowHeight;
  resizeSettings: ResizeSettingsModel = GRID_CONFIG.resizeSettings;
  allowSorting = GRID_CONFIG.isSortingEnabled;
  allowResizing = GRID_CONFIG.isResizingEnabled;

  // rows per page
  rowsPerPageDropDown = GRID_CONFIG.rowsPerPageDropDown;
  activeRowsPerPageDropDown = GRID_CONFIG.rowsPerPageDropDown[0];

  // go to page
  lastAvailablePage = 0;
  validateDecimalOnType = true;
  decimals = 0;

  // pager
  totalDataRecords: number;
  pageSizePager = GRID_CONFIG.initialRowsPerPage;
  currentPagerPage: number = 1;

  protected constructor() { }
}
