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

  agInit(params: ICellRendererParams): void {
    this.cellValue = params.value;
  }

  refresh(params: ICellRendererParams): boolean {
    this.cellValue = params.value;

    return true;
  }
}
