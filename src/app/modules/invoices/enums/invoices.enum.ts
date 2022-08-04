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
}
