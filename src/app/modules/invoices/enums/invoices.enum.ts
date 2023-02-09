export enum INVOICES_STATUSES {
  SUBMITED_PEND_APPR = 'submitted pend appr',
  PENDING_APPROVAL = 'pending approval',
  PENDING_PAYMENT = 'pending payment',
  PAID = 'paid',
}

export enum InvoicesActionBtn {
  Approve = 'Approve',
  Pay = 'Pay',
}

export enum INVOICES_ACTIONS {
  GET = '[invoices] GET',
  GET_MANUAL_INVOICES = '[invoices] GET MANUAL INVOICES',
  DETAIL_EXPORT = '[invoices] DETAIL EXPORT',
  GET_PENDING_INVOICES = '[invoices] GET PENDING INVOICES',
  GET_PENDING_APPROVAL = '[invoices] GET PENDING APPROVAL',
  TOGGLE_INVOICE_DIALOG = '[invoices] TOGGLE INVOICE DIALOG',
  ToggleManualInvoice = '[invoices] toggle manual invoice dialog',
  UPDATE_FILTERS_STATE = '[invoices] UPDATE FILTERS STATE',
  RESET_FILTERS_STATE = '[invoices] RESET FILTERS STATE',
  GET_FILTERS_DATA_SOURCE = '[invoices] GET FILTERS DATA SOURCE',
  GET_PENDING_RECORDS_FILTERS_DATA_SOURCE = '[invoices] GET PENDING RECORDS FILTERS DATA SOURCE',
  SET_FILTERS_DATA_SOURCE = '[invoices] SET FILTERS DATA SOURCE',
  GetReasons = '[invoices] Get reasons for manual invoices',
  GetMeta = '[invoices] Get manual invoice metadata',
  SaveManualinvoice = '[invoices] Save manual invoice',
  UpdateManualInvoice = '[invoices] Update manual invoice',
  DeleteManualInvoice = '[invoices] Delete manual invoice',
  GetOrganizations = '[invoices] Get organizations',
  GetOrganizationStructure = '[invoices] Get organization structure',
  SelectOrganization = '[invoices] Select another organization',
  ClearManInvoiceAttachments = '[invoices] clear manual invoice attachments',
  ApproveInvoice = '[invoices] Approve Invoice',
  ApproveInvoices = '[invoices] Approve Invoices',
  SubmitInvoice = '[invoices] Submit Invoice',
  RejectInvoice = '[invoices] Reject Invoice',
  DownloadAttachment = '[invoices] Download Attachment',
  DownloadMilesAttachment = '[invoices] Download Miles Attachment',
  DeleteAttachment = '[invoices] Delete Attachment',
  OpenRejectReasonDialog = '[invoices] Open Reject Reason Dialog',
  PreviewAttachment = '[invoices] Preview Attachment',
  PreviewMilesAttachment = '[invoices] Preview Miles Attachment',
  GroupInvoices = '[invoices] Group Invoices',
  ApprovePendingApprovalInvoice = '[invoices] Approve Pending Payment Invoice',
  GetPrintingData = '[invoices] Get printing data',
  GetAllInvoices ='[invoices] Get invoices with all statuses',
  SetIsAgency = '[invoices] Set is agency state',
  SetPermissions = '[invoices] Set permissions',
  SetTabIndex = '[invoices] set tab index',
  GetPaymentDetails = '[invoices] get payment details',
  SavePayment = '[invoices] save payment',
  OpenAddPaymentDialog = '[invoices] open add payment dialog',
  ExportInvoices = '[invoices] export invoices',
  GetManualInvoiceRecordsFilterDataSource = '[invoices] Get manual invoice records filters data source',
}

export enum InvoicesTableFiltersColumns {
  OrderBy = 'orderBy',
  SearchTerm = 'searchTerm',
  PageNumber = 'pageNumber',
  PageSize = 'pageSize',
  OrganizationId = 'organizationId',
  InvoiceState = 'invoiceState',
  AmountFrom = 'amountFrom',
  AmountTo = 'amountTo',
  StatusIds = 'statusIds',
  ApDelivery = 'apDelivery',
  AggregateByType = 'aggregateByType',
  InvoiceIds = 'invoiceIds',
  FormattedInvoiceIds = 'formattedInvoiceIds',
  AgencyIds = 'agencyIds',
  IssueDateFrom = 'issueDateFrom',
  IssueDateTo = 'issueDateTo',
  DueDateFrom = 'dueDateFrom',
  DueDateTo = 'dueDateTo',
  PaidDateFrom = 'paidDateFrom',
  PaidDateTo = 'paidDateTo',

  // Keys for Pending Invoices Records
  OrderIds = 'orderIds',
  TimesheetType = 'timesheetType',
  RegionIds = 'regionIds',
  LocationIds = 'locationIds',
  DepartmentIds = 'departmentIds',
  SkillIds = 'skillIds',
  WeekPeriodFrom = 'weekPeriodFrom',
  WeekPeriodTo = 'weekPeriodTo',

  // Keys for Manual Invoice Pending
  OrderId = 'orderId',
  ServiceDateFrom = 'serviceDateFrom',
  ServiceDateTo = 'serviceDateTo',
  VendorFee = 'vendorFee',
  ReasonCodeIds = 'reasonCodeIds',
  CandidateName = 'candidateName'
}

export enum FilteringInvoicesOptionsFields {
  Agency = 'agency',
  ApDelivery = 'apDelivery',
  AggregateByType = 'aggregateByType',
  InvoiceStates = 'invoiceStates',
}

export enum FilteringPendingInvoiceRecordsOptionsFields {
  Types = 'types',
  Skills = 'skills',
  Agency = 'agency',
  Regions = 'regions',
  Locations = 'locations',
  Departments = 'departments',
}

export enum FilteringManualPendingInvoiceRecordsOptionsFields {
  Agency = 'agency',
  InvoiceStates = 'invoiceStates',
  Reasons = 'reasons',
  VendorFee = 'vendorFee',
  Skills = 'skills',
  Regions = 'regions',
  Locations = 'locations',
  Departments = 'departments',
}

export enum InvoicesOrgTabId {
  PendingInvoiceRecords,
  ManualInvoicePending,
  PendingApproval,
  PendingPayment,
  Paid,
  AllInvoices,
}

export enum InvoicesAgencyTabId {
  ManualInvoicePending = 6,
  AllInvoices,
}

export enum PermissionCodes {
  AgencyCanPay = 3201,
}

export enum PaymentMode {
  Check,
  Electronic,
}

export enum PaymentDialogTitle {
  Add = 'Add',
  Edit = 'Edit',
}

export enum VendorFee {
  No = 1,
  Yes = 2,
  All = 3,
}
