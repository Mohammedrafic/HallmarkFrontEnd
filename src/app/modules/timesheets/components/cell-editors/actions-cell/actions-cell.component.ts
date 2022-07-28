import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';

import { ICellRendererParams, ColDef } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ProfileTimesheetTableComponent } from '../../profile-timesheet-table/profile-timesheet-table.component';
import { RecordValue } from '../../../interface';

@Component({
  selector: 'app-actions-cell',
  templateUrl: './actions-cell.component.html',
  styleUrls: ['./actions-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsCellComponent implements ICellRendererAngularComp {
  public editable = false;

  private recordId: number;

  public isDeletable = true;

  componentParent: ProfileTimesheetTableComponent;

  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  public agInit(params: ICellRendererParams): void {
    this.setData(params);
    this.componentParent = params.context.componentParent;
  }

  public refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    return true;
  }

  private setData(params: ICellRendererParams): void {
    this.editable = (params.colDef as ColDef).cellRendererParams.isEditable ;
    this.recordId = params.value;
    this.isDeletable = (params.data as RecordValue).isGenerated as boolean;
    this.cd.markForCheck();
  }

  deleteRecord(): void {
    this.componentParent.deleteRecord(this.recordId);
  }

}
