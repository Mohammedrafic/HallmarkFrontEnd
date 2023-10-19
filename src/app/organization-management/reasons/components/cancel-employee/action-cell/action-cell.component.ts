import { Component,ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererParams } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { CancelEmployeeComponent } from '@organization-management/reasons/components/cancel-employee/cancel-employee.component';
import { CancelEmployeeReasonValue } from '@organization-management/reasons/interfaces';

@Component({
  selector: 'app-action-cell',
  templateUrl: './action-cell.component.html',
  styleUrls: ['./action-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionCellComponent implements ICellRendererAngularComp {
  public componentParent: CancelEmployeeComponent;

  private selectedReason: CancelEmployeeReasonValue;

  public agInit(params: ICellRendererParams): void {
    this.setData(params);
  }

  public refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    return false;
  }

  editRecord(): void {
    this.componentParent.editReasonRecord(this.selectedReason);
  }

  deleteRecord(): void {
    this.componentParent.onRemove(this.selectedReason.id as number);
  }

  private setData(params: ICellRendererParams): void {
    this.componentParent = params.context.componentParent;
    this.selectedReason = params.data;
  }

}
