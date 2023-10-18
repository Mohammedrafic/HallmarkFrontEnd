import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-open-job-status',
  templateUrl: './open-job-status.component.html',
  styleUrls: ['./open-job-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenJobStatusComponent implements ICellRendererAngularComp {

  public applicantStatus: string;

  public agInit(params: ICellRendererParams): void {
    this.setData(params);
  }

  public refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    return true;
  }

  private setData(params: ICellRendererParams): void {
    this.applicantStatus = params.data.statusName;
  }
}