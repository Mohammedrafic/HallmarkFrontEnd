import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import {
  DeleteBillRatesById,
  GetBillRateOptions,
  GetBillRates,
  SaveUpdateBillRate, SaveUpdateBillRateSucceed
} from '@organization-management/store/bill-rates.actions';
import { BillRatesService } from '@shared/services/bill-rates.service';
import { RECORD_ADDED, RECORD_CANNOT_BE_SAVED, RECORD_CANNOT_BE_UPDATED, RECORD_MODIFIED } from '@shared/constants';
import { BillRateOption, BillRateSetup, BillRateSetupPage } from '@shared/models/bill-rate.model';

export interface BillRatesStateModel {
  billRatesPage: BillRateSetupPage | null,
  billRateOptions: BillRateOption[]
}

@State<BillRatesStateModel>({
  name: 'billrates',
  defaults: {
    billRatesPage: null,
    billRateOptions: []
  }
})
@Injectable()
export class BillRatesState {

  @Selector()
  static billRatesPage(state: BillRatesStateModel): BillRateSetupPage | null { return state.billRatesPage; }

  @Selector()
  static billRateOptions(state: BillRatesStateModel): any { return state.billRateOptions; }

  constructor(private billRatesService: BillRatesService) {}

  @Action(GetBillRates)
  GetBillRates({ patchState }: StateContext<BillRatesStateModel>, { filter }: GetBillRates): Observable<BillRateSetupPage> {
    return this.billRatesService.getBillRates(filter).pipe(tap((payload) => {
      patchState({ billRatesPage: payload });
      return payload;
    }));
  }

  @Action(SaveUpdateBillRate)
  SaveUpdateBillRate({ patchState, dispatch }: StateContext<BillRatesStateModel>, { payload, pageNumber, pageSize }: SaveUpdateBillRate): Observable<BillRateSetup[] | void> {
    return this.billRatesService.saveUpdateBillRate(payload)
      .pipe(tap((payloadResponse) => {
          if (payload.billRateSettingId) {
            dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
          } else {
            dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
          }
          dispatch(new GetBillRates({ pageNumber: pageNumber, pageSize: pageSize }));
          dispatch(new SaveUpdateBillRateSucceed());
          return payloadResponse;
        }),
        catchError((error: any) => {
          if (payload.billRateSettingId) {
            return dispatch(new ShowToast(MessageTypes.Error, error && error.error && error.error.detail ? error.error.detail : RECORD_CANNOT_BE_UPDATED));
          } else {
            return dispatch(new ShowToast(MessageTypes.Error, error && error.error && error.error.detail ? error.error.detail : RECORD_CANNOT_BE_SAVED))
          }
        })
      );
  }

  @Action(DeleteBillRatesById)
  DeleteBillRatesById({ patchState, dispatch }: StateContext<BillRatesStateModel>, { payload, pageNumber, pageSize }: DeleteBillRatesById): Observable<void> {
    return this.billRatesService.removeBillRateById(payload).pipe(tap(() => {
        dispatch(new GetBillRates({ pageNumber: pageNumber, pageSize: pageSize }));
        return payload;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail))));
  }

  @Action(GetBillRateOptions)
  GetBillRateOptions({ patchState }: StateContext<BillRatesStateModel>, { }: GetBillRateOptions): Observable<BillRateOption[]> {
    return this.billRatesService.getBillRateOptions().pipe(tap((payload) => {
      patchState({ billRateOptions: payload });
      return payload;
    }));
  }
}
