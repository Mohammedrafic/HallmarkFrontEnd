import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';

import { AgencyOrderManagement, AgencyOrderManagementChild } from '@shared/models/order-management.model';

enum candidatSatus {
  'Not Applied' = 5,
  Applied = 10,
  Shortlisted = 20,
  'Pre Offer Custom' = 30,
  Offered = 40,
  Accepted = 50,
  'OnBoarded' = 60,
  Rejected = 100,
}

enum OrderStatus {
  Incomplete = 1,
  PreOpen = 5,
  Open = 20,
  'In progress' = 30,
  'In Progress (Pending)' = 31,
  'In Progress (Accepted)' = 32,
  Filled = 50,
  Closed = 60,
}

@Component({
  selector: 'app-grid-subrow-candidate',
  templateUrl: './grid-subrow-candidate.component.html',
  styleUrls: ['./grid-subrow-candidate.component.scss'],
})
export class GridSubrowCandidateComponent {
  @Input() selected: boolean;
  @Input() order: AgencyOrderManagement;
  @Input() candidatIndex: number;
  @Input() candidat: AgencyOrderManagementChild;

  @Output() clickEvent = new EventEmitter<never>();

  public candidatSatus = candidatSatus;
  public orderStatus = OrderStatus;
}

