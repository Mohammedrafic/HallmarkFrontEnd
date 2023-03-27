import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DepartmentAssigned } from '@client/candidates/departments/departments.model';
import { departmentName } from '@client/candidates/departments/helpers/department.helper';
import { GridCellRenderer } from '@shared/components/grid/models';

@Component({
  selector: 'app-department-name',
  templateUrl: './department-name.component.html',
  styleUrls: ['./department-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentNameComponent extends GridCellRenderer<DepartmentAssigned & ICellRendererParams> {
  public readonly tooltip = 'Home Cost Center';
  public departmentName: string;

  public ngOnInit(): void {
    this.departmentName = departmentName(this.params.data.departmentName, this.params.data.extDepartmentId);
  }
}
