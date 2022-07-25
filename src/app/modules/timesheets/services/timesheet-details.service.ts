import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { ActivatedRoute } from '@angular/router';
import { ConfirmService } from '@shared/services/confirm.service';
import { filter, Observable, switchMap, take, tap } from 'rxjs';
import { approveTimesheetDialogData, submitTimesheetDialogData } from '../constants';
import { TimesheetDetails } from '../store/actions/timesheet-details.actions';
import { ShowToast } from '../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { Timesheets } from '../store/actions/timesheets.actions';

@Injectable()
export class TimesheetDetailsService {
  constructor(
    private store: Store,
    private confirmService: ConfirmService,
  ) { }

  public approveTimesheet(timesheetId: number): Observable<void> {
    const { title, submitButtonText, confirmMessage, successMessage } = approveTimesheetDialogData;

    return this.confirmService.confirm(confirmMessage, {
      title,
      okButtonLabel: submitButtonText,
      okButtonClass: 'delete-button'
    })
      .pipe(
        filter((submitted: boolean) => submitted),
        switchMap(() => this.store.dispatch(
          new TimesheetDetails.OrganizationApproveTimesheet(timesheetId, null))
        ),
        tap(() => {
          this.store.dispatch([
            new ShowToast(MessageTypes.Success, successMessage),
            new Timesheets.GetAll(),
          ]);
        })
      );
  }

  public submitTimesheet(timesheetId: number, orgId: number): Observable<void> {
    const { title, submitButtonText, confirmMessage, successMessage } = submitTimesheetDialogData;

    return this.confirmService.confirm(confirmMessage, {
      title,
      okButtonLabel: submitButtonText,
      okButtonClass: 'delete-button'
    })
      .pipe(
        filter((submitted: boolean) => submitted),
        switchMap(() => this.store.dispatch(
          new TimesheetDetails.AgencySubmitTimesheet(timesheetId, orgId))
        ),
        tap(() => {
          this.store.dispatch([
            new ShowToast(MessageTypes.Success, successMessage),
            new Timesheets.GetAll(),
          ]);
        })
      );
  }
}
