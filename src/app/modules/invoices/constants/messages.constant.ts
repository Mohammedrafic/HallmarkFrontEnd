import { CommonDialogConformMessages } from '@core/interface';

export const InvoiceConfirmMessages: CommonDialogConformMessages = {
  confirmUnsavedChages: 'Are you sure you want to close invoice without saving changes?',
  confirmTabChange: 'Are you sure you want to change tab without saving changes?',
  confirmAddFormCancel: 'Are you sure you want to exit without saving changes?',
  confirmRecordDelete: 'Are you sure you want to delete this record?',
  confirmOrderChange: 'Are you sure you want to change invoice without saving changes?',
  confirmEdit: 'Are you sure you want to change the timesheet? This will lead to recalculating values and generating new invoice records.',
  confirmBulkApprove: '',
  recalcTimesheets: '',
};

export const ManualInvoiceMessages = {
  successAdd: 'Manual invoice was created successfully',
  successEdit: 'Manual invoice was edited successfully',
  successDelete: 'Manual invoice was deleted successfully',
};
