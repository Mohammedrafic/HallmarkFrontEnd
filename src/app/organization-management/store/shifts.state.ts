import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { militaryToStandard } from '@shared/utils/date-time.utils';
import { catchError, Observable, of, tap } from "rxjs";

import { RECORD_ADDED, RECORD_MODIFIED, usedByOrderErrorMessage } from "src/app/shared/constants/messages";
import { MessageTypes } from "src/app/shared/enums/message-types";
import { Shift, ShiftsPage } from 'src/app/shared/models/shift.model';
import { ShowToast } from "src/app/store/app.actions";
import { ShiftsService } from '@shared/services/shift.service';
import { DeleteShift, DeleteShiftSucceeded, ExportShifts, GetShiftsByPage, SaveShift, SaveShiftSucceeded } from './shifts.actions';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { getAllErrors } from '@shared/utils/error.utils';

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
  GetShiftsByPage({ patchState }: StateContext<ShiftsStateModel>,
    { pageNumber, pageSize }: GetShiftsByPage): Observable<ShiftsPage> {
    patchState({ isShiftLoading: true });
    return this.shiftsService.getShifts(pageNumber, pageSize).pipe(
      tap((payload) => {
        payload.items.map((val) => {
          val.standardStartTime = val.startTime.slice(0, val.startTime.length - 3);
          val.standardEndTime = val.endTime.slice(0, val.endTime.length - 3);
        });
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
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        dispatch(new SaveShiftSucceeded(payloadResponse));
        return payloadResponse;
      }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)))
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
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)))
      }));
  }

  @Action(ExportShifts)
  ExportShifts({ }: StateContext<ShiftsStateModel>, { payload }: ExportShifts): Observable<any> {
    return this.shiftsService.export(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };
}
