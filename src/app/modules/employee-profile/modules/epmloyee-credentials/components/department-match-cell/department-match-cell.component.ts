import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { DepartmentMatchStatus } from '@shared/components/credentials-grid/department-match-cell/department-match-cell-enum';
import {
  departmentMatchCellConfig,
} from '@shared/components/credentials-grid/department-match-cell/department-match-cell.constant';
import {
  DepartmentMatchConfig,
} from '@shared/components/credentials-grid/department-match-cell/department-match-cell.interface';

@Component({
  selector: 'app-department-match-cell',
  templateUrl: './department-match-cell.component.html',
  styleUrls: ['./department-match-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentMatchCellComponent implements ICellRendererAngularComp  {
  config: DepartmentMatchConfig;

  agInit(params: ICellRendererParams): void {
    this.setData(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    return false;
  }

  private setData(params: ICellRendererParams): void {
    this.config = departmentMatchCellConfig[params.data.departmentMatch as DepartmentMatchStatus];
  }
}
