import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { OrderManagementChild } from '@shared/models/order-management.model';
import { InvoiceItem } from '../../interfaces';

@Component({
  selector: 'app-all-invoices-subrow',
  templateUrl: './all-invoices-subrow.component.html',
  styleUrls: ['./all-invoices-subrow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllInvoicesSubrowComponent {
  @Input() rowData: any;
  @Input() invoice: InvoiceItem;
  @Input() selected: boolean;

  @Output() clickEvent = new EventEmitter<OrderManagementChild>();

  public get createRange(): string {
    return this.invoice.minRate === this.invoice.maxRate ?
      `${this.invoice.minRate}`
      : `${ this.invoice.minRate } - ${ this.invoice.maxRate }`;
  }
}
