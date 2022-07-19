import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-timesheet-table-status-cell',
  templateUrl: './timesheet-table-approve-cell.component.html',
  styleUrls: ['./timesheet-table-approve-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetTableApproveCellComponent implements ICellRendererAngularComp {

  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
  }

  // gets called whenever the cell refreshes
  refresh(params: ICellRendererParams): boolean {
    return true;
  }

  public approveItem(): void {
  }
}
