import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { IrpOrderTypeTooltipMessage } from '@shared/enums/order-type';

@Component({
  selector: 'app-table-type-cell',
  templateUrl: './table-type-cell.component.html',
  styleUrls: ['./table-type-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableTypeCellComponent implements ICellRendererAngularComp {
  public cellValue: string | undefined;
  public tooltipMessage: string;

  agInit(params: ICellRendererParams): void {
    this.cellValue = this.setOrderAbbreviation(params.data.orderTypeText);
    this.tooltipMessage = IrpOrderTypeTooltipMessage[params.data.orderType];
  }

  refresh(params: ICellRendererParams): boolean {
    this.cellValue = params.value;
    return true;
  }

  private setOrderAbbreviation(typeText: string): string {
    if (typeText === 'PD') {
      return 'D';
    }

    return 'L';
  }
}
