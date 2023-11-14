import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { AgencyStatus, STATUS_COLOR_GROUP } from '@shared/enums/status';
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
    console.log("Ce;;",this.cellValue)
    this.isEChipShown = params.data?.extensionFromId;
  }

  refresh(params: ICellRendererParams): boolean {
    this.cellValue = params.value;

    return true;
  }

  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find((item) => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }
}
