import { Component, Input } from '@angular/core';

import { ColDef, GridApi } from "@ag-grid-community/core";

import { CandidateEducationImport } from "@shared/models/candidate-profile-import.model";
import { GridReadyEventModel } from "@shared/components/grid/models";
import { candidateEducationColumns } from "./candidate-education.constants";

@Component({
  selector: 'app-candidate-education',
  templateUrl: './candidate-education.component.html',
  styleUrls: ['./candidate-education.component.scss']
})
export class CandidateEducationComponent {
  @Input() public candidateEducationImport: CandidateEducationImport[] = [];

  public gridApi: GridApi | null = null;
  public readonly columnDefs: ColDef[] = candidateEducationColumns;

  public gridReady(event: GridReadyEventModel) {
    this.gridApi = event.api;
  }
}
