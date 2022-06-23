import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';

import { AgencyOrderManagement, AgencyOrderManagementChild } from '@shared/models/order-management.model';

@Component({
  selector: 'app-grid-subrow-candidate',
  templateUrl: './grid-subrow-candidate.component.html',
  styleUrls: ['./grid-subrow-candidate.component.scss'],
})
export class GridSubrowCandidateComponent {
  @Input() selected: boolean;
  @Input() order: AgencyOrderManagement;
  @Input() candidat: AgencyOrderManagementChild;

  @Output() clickEvent = new EventEmitter<AgencyOrderManagementChild>();

  public candidatStatus = CandidatStatus;
}

