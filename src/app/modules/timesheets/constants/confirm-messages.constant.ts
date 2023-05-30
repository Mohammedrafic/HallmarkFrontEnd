import { CommonDialogConformMessages } from '@core/interface'

export const ConfirmDeleteTimesheetDialogContent = `You have selected DNW.<br/>
              Timesheet for the week will be deleted.<br/>
            <div style="margin-top: 30px;">Are you sure you want to proceed?<div/>
`

export const ConfirmApprovedTimesheetDeleteDialogContent = `Warning! This timesheet has been already approved.<br/>
              This action will lead to irrevocably removing all current entered records for the whole week.<br/>
            <div style="margin-top: 30px;">Are you sure the Candidate did not work on this week?<div/>
`;

export const TimesheetConfirmMessages: CommonDialogConformMessages = {
  confirmUnsavedChages: 'Are you sure you want to leave this page without saving?',
  confirmTabChange: 'Are you sure you want to change tab without saving changes?',
  confirmAddFormCancel: 'Are you sure you want to leave this page without saving?',
  confirmRecordDelete: 'Are you sure you want to delete this record?',
  confirmOrderChange: 'Are you sure you want to change timesheet without saving changes?',
  confirmEdit: 'Are you sure you want to change the timesheet? This will lead to recalculating values and generating new invoice records.',
  confirmBulkApprove: 'Please note, only timesheets in Pending Approval status may be Approved.',
  recalcTimesheets: 'Are you sure you want to recalculate all Timesheets for this Position? This may lead to generating new invoice records.',
};

export const BillRateTimeConfirm = 'You have reported hours for this date. Do you like to proceed?';
