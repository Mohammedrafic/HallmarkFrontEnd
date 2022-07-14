import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OrderStatusText } from '@shared/enums/status';

import { AgencyOrderManagement, OrderManagement } from '@shared/models/order-management.model';

type MergedOrder = AgencyOrderManagement & OrderManagement;

@Component({
  selector: 'app-grid-subrow-reorder',
  templateUrl: './grid-subrow-reorder.component.html',
  styleUrls: ['./grid-subrow-reorder.component.scss'],
})
export class GridSubrowReorderComponent {
  @Input() selected: boolean;
  @Input() order: MergedOrder;
  @Input() reOrder: MergedOrder;

  @Output() clickEvent = new EventEmitter<MergedOrder>();

  public orderStatusText = OrderStatusText;
}

