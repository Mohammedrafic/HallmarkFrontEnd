import { Injectable } from '@angular/core';

import { Observable, tap } from 'rxjs';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import {
  DEFAULT_TIMESHEETS_STATE,
  TimeSheetsPage,
  ProfileTimeSheetDetail,
  TimesheetsModel,
} from '../model/timesheets.model';
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

  @Selector([TimesheetsState])
  static profileTimesheets(state: TimesheetsModel): ProfileTimeSheetDetail[] {
    return state.profileTimesheets;
  }

  @Selector([TimesheetsState])
  static isProfileOpen(state: TimesheetsModel): boolean {
    return state.profileOpen;
  }

  @Action(Timesheets.GetAll)
  GetTimesheets({ patchState }: StateContext<TimesheetsModel>, { payload }: Timesheets.GetAll): Observable<TimeSheetsPage> {
    return this.timesheetsService.getTimesheets(payload).pipe(tap((res) => patchState({
      timesheets: res,
    })));
  }

  @Action(Timesheets.GetProfileTimesheets)
  GetProfileTimeSheets({ patchState }: StateContext<TimesheetsModel>): Observable<ProfileTimeSheetDetail[]> {
      return this.timesheetsService.getProfileTimesheets()
      .pipe(
        tap((data) => {
          patchState({
            profileTimesheets: data,
          });
        }),
      );
  }

  @Action(Timesheets.ToggleProfileDialog)
  toggleProfile({ patchState, getState }: StateContext<TimesheetsModel>): void {
    patchState({
      profileOpen: !getState().profileOpen,
    });
  }
}
