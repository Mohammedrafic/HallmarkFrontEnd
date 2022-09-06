import { PendingApprovalInvoice } from '../interfaces/pending-approval-invoice.interface';

export class InvoiceMessageHelper {
  static getInvoiceIds(data: PendingApprovalInvoice[]): string {
    const ids = data.map((item) => item.formattedInvoiceId);

    return ids.join(', ');
  }
}