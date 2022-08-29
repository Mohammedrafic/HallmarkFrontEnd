import { CommonDialogConformMessages } from '@core/interface'

export const ConfirmDeleteTimesheetDialogContent = `You have selected DNW.<br/>
              Timesheet for the week will be deleted.<br/>
            <div style="margin-top: 30px;">Are you sure you want to proceed?<div/>
`
export const TimesheetConfirmMessages: CommonDialogConformMessages = {
  confirmUnsavedChages: 'Are you sure you want to close timesheet without saving changes?',
  confirmTabChange: 'Are you sure you want to change tab without saving changes?',
  confirmAddFormCancel: 'Are you sure you want to exit without saving changes?',
  confirmRecordDelete: 'Are you sure you want to delete this record?',
  confirmOrderChange: 'Are you sure you want to change timesheet without saving changes?',
  confirmEdit: 'Are you sure you want to change the timesheet? This will lead to recalculating values and generating new invoice records.'
}
