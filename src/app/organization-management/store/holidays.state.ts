import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { OrganizationHoliday, OrganizationHolidaysPage } from '@shared/models/holiday.model';
import { HolidaysService } from '@shared/services/holidays.service';
import { catchError, Observable, of, tap } from "rxjs";

import { RECORD_ADDED, RECORD_MODIFIED } from "src/app/shared/constants/messages";
import { MessageTypes } from "src/app/shared/enums/message-types";
import { ShowToast } from "src/app/store/app.actions";
import { DeleteHoliday, DeleteHolidaySucceeded, GetHolidaysByPage, SaveHoliday, SaveHolidaySucceeded } from './holidays.actions';

export interface HolidaysStateModel {
  isHolidayLoading: boolean;
  holidaysPage: OrganizationHolidaysPage | null;
}

@State<HolidaysStateModel>({
  name: 'orgHolidays',
  defaults: {
    holidaysPage: null,
    isHolidayLoading: false,
  },
})
@Injectable()
export class HolidaysState {

  @Selector()
  static holidaysPage(state: HolidaysStateModel): OrganizationHolidaysPage | null { return state.holidaysPage; }

  @Selector()
  static isHolidayLoading(state: HolidaysStateModel): boolean { return state.isHolidayLoading; }

  constructor(private holidaysService: HolidaysService) { }

  @Action(GetHolidaysByPage)
  GetHolidaysByPage({ patchState }: StateContext<HolidaysStateModel>, { pageNumber, pageSize }: GetHolidaysByPage): Observable<OrganizationHolidaysPage> {
    patchState({ isHolidayLoading: true });
    return this.holidaysService.getOrganizationHolidays(pageNumber, pageSize, { year: 0}).pipe(
      tap((payload) => {
        patchState({ isHolidayLoading: false, holidaysPage: payload });
        return payload;
      })
    );
  }

  @Action(SaveHoliday)
  SaveHoliday({ patchState, dispatch }: StateContext<HolidaysStateModel>, { payload }: SaveHoliday): Observable<OrganizationHoliday | void> {
    patchState({ isHolidayLoading: true });
    return this.holidaysService.saveUpdateOrganizationHoliday(payload).pipe(
      tap((payloadResponse) => {
        patchState({ isHolidayLoading: false });
        if (payload.id) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        dispatch(new SaveHolidaySucceeded(payloadResponse));
        return payloadResponse;
      }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, 'Record already exists, please update Dates'))
      })
    );
  }

  @Action(DeleteHoliday)
  DeleteHoliday({ patchState, dispatch }: StateContext<HolidaysStateModel>, { payload }: DeleteHoliday): Observable<any> {
    patchState({ isHolidayLoading: true });
    return this.holidaysService.removeOrganizationHoliday(payload).pipe(tap((payload) => {
        patchState({ isHolidayLoading: false });
        dispatch(new DeleteHolidaySucceeded(payload));
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Holiday cannot be deleted')))));
  }
}
