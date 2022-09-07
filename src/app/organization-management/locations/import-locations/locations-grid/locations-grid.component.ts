import { Component, Input } from '@angular/core';

import { ColDef, GridApi } from "@ag-grid-community/core";

import { locationsColumns } from "./location-grid.constants";
import { GridReadyEventModel } from "@shared/components/grid/models";
import { ImportedLocation } from "@shared/models/location.model";

@Component({
  selector: 'app-locations-grid',
  templateUrl: './locations-grid.component.html',
  styleUrls: ['./locations-grid.component.scss']
})
export class LocationsGridComponent {
  @Input() public importedLocations: ImportedLocation[] = [];

  public gridApi: GridApi | null = null;
  public readonly columnDefs: ColDef[] = locationsColumns;

  public gridReady(event: GridReadyEventModel) {
    this.gridApi = event.api;
  }
}
