import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';

import { Observable, tap } from 'rxjs';

import { TimesheetsModel, TimeSheetsPage } from '../model/timesheets.model';
import { TimesheetsApiService } from '../../services/timesheets-api.service';
import { Timesheets } from '../actions/timesheets.actions';
import { DEFAULT_TIMESHEETS_STATE } from '../../constants/timesheet-default-state.constant';

@State<TimesheetsModel>({
  name: 'timesheets',
  defaults: DEFAULT_TIMESHEETS_STATE
})
@Injectable()
export class TimesheetsState {
  constructor(private timesheetsService: TimesheetsApiService) {
  }

  @Selector([TimesheetsState])
  static timesheets(state: TimesheetsModel): TimeSheetsPage | null {
    return state.timesheets;
  }

  @Action(Timesheets.GetAll)
  GetTimesheets({ patchState }: StateContext<TimesheetsModel>, { payload }: Timesheets.GetAll): Observable<TimeSheetsPage> {
    return this.timesheetsService.getTimesheets(payload).pipe(tap((res) => patchState({
      timesheets: res,
    })));
  }
}
