import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { AgencyStatus } from '@shared/enums/status';
@Component({
  selector: 'app-msp-table-status-cell',
  templateUrl: './msp-table-status-cell.component.html',
  styleUrls: ['./msp-table-status-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MspTableStatusCellComponent implements ICellRendererAngularComp {
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
