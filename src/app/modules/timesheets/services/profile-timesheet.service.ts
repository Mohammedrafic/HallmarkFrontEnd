import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { merge, Observable } from 'rxjs';

import { endTimeValidator, startTimeValidator } from '@shared/validators/date.validator';
import { TimesheetDetails } from './../store/actions/timesheet-details.actions';

@Injectable()
export class ProfileTimesheetService {
  constructor(
    private fb: FormBuilder,
    private store: Store,
    ) {
  }

  public populateForm(data: any): FormGroup {
    const group = this.fb.group({
      timeIn: [new Date(data.timeIn), [Validators.required]],
      timeOut: [new Date(data.timeOut), [Validators.required]],
      category: [data.category, [Validators.required]],
      costCenter: [data.costCenter, []],
      hours: [{ value: data.hours, disabled: true}]
    });

    group.get('timeIn')?.addValidators(startTimeValidator(group, 'timeOut'));
    group.get('timeOut')?.addValidators(endTimeValidator(group, 'timeIn'));

    return group;
  }

  public getCandidateData(id: number): Observable<any> {
    return merge([
      this.store.dispatch(new TimesheetDetails.GetCandidateInfo(id)),
      this.store.dispatch(new TimesheetDetails.GetCandidateChartData(id)),
      this.store.dispatch(new TimesheetDetails.GetCandidateAttachments(id)),
      this.store.dispatch(new TimesheetDetails.GetTimesheetRecords(id)),
    ]);
  }
}
