import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { OrderTypeTooltipMessage } from '@client/order-management/constants';

@Component({
  selector: 'app-table-type-cell',
  templateUrl: './table-type-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableTypeCellComponent implements ICellRendererAngularComp {
  public cellValue: string | undefined;
  public tooltipMessage: string;

  agInit(params: ICellRendererParams): void {
    this.cellValue = params.data.orderTypeText;
    this.tooltipMessage = OrderTypeTooltipMessage[params.data.orderType];
  }

  refresh(params: ICellRendererParams): boolean {
    this.cellValue = params.value;
    return true;
  }
}
