import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { OrderStatusText } from '@shared/enums/status';

import { AgencyOrderManagement, OrderManagement } from '@shared/models/order-management.model';

type MergedOrder = AgencyOrderManagement & OrderManagement;

@Component({
  selector: 'app-grid-subrow-reorder',
  templateUrl: './grid-subrow-reorder.component.html',
  styleUrls: ['./grid-subrow-reorder.component.scss'],
})
export class GridSubrowReorderComponent implements OnInit {
  @Input() selected: boolean;
  @Input() order: MergedOrder;
  @Input() reOrder: MergedOrder;

  @Output() clickEvent = new EventEmitter<MergedOrder>();

  public orderStatusText = OrderStatusText;
  public agencyLabel = '';
  public tooltip = '';

  ngOnInit(): void {
    if (this.reOrder.allAgencies) {
      this.agencyLabel = 'All';
      return;
    }
    const length = this.reOrder.agencies?.length || 0;
    if (length === 1) {
      this.agencyLabel = (this.reOrder.agencies as string[])[0];
    } else if (length === 2) {
      this.agencyLabel = (this.reOrder.agencies as string[]).join(', ');
    } else if (length >= 3 && length <= 5) {
      this.agencyLabel = `Multiple Agencies (${length})`;
      this.tooltip = (this.reOrder.agencies as string[]).join(', ');
    } else if (length > 5) {
      this.agencyLabel = `Multiple Agencies`;
    }
  }
}

