import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { OrderManagementChild } from '@shared/models/order-management.model';

@Component({
  selector: 'app-all-invoices-subrow',
  templateUrl: './all-invoices-subrow.component.html',
  styleUrls: ['./all-invoices-subrow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllInvoicesSubrowComponent {
  @Input() rowData: any;
  @Input() child: any;
  @Input() selected: boolean;

  @Output() clickEvent = new EventEmitter<OrderManagementChild>();
}
