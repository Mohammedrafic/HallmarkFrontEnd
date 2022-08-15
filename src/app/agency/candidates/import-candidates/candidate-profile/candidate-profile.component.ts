import { Component, Input } from '@angular/core';

import { ColDef, GridApi } from "@ag-grid-community/core";

import { CandidateProfile } from "@shared/models/candidate-profile-import.model";
import { GridReadyEventModel } from "@shared/components/grid/models";
import { candidateProfileColumns } from "./candidate-profile.constants";


@Component({
  selector: 'app-candidate-profile',
  templateUrl: './candidate-profile.component.html',
  styleUrls: ['./candidate-profile.component.scss']
})
export class CandidateProfileComponent {
  @Input() public candidateProfile: CandidateProfile;

  public gridApi: GridApi | null = null;
  public readonly columnDefs: ColDef[] = candidateProfileColumns;

  public gridReady(event: GridReadyEventModel) {
    this.gridApi = event.api;
  }
}
