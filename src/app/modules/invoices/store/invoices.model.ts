import { PageOfCollections } from '@shared/models/page.model';
import {DropdownOption} from '@core/interface';
import {InvoiceFilterColumns, InvoiceRecord, InvoicesFilterState, ManualInvoiceMeta, ManualInvoiceReason} from '../interfaces';
import { InvoicesTableFiltersColumns } from '../enums/invoices.enum';

export interface InvoicesModel {
  invoicesData: PageOfCollections<InvoiceRecord> | null;
  invoicesFilters: InvoicesFilterState | null;
  invoiceFiltersColumns: InvoiceFilterColumns;
  isInvoiceDetailDialogOpen: boolean;
  selectedInvoiceId: number | null;
  prevInvoiceId: string | null;
  nextInvoiceId: string | null;
  invoiceReasons: ManualInvoiceReason[];
  invoiceMeta: ManualInvoiceMeta[];
  organizations: DropdownOption[];
}
