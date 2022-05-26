import { SortingDirections } from '@shared/enums/sorting';
import { PageEventArgs } from '@syncfusion/ej2-angular-grids';
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
  orderBy = '';

  refreshing = false;

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

  updatePage(): void {
    console.warn('Override updatePage() method in child component:');
    console.warn('public override updatePage(): void { }');
  }

  sortingHandler(args: any): void {
    if (args.columnName) {
      const direction = args.direction === 'Ascending' ? SortingDirections.Ascending : SortingDirections.Descending;
      this.orderBy = args.columnName + ' ' + direction;
    } else {
      this.orderBy = '';
    }
    this.updatePage();
  }

  actionBegin(args: PageEventArgs): void {
    if (args.requestType === 'sorting') {
      this.sortingHandler(args);
      this.refreshing = true;
    }
    if (args.requestType === 'refresh') {
      // prevent double re-render on sorting
      if (this.refreshing) {
        args.cancel = true;
        this.refreshing = false;
      }
    }
  }
}
