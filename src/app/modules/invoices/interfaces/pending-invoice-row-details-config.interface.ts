import { AttachmentAction } from '@shared/components/attachments';
import { InvoiceAttachment } from './invoice-attachment.interface';
import { TypedColDef } from './typed-col-def.interface';
import { PendingInvoiceRecord } from './pending-invoice-record.interface';

type InvoiceAttachmentAction = AttachmentAction<InvoiceAttachment>;
export type GetPendingInvoiceDetailsColDefsFn = (config: PendingInvoiceRowDetailsConfig) =>
  TypedColDef<PendingInvoiceRecord>[];

export interface PendingInvoiceRowDetailsConfig {
  previewExpensesAttachment: InvoiceAttachmentAction;
  downloadExpensesAttachment: InvoiceAttachmentAction;

  previewMilesAttachments: (invoiceId: number) => InvoiceAttachmentAction;
  downloadMilesAttachments: (invoiceId: number) => InvoiceAttachmentAction;
}
