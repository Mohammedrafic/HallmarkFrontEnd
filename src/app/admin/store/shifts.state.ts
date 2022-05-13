import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, Observable, of, tap } from "rxjs";

import { RECORD_ADDED, RECORD_MODIFIED } from "src/app/shared/constants/messages";
import { MessageTypes } from "src/app/shared/enums/message-types";
import { Shift, ShiftsPage } from 'src/app/shared/models/shift.model';
import { ShowToast } from "src/app/store/app.actions";
import { ShiftsService } from '../services/shift.service';
import { DeleteShift, DeleteShiftSucceeded, GetShiftsByPage, SaveShift, SaveShiftSucceeded } from './shifts.actions';

export interface ShiftsStateModel {
  isShiftLoading: boolean;
  shiftsPage: ShiftsPage | null;
}

@State<ShiftsStateModel>({
  name: 'shifts',
  defaults: {
    shiftsPage: null,
    isShiftLoading: false,
  },
})
@Injectable()
export class ShiftsState {

  @Selector()
  static shiftsPage(state: ShiftsStateModel): ShiftsPage | null { return state.shiftsPage; }

  @Selector()
  static isShiftLoading(state: ShiftsStateModel): boolean { return state.isShiftLoading; }

  constructor(private shiftsService: ShiftsService) {}

  @Action(GetShiftsByPage)
  GetShiftsByPage({ patchState }: StateContext<ShiftsStateModel>, { pageNumber, pageSize }: GetShiftsByPage): Observable<ShiftsPage> {
    patchState({ isShiftLoading: true });
    return this.shiftsService.getShifts(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ isShiftLoading: false, shiftsPage: payload });
        return payload;
      })
    );
  }

  @Action(SaveShift)
  SaveShift({ patchState, dispatch }: StateContext<ShiftsStateModel>, { payload }: SaveShift): Observable<Shift | void> {
    patchState({ isShiftLoading: true });
    return this.shiftsService.saveUpdateShift(payload).pipe(
      tap((payloadResponse) => {
        patchState({ isShiftLoading: false });
        if (payload.id) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));``
        } else {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        dispatch(new SaveShiftSucceeded(payloadResponse));
        return payloadResponse;
      }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail))
      })
    );
  }

  @Action(DeleteShift)
  DeleteShift({ patchState, dispatch }: StateContext<ShiftsStateModel>, { payload }: DeleteShift): Observable<any> {
    patchState({ isShiftLoading: true });
    return this.shiftsService.removeShift(payload).pipe(tap((payload) => {
        patchState({ isShiftLoading: false });
        dispatch(new DeleteShiftSucceeded(payload));
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Shift cannot be deleted')))));
  }
}
