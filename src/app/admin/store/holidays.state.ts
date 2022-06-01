import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Holiday, HolidaysPage } from '@shared/models/holiday.model';
import { HolidaysService } from '@shared/services/holidays.service';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { catchError, Observable, of, tap } from "rxjs";

import { RECORD_ADDED, RECORD_MODIFIED } from "src/app/shared/constants/messages";
import { MessageTypes } from "src/app/shared/enums/message-types";
import { ShowToast } from "src/app/store/app.actions";
import { DeleteHoliday, DeleteHolidaySucceeded, ExportHolidays, FilterChanged, GetHolidaysByPage, SaveHoliday, SaveHolidaySucceeded, SetYearFilter } from './holidays.actions';

export interface HolidaysStateModel {
  isHolidayLoading: boolean;
  holidaysPage: HolidaysPage | null;
  year: number | string | null;
}

@State<HolidaysStateModel>({
  name: 'holidays',
  defaults: {
    holidaysPage: null,
    isHolidayLoading: false,
    year: null
  },
})
@Injectable()
export class HolidaysState {

  @Selector()
  static holidaysPage(state: HolidaysStateModel): HolidaysPage | null { return state.holidaysPage; }

  @Selector()
  static isHolidayLoading(state: HolidaysStateModel): boolean { return state.isHolidayLoading; }

  @Selector()
  static year(state: HolidaysStateModel): number | string | null { return state.year; }

  constructor(private holidaysService: HolidaysService) { }

  @Action(SetYearFilter)
  SetYearFilter({ patchState, dispatch }: StateContext<HolidaysStateModel>, { payload }: SetYearFilter): Observable<void> {
    patchState({ year: payload });
    return dispatch(new FilterChanged());
  }

  @Action(GetHolidaysByPage)
  GetHolidaysByPage({ patchState, getState }: StateContext<HolidaysStateModel>, { pageNumber, pageSize }: GetHolidaysByPage): Observable<HolidaysPage> {
    patchState({ isHolidayLoading: true });
    return this.holidaysService.getHolidays(pageNumber, pageSize, { year: getState().year as number}).pipe(
      tap((payload) => {
        patchState({ isHolidayLoading: false, holidaysPage: payload });
        return payload;
      })
    );
  }

  @Action(SaveHoliday)
  SaveHoliday({ patchState, dispatch }: StateContext<HolidaysStateModel>, { payload }: SaveHoliday): Observable<Holiday | void> {
    patchState({ isHolidayLoading: true });
    return this.holidaysService.saveUpdateHoliday(payload).pipe(
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
    return this.holidaysService.removeHoliday(payload).pipe(tap((payload) => {
        patchState({ isHolidayLoading: false });
        dispatch(new DeleteHolidaySucceeded(payload));
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Holiday cannot be deleted')))));
  }

  @Action(ExportHolidays)
  ExportHolidays({ }: StateContext<HolidaysStateModel>, { payload }: ExportHolidays): Observable<any> {
    return this.holidaysService.export(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };
}
