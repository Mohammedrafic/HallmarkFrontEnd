import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { InvoicePaymentDetailsComponent } from '../../invoice-payment-details.component';

@Component({
  selector: 'app-edit-payment-renderer',
  templateUrl: './edit-payment-renderer.component.html',
  styleUrls: ['./edit-payment-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPaymentRendererComponent implements ICellRendererAngularComp {
  componentParent: InvoicePaymentDetailsComponent;

  invoiceId: string;

  editAllowed = true;

  agInit(params: ICellRendererParams): void {
    this.componentParent = params.context.componentParent;
    this.invoiceId = params.data.checkNumber;
    this.editAllowed = this.componentParent.actionsAllowed;
  }

  refresh(): boolean {
    return true;
  }

  editCheck(): void {
    this.componentParent.editPayment(this.invoiceId);
  }
}
