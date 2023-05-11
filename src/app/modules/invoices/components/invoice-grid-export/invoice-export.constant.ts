import { formatDate } from '@angular/common';

import { AgencyInvoicesGridTab, InvoiceState, OrganizationInvoicesGridTab } from '../../enums';
import { ExportColumn } from '@shared/models/export.model';
import { AGENCY_INVOICE_TABS, ORGANIZATION_INVOICE_TABS } from '../../constants';
import { InvoicesTabItem } from '../../interfaces';

export const OrganizationTabsToExport: OrganizationInvoicesGridTab[] = [
  OrganizationInvoicesGridTab.PendingApproval,
  OrganizationInvoicesGridTab.PendingPayment,
  OrganizationInvoicesGridTab.Paid,
  OrganizationInvoicesGridTab.All,
];

export const AgencyTabsToExport: AgencyInvoicesGridTab[] = [AgencyInvoicesGridTab.All];

export const InvoiceExportCols : ExportColumn[] = [
  { text:'Invoice ID', column: 'invoiceId' },
  { text:'Location Name', column: 'locationName' },
  { text:'Week', column: 'week' },
  { text:'Time In', column: 'timeIn' },
  { text:'Time Out', column: 'timeOut' },
  { text:'Bill Rate Type / Expenses Code Reason', column: 'billRateTypeCodeReason' },
  { text:'Cost Centre', column: 'costCenter' },
  { text:'Job ID', column: 'jobId' },
  { text:'Candidate Name', column: 'candidateName' },
  { text:'Agency', column: 'agency' },
  { text:'Skill', column: 'skill' },
  { text:'Hours / Miles', column: 'hoursMiles' },
  { text:'Bill Rate', column: 'billRate' },
  { text:'Total', column: 'total' },
];

export const GetTabLists = (isAgency: boolean): InvoicesTabItem[] => {
  return isAgency ? AGENCY_INVOICE_TABS : ORGANIZATION_INVOICE_TABS;
};

export const GetTabsToExport = (isAgency: boolean): number[] => {
  return isAgency ? AgencyTabsToExport : OrganizationTabsToExport;
};

export const GetExportFileName = (isAgency: boolean, tabIndex: number): string => {
  const tabLists = GetTabLists(isAgency);
  return `${tabLists[tabIndex].title} ${formatDate(Date.now(), 'MM/dd/yyyy HH:mm', 'en-US')}`;
};

export const GetInvoiceState = (isAgency: boolean, tab: OrganizationInvoicesGridTab) => {
  return isAgency ? null : getOrgInvoiceState(tab);
};

export const getOrgInvoiceState = (tab: OrganizationInvoicesGridTab): InvoiceState | null  => {
  switch (tab) {
    case OrganizationInvoicesGridTab.PendingApproval:
      return InvoiceState.SubmittedPendingApproval;
    case OrganizationInvoicesGridTab.PendingPayment:
      return InvoiceState.PendingPayment;
    case OrganizationInvoicesGridTab.Paid:
      return InvoiceState.Paid;
    case OrganizationInvoicesGridTab.All:
      return null;
    default:
      return null;
  }
};
