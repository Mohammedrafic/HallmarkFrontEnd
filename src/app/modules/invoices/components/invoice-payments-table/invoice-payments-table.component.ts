import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Module } from '@ag-grid-community/core';

import { InvoicePaymentDetailsComponent } from '../invoice-payment-details/invoice-payment-details.component';
import { PaymentMeta } from '../../interfaces';

@Component({
  selector: 'app-invoice-payments-table',
  templateUrl: './invoice-payments-table.component.html',
  styleUrls: ['./invoice-payments-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicePaymentsTableComponent {
  @Input() invoiceData: PaymentMeta;

  context: { componentParent: InvoicePaymentDetailsComponent };

  readonly modules: Module[] = [ClientSideRowModelModule];

  addNewPayment(): void {}
}
