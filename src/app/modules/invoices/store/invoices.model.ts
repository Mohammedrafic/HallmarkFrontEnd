import { DataSourceItem } from '@core/interface';
import { PageOfCollections } from '@shared/models/page.model';
import {
  BaseInvoice,
  InvoiceDetail,
  InvoiceFilterColumns,
  InvoicePayment,
  InvoicePaymentData,
  InvoicePermissions,
  InvoicesFilterState,
  ManualInvoiceMeta,
  ManualInvoiceReason,
  ManualInvoicesData,
  PendingApprovalInvoicesData,
  PendingInvoicesData,
  PrintInvoiceData,
} from '../interfaces';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';

export interface InvoicesModel {
  invoicesData: ManualInvoicesData | PendingInvoicesData | PendingApprovalInvoicesData | null;
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
  organizationStructure: OrganizationStructure | null;
  agencyFeeApplicable: boolean;
}
