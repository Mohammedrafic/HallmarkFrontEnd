import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-critical-cell',
  templateUrl: './critical-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriticalCellComponent implements ICellRendererAngularComp {
  public isShowCriticalIcon: boolean;

  agInit(params: ICellRendererParams): void {
    this.isShowCriticalIcon = params.data.criticalOrder;
  }

  refresh(): boolean {
    return true;
  }
}
