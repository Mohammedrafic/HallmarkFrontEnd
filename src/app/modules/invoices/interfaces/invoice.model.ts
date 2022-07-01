import { PageOfCollections } from '@shared/models/page.model';
import { DetailsColumnConfig } from '../../timesheets/interface';

export interface Invoice {

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
