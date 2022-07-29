import { InvoiceRecord } from './invoice-record.model';

export type GroupInvoicesBy = keyof Pick<InvoiceRecord, 'location' | 'department'>;
