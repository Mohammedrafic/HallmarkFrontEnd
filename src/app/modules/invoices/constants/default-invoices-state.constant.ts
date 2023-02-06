import { InvoicesModel } from '../store/invoices.model';
import { InvoiceDefaultFilterColumns } from './invoices.constant';
import { InvoicesFilterState } from '../interfaces';
import { GRID_CONFIG } from '@shared/constants';

export const DefaultInvoicesState: InvoicesModel = {
  invoicesData: null,
  manualInvoicesData: null,
  pendingInvoicesData: null,
  pendingApprovalInvoicesData: null,
  pendingPaymentInvoicesData: null,
  invoicesContainerData: null,
  invoicesFilters: null,
  invoiceFiltersColumns: InvoiceDefaultFilterColumns,
  isInvoiceDetailDialogOpen: false,
  nextInvoiceId: null,
  prevInvoiceId: null,
  invoiceDetail: null,
  invoiceReasons: [],
  invoiceMeta: [],
  organizations: [],
  organizationLocations: [],
  selectedOrganizationId: 0,
  regions: [],
  printData: [],
  isAgencyArea: false,
  permissions: {
    agencyCanPay: false,
  },
  selectedTabIdx: 0,
  paymentDetails: [],
  selectedPayment: null,
  organizationStructure: null,
};

export const DefaultFiltersState: InvoicesFilterState = {
  pageNumber: GRID_CONFIG.initialPage,
  pageSize: GRID_CONFIG.initialRowsPerPage,
  organizationId: null,
};
