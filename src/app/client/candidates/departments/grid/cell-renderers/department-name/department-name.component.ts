import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DepartmentAssigned } from '@client/candidates/departments/departments.model';
import { GridCellRenderer } from '@shared/components/grid/models';

@Component({
  selector: 'app-department-name',
  templateUrl: './department-name.component.html',
  styleUrls: ['./department-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentNameComponent extends GridCellRenderer<DepartmentAssigned & ICellRendererParams> {}

