export enum invoiceType {
  ByTimesheet=0,
  ByInvoice=1
}

export const invoiceTypeOptions = [
  { id: invoiceType.ByTimesheet, name: 'By Timesheet' },
  { id: invoiceType.ByInvoice, name: 'By Invoice' }
];
