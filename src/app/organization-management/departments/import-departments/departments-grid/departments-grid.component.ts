import { Component, Input } from '@angular/core';

import { ColDef, GridApi } from "@ag-grid-community/core";

import { departmentsColumns } from "./departments-grid.constants";
import { GridReadyEventModel } from "@shared/components/grid/models";
import { ImportedDepartment } from "@shared/models/department.model";

@Component({
  selector: 'app-departments-grid',
  templateUrl: './departments-grid.component.html',
  styleUrls: ['./departments-grid.component.scss']
})
export class DepartmentsGridComponent{
  @Input() public importedDepartments: ImportedDepartment[] = [];

  public gridApi: GridApi | null = null;
  public readonly columnDefs: ColDef[] = departmentsColumns;

  public gridReady(event: GridReadyEventModel) {
    this.gridApi = event.api;
  }
}
