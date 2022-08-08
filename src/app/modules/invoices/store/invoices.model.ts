import { PageOfCollections } from "@shared/models/page.model";
import { InvoiceFilterColumns, InvoiceRecord, InvoicesFilterState } from '../interfaces';
import { InvoicesTableFiltersColumns } from '../enums/invoices.enum';

export interface InvoicesModel {
  invoicesData: PageOfCollections<InvoiceRecord> | null;
  invoicesFilters: InvoicesFilterState | null;
  invoiceFiltersColumns: InvoiceFilterColumns;
  isInvoiceDetailDialogOpen: boolean;
  selectedInvoiceId: number | null;
  prevInvoiceId: string | null;
  nextInvoiceId: string | null;
}
