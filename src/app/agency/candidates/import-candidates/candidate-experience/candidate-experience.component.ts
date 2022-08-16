import { Component, Input } from '@angular/core';

import { ColDef, GridApi } from "@ag-grid-community/core";

import { CandidateExperiencesImport } from "@shared/models/candidate-profile-import.model";
import { GridReadyEventModel } from "@shared/components/grid/models";
import { candidateExperienceColumns } from "./candidate-experience.constants";


@Component({
  selector: 'app-candidate-experience',
  templateUrl: './candidate-experience.component.html',
  styleUrls: ['./candidate-experience.component.scss']
})
export class CandidateExperienceComponent {
  @Input() public candidateExperiencesImport: CandidateExperiencesImport[] = [];

  public gridApi: GridApi | null = null;
  public readonly columnDefs: ColDef[] = candidateExperienceColumns;

  public gridReady(event: GridReadyEventModel) {
    this.gridApi = event.api;
  }
}
