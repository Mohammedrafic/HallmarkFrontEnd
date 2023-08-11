import { Component, Input, ViewChild } from '@angular/core';

import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { BillRate, BillRateCategory, BillRateType } from '@shared/models/bill-rate.model';

export type BillRatesGridEvent = BillRate & { index: string };

@Component({
  selector: 'app-bill-rates-view-grid',
  templateUrl: './bill-rates-view-grid.component.html',
})
export class BillRatesViewGridComponent extends AbstractGridConfigurationComponent {
  @ViewChild('grid') grid: GridComponent;

  @Input() billRatesData: BillRate[];

  public BillRateCategory = BillRateCategory;
  public BillRateType = BillRateType;

  public initialSort = {
    columns: [{ field: 'title', direction: 'Ascending' }],
  };

  constructor() {
    super();
  }
}
