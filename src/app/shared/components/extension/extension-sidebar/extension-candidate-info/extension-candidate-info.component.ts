import { Component, Input } from '@angular/core';
import { OrderCandidateJob, OrderManagementChild } from '@shared/models/order-management.model';

@Component({
  selector: 'app-extension-candidate-info',
  templateUrl: './extension-candidate-info.component.html',
  styleUrls: ['./extension-candidate-info.component.scss'],
})
export class ExtensionCandidateInfoComponent {
  @Input() public candidateJob: OrderCandidateJob;
  @Input() public orderPosition: OrderManagementChild;
  @Input() public system: string;
}
