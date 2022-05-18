import { ResizeSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';

import { GRID_CONFIG } from '../../constants/grid-config';

export abstract class AbstractGridConfigurationComponent {
// grid
  gridDataSource: object[] = [];
  allowPaging = GRID_CONFIG.isPagingEnabled;
  pageSettings = GRID_CONFIG.gridPageSettings;
  gridHeight = GRID_CONFIG.gridHeight;
  fullScreenGridHeight = GRID_CONFIG.fullScreenGridHeight;
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

  pageSize = 30;
  currentPage = 1;

  clickedElement: any;

  protected constructor() { }

  addActiveCssClass(event: any): void {
    if (event) {
      this.clickedElement = event.currentTarget;
      this.clickedElement.classList.add('e-active');
      this.clickedElement.focus();
    }
  }

  removeActiveCssClass(): void {
    if (this.clickedElement) {
      this.clickedElement.classList.remove('e-active');
      this.clickedElement.focus();
      this.clickedElement = undefined;
    }
  }
}
