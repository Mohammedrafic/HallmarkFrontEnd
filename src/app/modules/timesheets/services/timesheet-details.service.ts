import { Injectable } from '@angular/core';

import { Store } from '@ngxs/store';
import { distinctUntilChanged, filter, Observable, skip, switchMap, take, tap } from 'rxjs';

import { ConfirmService } from '@shared/services/confirm.service';
import { MessageTypes } from '@shared/enums/message-types';
import { DateWeekService } from '@core/services';
import { approveTimesheetDialogData, submitTimesheetDialogData } from '../constants';
import { TimesheetDetails } from '../store/actions/timesheet-details.actions';
import { ShowToast } from '../../../store/app.actions';
import { Timesheets } from '../store/actions/timesheets.actions';


@Injectable()
export class TimesheetDetailsService {
  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private weekService: DateWeekService,
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

  public watchRangeStream(): Observable<[string, string]> {
    return this.weekService.getRangeStream()
    .pipe(
      skip(1),
      distinctUntilChanged((prev, next) => {
        return (prev[0] === next[0]) || (prev[1] === next[1]);
      }),
    )
  }

  public confirmTimesheetLeave(message: string): Observable<boolean> {
    return this.confirmService.confirm(message, {
      title: 'Unsaved Progress',
      okButtonLabel: 'Proceed',
      okButtonClass: 'delete-button',
    })
    .pipe(
      take(1),
      filter((submitted) => submitted)
    )
  }
}
