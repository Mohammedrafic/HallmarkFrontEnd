import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { CredentialStatus, STATUS_COLOR_GROUP } from '@shared/enums/status';

@Component({
  selector: 'app-credential-status-cell',
  templateUrl: './credential-status-cell.component.html',
  styleUrls: ['./credential-status-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CredentialStatusCellComponent implements ICellRendererAngularComp  {
  status: string;
  chipsClass: string;

  agInit(params: ICellRendererParams): void {
    this.setData(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    return false;
  }

  private setData(params: ICellRendererParams): void {
    this.status = CredentialStatus[params.data.status as CredentialStatus];
    this.chipsClass = this.getChipCssClass(this.status);
  }

  private getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find((item) => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }
}
