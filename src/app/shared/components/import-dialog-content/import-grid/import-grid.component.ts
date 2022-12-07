import { Component, Input } from '@angular/core';
import { ColDef, GridApi } from '@ag-grid-community/core';
import { GridReadyEventModel } from '@shared/components/grid/models';

@Component({
  selector: 'app-import-grid',
  templateUrl: './import-grid.component.html',
  styleUrls: ['./import-grid.component.scss'],
})
export class ImportGridComponent {
  @Input() public gridName: string | undefined;
  @Input() public importedItems: unknown[] = [];
  @Input() public columnDefs: ColDef[] = [];

  public gridApi: GridApi | null = null;

  public gridReady(event: GridReadyEventModel) {
    this.gridApi = event.api;
  }
}
