import { PageOfCollections } from '@shared/models/page.model';
import { DetailsColumnConfig } from '../../timesheets/interface';
import { InvoiceRecord } from "./invoice-record.model";
import { INVOICES_STATUSES } from '../enums/invoices.enum';

export interface Invoice extends InvoiceRecord {
  groupBy: string;
  groupName: string;
  id: string;
  amount: number;
  type: 'Interfaced';
  invoices: InvoiceRecord[];
  issuedDate: Date;
  dueDate: Date;
  statusText: INVOICES_STATUSES
}

export type InvoicePage = PageOfCollections<Invoice>;

export interface AllInvoicesTable {
  invoiceId: DetailsColumnConfig;
  statusText: DetailsColumnConfig;
  amount: DetailsColumnConfig;
  type: DetailsColumnConfig;
  organization: DetailsColumnConfig;
  location: DetailsColumnConfig;
  department: DetailsColumnConfig;
  candidate: DetailsColumnConfig;
  issueDate: DetailsColumnConfig;
  dueDate: DetailsColumnConfig;
}
