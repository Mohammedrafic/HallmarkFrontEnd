import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { InvoicePaymentDetailsComponent } from '../../invoice-payment-details.component';
import { InvoicesApiService } from 'src/app/modules/invoices/services';

@Component({
  selector: 'app-edit-payment-renderer',
  templateUrl: './edit-payment-renderer.component.html',
  styleUrls: ['./edit-payment-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPaymentRendererComponent implements ICellRendererAngularComp {
  componentParent: InvoicePaymentDetailsComponent;

  invoiceId: string;
  paramsvalue: any;
  constructor(private apiservice:InvoicesApiService)
  {

  }
  agInit(params: ICellRendererParams): void {
    this.componentParent = params.context.componentParent;
    this.invoiceId = params.data.checkNumber;
    this.paramsvalue=params.data
  }

  refresh(): boolean {
    return true;
  }

  editCheck(): void {
    this.componentParent.editPayment(this.invoiceId);

    this.apiservice.setInvoiceData(this.paramsvalue);

  }
}
