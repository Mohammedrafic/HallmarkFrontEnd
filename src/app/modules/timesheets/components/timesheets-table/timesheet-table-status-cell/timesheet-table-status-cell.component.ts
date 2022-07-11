import { Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-timesheet-table-status-cell',
  templateUrl: './timesheet-table-status-cell.component.html',
  styleUrls: ['./timesheet-table-status-cell.component.scss']
})
export class TimesheetTableStatusCellComponent implements ICellRendererAngularComp {
  public cellValue: string;

  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.cellValue = params.value;
  }

  // gets called whenever the cell refreshes
  refresh(params: ICellRendererParams): boolean {
    // set value into cell again
    this.cellValue = params.value;

    return true;
  }
}
