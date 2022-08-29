import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';

@Component({
  selector: 'app-grid-status-renderer',
  templateUrl: './grid-status-renderer.component.html',
  styleUrls: ['./grid-status-renderer.component.scss'],
})
export class GridStatusRendererComponent implements ICellRendererAngularComp {
  public cellValue: string;

  public agInit(params: ICellRendererParams): void {
    this.cellValue = CandidatStatus[params.value];
  }

  public refresh(params: ICellRendererParams): boolean {
    this.cellValue = CandidatStatus[params.value];
    return true;
  }
}
