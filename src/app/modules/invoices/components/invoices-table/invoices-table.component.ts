import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Invoice, InvoicesTable } from "../../interfaces";

@Component({
  selector: 'app-invoices-table',
  templateUrl: './invoices-table.component.html',
  styleUrls: ['./invoices-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesTableComponent<T> extends InvoicesTable<Invoice> {
  constructor() {
    super();
  }
}
