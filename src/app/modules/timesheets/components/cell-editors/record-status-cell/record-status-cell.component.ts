import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { RecordStatus } from '../../../enums';

@Component({
  selector: 'app-record-status-cell',
  templateUrl: './record-status-cell.component.html',
  styleUrls: ['./record-status-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordStatusCellComponent implements ICellRendererAngularComp {
  public cellValue: string | null;

  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  agInit(params: ICellRendererParams): void {
    const status = params.value as RecordStatus;
    this.cellValue = this.checkStatus(status) ? status : null;
    this.cd.markForCheck();
  }


  refresh(params: ICellRendererParams): boolean {
    const status = params.value as RecordStatus;
    this.cellValue = this.checkStatus(status) ? status : null;
    this.cd.markForCheck();

    return true;
  }

  private checkStatus(status: RecordStatus): boolean {
    return (status === RecordStatus.Deleted || status === RecordStatus.New);
  }
}
