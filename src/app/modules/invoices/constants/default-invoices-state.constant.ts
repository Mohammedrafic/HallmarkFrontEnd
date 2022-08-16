import { InvoicesModel } from '../store/invoices.model';
import { InvoiceDefaultFilterColumns } from './invoices.constant';

export const DefaultInvoicesState: InvoicesModel = {
  invoicesData: null,
  pendingInvoicesData: null,
  invoicesFilters: null,
  invoiceFiltersColumns: InvoiceDefaultFilterColumns,
  isInvoiceDetailDialogOpen: false,
  nextInvoiceId: null,
  prevInvoiceId: null,
  selectedInvoiceId: null,
  invoiceReasons: [],
  invoiceMeta: [],
  organizations: [],
  organizationLocations: [],
  selectedOrganizationId: 0,
  regions: [],
};
