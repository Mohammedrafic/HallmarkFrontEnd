import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { OrderType } from '@shared/enums/order-type';

@Component({
  selector: 'app-tooltip-grid-cell',
  templateUrl: './tooltip-grid-cell.component.html',
  styleUrls: ['./tooltip-grid-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipGridCellComponent implements ICellRendererAngularComp {
  public orderType: string;

  agInit(params: ICellRendererParams): void {
    this.orderType = OrderType[params.value] || '';
  }

  refresh(params: ICellRendererParams): boolean {
    this.orderType = params.value;

    return true;
  }
}
