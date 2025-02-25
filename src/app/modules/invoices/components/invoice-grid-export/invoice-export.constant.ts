import { formatDate } from '@angular/common';

import { AgencyInvoicesGridTab, InvoiceState, OrganizationInvoicesGridTab } from '../../enums';
import { ExportColumn } from '@shared/models/export.model';
import { AGENCY_INVOICE_TABS, ORGANIZATION_INVOICE_TABS } from '../../constants';
import { InvoicesTabItem } from '../../interfaces';

export const OrganizationTabsToExport: OrganizationInvoicesGridTab[] = [
  OrganizationInvoicesGridTab.PendingRecords,
  OrganizationInvoicesGridTab.PendingApproval,
  OrganizationInvoicesGridTab.PendingPayment,
  OrganizationInvoicesGridTab.Paid,
  OrganizationInvoicesGridTab.All,
  OrganizationInvoicesGridTab.Manual,
];

export const AgencyTabsToExport: AgencyInvoicesGridTab[] = [
  AgencyInvoicesGridTab.All,
AgencyInvoicesGridTab.Manual];

export const InvoiceExportCols : ExportColumn[] = [
  { text:'Invoice ID', column: 'invoiceId' },
  { text:'Issue Date', column:'IssueDate'},
  { text:'Location Name', column: 'locationName' },
  { text:'Week', column: 'week' },
  { text:'Time In', column: 'timeIn' },
  { text:'Time Out', column: 'timeOut' },
  { text:'Bill Rate Type / Expenses Code Reason', column: 'billRateTypeCodeReason' },
  { text:'Cost Center', column: 'costCenter' },
  { text:'Cost Center ID', column: 'costCenterId' },
  { text:'Job ID', column: 'jobId' },
  { text:'Candidate Name', column: 'candidateName' },
  { text:'Agency', column: 'agency' },
  { text:'Skill', column: 'skill' },
  { text:'Hours / Miles', column: 'hoursMiles' },
  { text:'Bill Rate', column: 'billRate' },
  { text:'Total', column: 'total' },
  { text:'Status', column: 'Status' },
  { text:'LocationID', column: 'LocationID' },
  { text:'Comment', column: 'Comment' },
];
export const AgencyManualInvoicePendingExportCols : ExportColumn[] = [
  { text:'Candidate Name', column: 'candidateFullName' },
  { text:'Status', column: 'status' },
  { text:'Location', column: 'locationName' },
  { text:'Order ID', column: 'formattedOrderIdFull' },
  { text:'Region', column: 'regionName' },
  { text:'Department', column: 'departmentName' },
  { text:'Skill', column: 'skillName' },
  { text:'Week Period', column: 'weekStartDate' },
  { text:'Vendor Fee Applied', column: 'vendorFeeApplicable' },
  { text:'Comment', column: 'comment' },
  { text:'Reason Code', column: 'reasonCode' },
  { text:'Reason For Rejection', column: 'rejectionReason' },
  { text:'Amount', column: 'amount' },
  { text:'Linked Invoice ID', column: 'linkedInvoiceId' },
  {text:'Organization Name',column:'organizationName'},
  { text:'Type', column: 'type' },
  { text:'Attachment', column: 'attachment' },

];
export const OrgManualInvoicePendingExportCols : ExportColumn[] = [
  { text:'Candidate Name', column: 'candidateFullName' },
  { text:'Status ', column: 'status' },
  { text:'Location', column: 'locationName' },
  { text:'Order ID', column: 'formattedOrderIdFull' },
  { text:'Region', column: 'regionName' },
  { text:'Department', column: 'departmentName' },
  { text:'Skill', column: 'skillName' },
  { text:'Week Period', column: 'weekStartDate' },
  { text:'Vendor Fee Applied', column: 'vendorFeeApplicable' },
  { text:'Comment', column: 'comment' },
  { text:'Reason Code', column: 'reasonCode' },
  { text:'Reason For Rejection', column: 'rejectionReason' },
  { text:'Amount', column: 'amount' },
  {text:'Agency',column:'agencyName'},
  { text:'Type', column: 'type' },
  { text:'Attachment', column: 'attachment' },

];

export const PendingInvoiceExportCols : ExportColumn[] = [
  { text:'Invoice ID', column: 'invoiceId' },
  { text:'Status', column: 'Status' },
  { text:'Location Name', column: 'locationName' },
  { text:'LocationID', column: 'LocationID' },
  { text:'Week', column: 'week' },
  { text:'Service Day', column: 'serviceDay' },
  { text:'Time In', column: 'timeIn' },
  { text:'Time Out', column: 'timeOut' },
  { text:'Cost Center', column: 'costCenter' },
  { text:'Cost Center ID', column: 'costCenterId' },
  { text:'Job ID', column: 'jobId' },
  { text:'Candidate Name', column: 'candidateName' },
  { text:'Agency', column: 'agency' },
  { text:'Skill', column: 'skill' },
  { text:'Hours / Miles', column: 'hoursMiles' },
  { text:'Bill Rate Type / Expenses Code Reason', column: 'billRateTypeCodeReason' },
  { text:'Bill Rate', column: 'billRate' },
  { text:'Amount', column: 'amount' },
  { text:'Comment', column: 'Comment' },
];

export const AgencyInvoiceExportCols : ExportColumn[] = [
  { text:'Invoice ID', column: 'invoiceId' },
  { text:'Issue Date', column:'IssueDate'},
  { text:'Location Name', column: 'locationName' },
  { text:'Week', column: 'week' },
  { text:'Time In', column: 'timeIn' },
  { text:'Time Out', column: 'timeOut' },
  { text:'Bill Rate Type / Expenses Code Reason', column: 'billRateTypeCodeReason' },
  { text:'Cost Center', column: 'costCenter' },
  { text:'Cost Center ID', column: 'costCenterId' },
  { text:'Job ID', column: 'jobId' },
  { text:'Candidate Name', column: 'candidateName' },
  { text:'Agency', column: 'agency' },
  { text:'Organization Name',column:'organizationName'},
  { text:'Skill', column: 'skill' },
  { text:'Hours / Miles', column: 'hoursMiles' },
  { text:'Bill Rate', column: 'billRate' },
  { text:'Total', column: 'total' },
  { text:'Status', column: 'Status' },
  { text:'LocationID', column: 'LocationID' },
  { text:'Comment', column: 'Comment' },
  { text:'Fee', column: 'Fee' },
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
    case OrganizationInvoicesGridTab.PendingRecords:
      return InvoiceState.PendingRecords;
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
