import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { GridComponent, PageSettingsModel } from '@syncfusion/ej2-angular-grids';
import { GRID_CONFIG } from 'src/app/shared/constants/grid-config';

enum PaymentDetailMode {
  Electronic = 'Electronic',
  Manual = 'Manual',
}

type PaymentDetail = {
  mode: string;
  payee: string;
  address: string;
  city: string;
  zip: number;
  startDate: string;
};

const mockData: PaymentDetail[] = [
  {
    mode: 'Electronic',
    payee: 'Payee',
    address: '1901 Thornridge Cir. Shiloh, Hawaii 81063',
    city: 'Naperville',
    zip: 213456,
    startDate: '04/04/2018',
  },
  {
    mode: 'Manual',
    payee: 'Payee',
    address: '2118 Thornridge Cir. Syracuse, Connecticut 35624',
    city: 'Toledo',
    zip: 123454,
    startDate: '04/04/2018',
  },
];

@Component({
  selector: 'app-payment-details-grid',
  templateUrl: './payment-details-grid.component.html',
  styleUrls: ['./payment-details-grid.component.scss'],
})
export class PaymentDetailsGridComponent implements AfterViewInit {
  @ViewChild('grid') grid: GridComponent;

  public data: PaymentDetail[] = mockData;
  public pageSettings: PageSettingsModel = { pageSizes: true, pageSize: 3 };
  public resizeSettings = GRID_CONFIG.resizeSettings;
  public allowPaging = GRID_CONFIG.isPagingEnabled;
  public gridHeight = '250';
  public rowsPerPageDropDown = GRID_CONFIG.rowsPerPageDropDown;
  public activeRowsPerPageDropDown = GRID_CONFIG.rowsPerPageDropDown[0];

  public initialSort = {
    columns: [{ field: 'name', direction: 'Ascending' }],
  };

  ngAfterViewInit(): void {
    this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
  }

  public dataBound(): void {
    this.grid.autoFitColumns();
  }

  public onEdit(item: unknown): void {
    console.log(item);
  }

  public onRemove(item: unknown): void {
    console.log(item);
  }

  public onFilter(): void {
    // TBI
  }

  public addNew(): void {
    // TBI
  }
}
