import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import {
  DeletePayRatesById,
  ShowConfirmationPopUp,
  ExportPayRateSetup,
  SaveUpdatePayRate,
  SaveUpdatePayRateSucceed,
  GetPayRates,
} from '@organization-management/store/pay-rates.action';
import { PayRateService } from '@shared/services/pay-rates.service';
import {
  RECORD_ADDED, RECORD_ALREADY_EXISTS,
  RECORD_CANNOT_BE_DELETED,
  RECORD_CANNOT_BE_SAVED,
  RECORD_CANNOT_BE_UPDATED,
  RECORD_DELETE,
  RECORD_MODIFIED
} from '@shared/constants';
import { getAllErrors } from '@shared/utils/error.utils';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { DateTimeHelper } from '@core/helpers';
import { PayRateSetup, PayRateSetupPage } from '@shared/models/pay-rate.model';

export interface PayRateStateModel {
  payRatesPage: PayRateSetupPage | null
}

@State<PayRateStateModel>({
  name: 'payrates',
  defaults: {
    payRatesPage: null
  }
})
@Injectable()
export class PayRatesState {

  @Selector()
  static payRatesPage(state: PayRateStateModel): PayRateSetupPage | null { return state.payRatesPage; }

  constructor(private payRateService: PayRateService) {}

  @Action(GetPayRates)
  GetPayRates({ patchState }: StateContext<PayRateStateModel>, { filter }: GetPayRates): Observable<PayRateSetupPage> {
    return this.payRateService.getPayRates(filter).pipe(tap((payload) => {
      patchState({ payRatesPage: payload });
      return payload;
    }));
  }

   @Action(SaveUpdatePayRate)
  SaveUpdatePayRate({ dispatch }: StateContext<PayRateStateModel>, { payload, filters }: SaveUpdatePayRate): Observable<PayRateSetup[] | void> {
    payload.effectiveDate = DateTimeHelper.toUtcFormat(payload.effectiveDate);
    return this.payRateService.saveUpdatePayRate(payload)
      .pipe(tap((payloadResponse) => {
          if (payload.payRateSettingId) {
            dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
          } else {
            dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
          }
          dispatch(new GetPayRates(filters));
          dispatch(new SaveUpdatePayRateSucceed());
          return payloadResponse;
        }),
        catchError((error: any) => {
          if (payload.payRateSettingId) {
            if (error.error && error.error.errors && error.error.errors.ForceUpsert) {
              return dispatch(new ShowConfirmationPopUp());
            } else {
              return dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_UPDATED));
            }
          } else {
            if (error.error && error.error.errors && error.error.errors.ForceUpsert) {
              return dispatch(new ShowConfirmationPopUp());
            } else {
              return dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_SAVED));
            }
          }
        })
      );
  }


  @Action(DeletePayRatesById)
  DeletePayRatesById({ dispatch }: StateContext<PayRateStateModel>, { payload, filters }: DeletePayRatesById): Observable<void> {
    return this.payRateService.removePayRateById(payload).pipe(tap(() => {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
        dispatch(new GetPayRates(filters));
        return payload;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_DELETED))));
  }

  @Action(ExportPayRateSetup)
  ExportPayRateSetup({ }: StateContext<PayRateStateModel>, { payload }: ExportPayRateSetup): Observable<any> {
    return this.payRateService.exportPayRateSetup(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };

 
}