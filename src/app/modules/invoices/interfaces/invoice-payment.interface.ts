export interface InvoicePayment {
  id: number;
  invoiceId: number;
  checkId: number;
  organizationId: number;
  checkNumber: string;
  checkDate: string;
  checkAmount: number;
  burnRate: number;
}

export interface InvoicePaymentGetParams {
  InvoiceId: number;
  OrganizationId: number;
  AgencySuffix: string;
}
