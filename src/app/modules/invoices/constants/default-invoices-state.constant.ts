import { InvoicesModel } from '../store/invoices.model';
import { InvoiceDefaultFilterColumns } from './invoices.constant';

export const DefaultInvoicesState: InvoicesModel = {
  invoicesData: null,
  invoicesFilters: null,
  invoiceFiltersColumns: InvoiceDefaultFilterColumns,
  isInvoiceDetailDialogOpen: false,
  nextInvoiceId: null,
  prevInvoiceId: null,
  selectedInvoiceId: null,
  invoiceReasons: [],
  invoiceMeta: [],
};
