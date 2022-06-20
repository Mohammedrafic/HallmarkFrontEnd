import { Action, Selector, State, StateContext } from '@ngxs/store';
import { DEFAULT_TIMESHEETS_STATE, ITimesheet, TimesheetsModel } from '../model/timesheets.model';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TimesheetsApiService } from '../../services/timesheets-api.service';
import { Timesheets } from '../actions/timesheets.actions';

@State<TimesheetsModel>({
  name: 'timesheets',
  defaults: DEFAULT_TIMESHEETS_STATE
})
@Injectable()
export class TimesheetsState {
  constructor(private timesheetsService: TimesheetsApiService) {
  }

  @Selector([TimesheetsState])
  static timesheets(state: TimesheetsModel): ITimesheet[] {
    return state.timesheets;
  }

  @Action(Timesheets.GetAll)
  GetTimesheets({ patchState }: StateContext<TimesheetsModel>, {}: Timesheets.GetAll): Observable<ITimesheet[]> {
    const filters = {}; // pagination object

    return this.timesheetsService.getTimesheets(filters).pipe(tap((res) => patchState({
      timesheets: res,
    })));
  }
}
