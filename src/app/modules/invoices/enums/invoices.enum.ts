export enum INVOICES_STATUSES {
  SUBMITED_PEND_APPR = 'submited pend appr',
  PENDING_APPROVAL = 'pending approval',
  PENDING_PAYMENT = 'pending payment',
  PAID = 'paid',
}

export enum INVOICES_ACTIONS {
  GET = '[invoices] GET',
  TOGGLE_INVOICE_DIALOG = '[invoices] TOGGLE INVOICE DIALOG',
  ToggleManualInvoice = '[invoices] toggle manual invoice dialog',
  UPDATE_FILTERS_STATE = '[invoices] UPDATE FILTERS STATE',
  RESET_FILTERS_STATE = '[invoices] RESET FILTERS STATE',
  GET_FILTERS_DATA_SOURCE = '[invoices] GET FILTERS DATA SOURCE',
  SET_FILTERS_DATA_SOURCE = '[invoices] SET FILTERS DATA SOURCE',
  GetReasons = '[invoices] Get reasons for manual invoices',
  GetMeta = '[invoices] Get manual invoice metadata',
  SaveManualinvoice = '[invoices] Save manual invoice',
  GetOrganizations = '[invoices] Get organizations',
  GetOrganizationStructure = '[invoices] Get organization structure',
  SelectOrganization = '[invoices] Select another organization',
}

export enum InvoicesTableFiltersColumns {
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
