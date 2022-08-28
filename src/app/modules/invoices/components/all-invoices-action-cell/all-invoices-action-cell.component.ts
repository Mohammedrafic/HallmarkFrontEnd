import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ICellRendererParams } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { PendingApprovalInvoice } from '../../interfaces/pending-approval-invoice.interface';

@Component({
  selector: 'app-all-invoices-action-cell',
  templateUrl: './all-invoices-action-cell.component.html',
  styleUrls: ['./all-invoices-action-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllInvoicesActionCellComponent implements ICellRendererAngularComp {
  public action: (invoice: PendingApprovalInvoice) => void;

  public actionName: string;

  public invoice: PendingApprovalInvoice;

  public agInit(params: ICellRendererParams & { approve: () => void, pay: () => void }): void {
    this.setAction(params);
  }

  public refresh(params: ICellRendererParams & { approve: () => void, pay: () => void }): boolean {
    this.setAction(params);
    return true;
  }

  public handleAction(): void {
    this.action(this.invoice);
  }

  private setAction(params: ICellRendererParams & { approve: () => void, pay: () => void }): void {
    this.invoice = params.data;


    if (this.invoice.invoiceState === 1) {
      this.action = params.approve;
      this.actionName = 'Approve';
    } else if (this.invoice.invoiceState === 2) {
      this.action = params.pay;
      this.actionName = 'Pay';
    }
  }
}
