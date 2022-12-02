import { Component, Input } from '@angular/core';
import { ColDef, GridApi } from "@ag-grid-community/core";
import { regionsColumns} from "./region-grid.constants";
import { GridReadyEventModel } from "@shared/components/grid/models";
import { ImportedRegion } from "@shared/models/region.model";

@Component({
  selector: 'app-regions-grid',
  templateUrl: './regions-grid.component.html',
  styleUrls: ['./regions-grid.component.scss']
})
export class RegionsGridComponent  {

  @Input() public importedregions: ImportedRegion[] = [];

  public gridApi: GridApi | null = null;
  public readonly columnDefs: ColDef[] = regionsColumns;

  public gridReady(event: GridReadyEventModel) {
    this.gridApi = event.api;
    this.gridApi.setDomLayout("autoHeight");
  }

}




