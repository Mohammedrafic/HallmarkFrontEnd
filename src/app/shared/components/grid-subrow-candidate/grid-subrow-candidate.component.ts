import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { OrderStatusText } from '@shared/enums/status';

import { AgencyOrderManagement, OrderManagementChild, OrderManagement } from '@shared/models/order-management.model';

type MergedOrder = AgencyOrderManagement & OrderManagement;

@Component({
  selector: 'app-grid-subrow-candidate',
  templateUrl: './grid-subrow-candidate.component.html',
  styleUrls: ['./grid-subrow-candidate.component.scss'],
})
export class GridSubrowCandidateComponent {
  @Input() selected: boolean;
  @Input() order: MergedOrder;
  @Input() candidat: OrderManagementChild;
  @Input() isAgency: boolean;

  @Output() clickEvent = new EventEmitter<OrderManagementChild>();

  public orderStatusText = OrderStatusText;
  public candidatStatus = CandidatStatus;
}
