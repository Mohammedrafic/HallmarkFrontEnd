import { DataSourceItem } from '@core/interface';
import { PageOfCollections } from '@shared/models/page.model';
import {
  BaseInvoice, InvoiceDetail,
  InvoiceFilterColumns,
  InvoicePayment,
  InvoicePaymentData,
  InvoicePermissions,
  InvoiceRecord,
  InvoicesFilterState,
  ManualInvoiceMeta,
  ManualInvoiceReason,
  ManualInvoicesData,
  PrintInvoiceData,
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
  invoiceDetail: InvoiceDetail | null;
  prevInvoiceId: number | null;
  nextInvoiceId: number | null;
  invoiceReasons: ManualInvoiceReason[];
  invoiceMeta: ManualInvoiceMeta[];
  organizations: DataSourceItem[];
  organizationLocations: OrganizationLocation[];
  selectedOrganizationId: number;
  regions: OrganizationRegion[];
  printData: PrintInvoiceData[];
  isAgencyArea: boolean;
  permissions: Partial<InvoicePermissions>;
  selectedTabIdx: number;
  paymentDetails: InvoicePayment[];
  selectedPayment: InvoicePaymentData | null;
}
