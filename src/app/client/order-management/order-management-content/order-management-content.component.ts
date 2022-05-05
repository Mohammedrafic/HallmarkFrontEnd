import { Component, OnInit, ViewChild } from '@angular/core';

import { Store } from '@ngxs/store';
import { GridComponent, PagerComponent, PageSettingsModel } from '@syncfusion/ej2-angular-grids';
import { Observable, of } from 'rxjs';

// TODO: remove after BE implementation
import { data } from './datasource';

import { SetHeaderState } from 'src/app/store/app.actions';
import { ORDERS_GRID_CONFIG } from '../../client.config';
import { ResizeSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';

export const ROW_HEIGHT = {
  SCALE_UP_HEIGHT: 140,
  SCALE_DOWN_HEIGHT: 64
}

@Component({
  selector: 'app-order-management-content',
  templateUrl: './order-management-content.component.html',
  styleUrls: ['./order-management-content.component.scss']
})
export class OrderManagementContentComponent implements OnInit {

  data: Observable<object[]> = of(data);
  pageSettings: PageSettingsModel = ORDERS_GRID_CONFIG.gridPageSettings;
  allowPaging = ORDERS_GRID_CONFIG.isPagingEnabled;
  gridHeight = ORDERS_GRID_CONFIG.gridHeight;
  allowSorting = ORDERS_GRID_CONFIG.isSortingEnabled;
  allowResizing = ORDERS_GRID_CONFIG.isResizingEnabled;
  allowWrap = ORDERS_GRID_CONFIG.isWordWrappingEnabled;
  wrapSettings: TextWrapSettingsModel = ORDERS_GRID_CONFIG.wordWrapSettings;
  rowHeight = ORDERS_GRID_CONFIG.initialRowHeight;
  resizeSettings: ResizeSettingsModel = ORDERS_GRID_CONFIG.resizeSettings;

  rowsPerPageDropDown = ORDERS_GRID_CONFIG.rowsPerPageDropDown;
  activeRowsPerPageDropDown = ORDERS_GRID_CONFIG.rowsPerPageDropDown[0];

  lastAvailablePage = 0;
  validateDecimalOnType = true;
  decimals = 0;

  gridDataSource: object[] = [];
  totalDataRecords: number;
  pageSizePager = ORDERS_GRID_CONFIG.initialRowsPerPage;
  currentPagerPage: number = 1;

  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
  }

  ngOnInit(): void {
    this.data.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  onRowScaleUpClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_UP_HEIGHT;
  }

  onRowScaleDownClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_DOWN_HEIGHT;
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.data.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find(item => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  setRowHighlight(args: any): void {
    // get and highlight rows with status 'open'
    if (Object.values(STATUS_COLOR_GROUP)[0].includes(args.data['status'])) {
      args.row.classList.add('e-success-row');
    }
  }

  getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  getRowsPerPage(data: object[], currentPage: number): object[] {
    return data.slice((currentPage * this.getActiveRowsPerPage()) - this.getActiveRowsPerPage(),
      (currentPage * this.getActiveRowsPerPage()));
  }

  getLastPage(data: object[]): number {
    return Math.round(data.length / this.getActiveRowsPerPage()) + 1;
  }
}
