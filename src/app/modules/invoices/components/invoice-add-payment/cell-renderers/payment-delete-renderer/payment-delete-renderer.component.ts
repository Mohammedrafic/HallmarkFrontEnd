import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { InvoiceAddPaymentComponent } from '../../invoice-add-payment.component';

@Component({
  selector: 'app-payment-delete-renderer',
  templateUrl: './payment-delete-renderer.component.html',
  styleUrls: ['./payment-delete-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDeleteRendererComponent implements ICellRendererAngularComp {
  componentParent: InvoiceAddPaymentComponent;

  deleteAllowed = true;

  private invoiceId: string;

  agInit(params: ICellRendererParams): void {
    this.componentParent = params.context.componentParent;
    this.invoiceId = params.data.invoiceNumber;
    this.setActionAvaliability();
  }

  refresh(): boolean {
    return true;
  }

  deleteRecord(): void {
    this.componentParent.deletePayment(this.invoiceId);
  }

  private setActionAvaliability(): void {
    this.deleteAllowed = this.componentParent.tableData.length > 1;
  }
}
