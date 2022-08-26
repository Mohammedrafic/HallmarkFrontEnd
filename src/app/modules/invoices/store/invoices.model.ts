import { DataSourceItem } from '@core/interface';
import { PageOfCollections } from '@shared/models/page.model';
import {
  BaseInvoice,
  InvoiceFilterColumns,
  InvoiceRecord,
  InvoicesFilterState,
  ManualInvoiceMeta,
  ManualInvoiceReason,
  ManualInvoicesData,
  PrintInvoiceData
} from '../interfaces';
import { OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { PendingInvoicesData } from '../interfaces/pending-invoice-record.interface';
import { PendingApprovalInvoicesData } from '../interfaces/pending-approval-invoice.interface';

export interface InvoicesModel {
  invoicesData: PageOfCollections<InvoiceRecord> | null;
  manualInvoicesData: ManualInvoicesData | null;
  pendingInvoicesData: PendingInvoicesData | null;
  pendingApprovalInvoicesData: PendingApprovalInvoicesData | null;
  pendingPaymentInvoicesData: PendingApprovalInvoicesData | null;
  invoicesContainerData: PageOfCollections<BaseInvoice> | null;
  invoicesFilters: InvoicesFilterState | null;
  invoiceFiltersColumns: InvoiceFilterColumns;
  isInvoiceDetailDialogOpen: boolean;
  selectedInvoiceId: number | null;
  prevInvoiceId: string | null;
  nextInvoiceId: string | null;
  invoiceReasons: ManualInvoiceReason[];
  invoiceMeta: ManualInvoiceMeta[];
  organizations: DataSourceItem[];
  organizationLocations: OrganizationLocation[];
  selectedOrganizationId: number;
  regions: OrganizationRegion[];
  printData: PrintInvoiceData[];
}
