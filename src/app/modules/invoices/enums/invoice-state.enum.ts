export enum InvoiceState {
  PendingRecords = 0,
  SubmittedPendingApproval = 1,
  PendingPayment = 2,
  Paid = 3,
  ShortPaid = 4,
  OverPaid = 5
}
