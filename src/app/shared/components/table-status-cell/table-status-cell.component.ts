import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-table-status-cell',
  templateUrl: './table-status-cell.component.html',
  styleUrls: ['./table-status-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableStatusCellComponent implements ICellRendererAngularComp {
  public cellValue: string;
  public isEChipShown = false;

  agInit(params: ICellRendererParams): void {
    this.cellValue = params.valueFormatted || params.value;

    this.isEChipShown = params.data?.extensionFromId;
  }

  refresh(params: ICellRendererParams): boolean {
    this.cellValue = params.value;

    return true;
  }
}
