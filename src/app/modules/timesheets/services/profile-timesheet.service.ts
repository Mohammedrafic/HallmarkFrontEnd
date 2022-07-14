import { Injectable } from '@angular/core';

import { Store } from '@ngxs/store';
import { merge, Observable } from 'rxjs';

import { TimesheetDetails } from './../store/actions/timesheet-details.actions';

@Injectable()
export class ProfileTimesheetService {
  constructor(
    private store: Store,
    ) {
  }

  public getCandidateData(id: number): Observable<any> {
    return merge([
      this.store.dispatch(new TimesheetDetails.GetCandidateInfo(id)),
      this.store.dispatch(new TimesheetDetails.GetCandidateChartData(id)),
      this.store.dispatch(new TimesheetDetails.GetCandidateAttachments(id)),
      this.store.dispatch(new TimesheetDetails.GetTimesheetRecords(id)),
      this.store.dispatch(new TimesheetDetails.GetCandidateInvoices(id)),
    ]);
  }
}
