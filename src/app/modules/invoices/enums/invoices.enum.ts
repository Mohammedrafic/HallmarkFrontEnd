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
}

export enum InvoicesTableFiltersColumns {
  SearchTerm = 'searchTerm',
  StatusIds = 'statusIds',
  OrderBy = 'orderBy',
  PageNumber = 'pageNumber',
  PageSize = 'pageSize',
  OrderIds = 'orderIds',
  LocationIds = 'locationIds',
  RegionsIds = 'regionsIds',
  DepartmentIds = 'departmentIds',
  AgencyIds = 'agencyIds',
  SkillIds = 'skillIds',
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
