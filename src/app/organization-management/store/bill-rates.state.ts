import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import {
  DeleteBillRatesById, DeleteBillRatesTypeById,
  GetBillRateOptions,
  ShowConfirmationPopUp,
  ExportBillRateSetup,
  GetBillRates, GetExternalBillRateType,
  SaveUpdateBillRate, SaveUpdateBillRateSucceed, SaveBillRateType, UpdateBillRateType
} from '@organization-management/store/bill-rates.actions';
import { BillRatesService } from '@shared/services/bill-rates.service';
import {
  RECORD_ADDED,
  RECORD_CANNOT_BE_DELETED,
  RECORD_CANNOT_BE_SAVED,
  RECORD_CANNOT_BE_UPDATED,
  RECORD_MODIFIED
} from '@shared/constants';
import {BillRateOption, BillRateSetup, BillRateSetupPage, ExternalBillRateTypePage, ExternalBillRateType} from '@shared/models/bill-rate.model';
import { getAllErrors } from '@shared/utils/error.utils';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';

export interface BillRatesStateModel {
  billRatesPage: BillRateSetupPage | null,
  externalBillRateTypePage: ExternalBillRateTypePage | null,
  billRateOptions: BillRateOption[]
}

@State<BillRatesStateModel>({
  name: 'billrates',
  defaults: {
    billRatesPage: null,
    externalBillRateTypePage: null,
    billRateOptions: []
  }
})
@Injectable()
export class BillRatesState {

  @Selector()
  static billRatesPage(state: BillRatesStateModel): BillRateSetupPage | null { return state.billRatesPage; }

  @Selector()
  static externalBillRateType(state: BillRatesStateModel): ExternalBillRateTypePage | null { return state.externalBillRateTypePage; }

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

  @Action(GetExternalBillRateType)
  GetBillRatesTypes({ patchState }: StateContext<BillRatesStateModel>, { filter }: GetBillRates): Observable<ExternalBillRateTypePage> {
    return this.billRatesService.getExternalBillRates(filter).pipe(tap((payload) => {
      patchState({ externalBillRateTypePage: payload });
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

  @Action(SaveBillRateType)
  SaveBillRateType(
    { patchState, dispatch }: StateContext<BillRatesStateModel>,
    { payload, pageNumber, pageSize }: SaveBillRateType,
  ): Observable<ExternalBillRateType | void> {
    return this.billRatesService.saveExternalBillRateType(payload)
      .pipe(
        tap(() => dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED))),
        tap((payloadResponse) => {
          dispatch(new GetExternalBillRateType({ pageNumber: pageNumber, pageSize: pageSize }));
          dispatch(new SaveUpdateBillRateSucceed());
          return payloadResponse;
        }),
        catchError((error: any) => {
          return dispatch(new ShowToast(MessageTypes.Error, error && error.error && error.error.detail ? error.error.detail : RECORD_CANNOT_BE_SAVED))
        }));
  }

  @Action(UpdateBillRateType)
  UpdateBillRateType(
    { patchState, dispatch }: StateContext<BillRatesStateModel>,
    { id, payload, pageNumber, pageSize }: UpdateBillRateType,
  ): Observable<ExternalBillRateType | void> {
    return this.billRatesService.updateExternalBillRateType(id, payload)
      .pipe(
        tap(() => dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED))),
        tap((payloadResponse) => {
          dispatch(new GetExternalBillRateType({ pageNumber: pageNumber, pageSize: pageSize }));
          dispatch(new SaveUpdateBillRateSucceed());
          return payloadResponse;
        }),
        catchError((error: any) => {
          return dispatch(new ShowToast(MessageTypes.Error, error && error.error && error.error.detail ? error.error.detail : RECORD_CANNOT_BE_UPDATED));
        }));
  }

  @Action(DeleteBillRatesById)
  DeleteBillRatesById({ patchState, dispatch }: StateContext<BillRatesStateModel>, { payload, pageNumber, pageSize }: DeleteBillRatesById): Observable<void> {
    return this.billRatesService.removeBillRateById(payload).pipe(tap(() => {
        dispatch(new GetBillRates({ pageNumber: pageNumber, pageSize: pageSize }));
        return payload;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_DELETED))));
  }

  @Action(DeleteBillRatesTypeById)
  DeleteBillRatesTypeById({ patchState, dispatch }: StateContext<BillRatesStateModel>, { payload, pageNumber, pageSize }: DeleteBillRatesById): Observable<void> {
    return this.billRatesService.removeExternalBillRateById(payload).pipe(tap(() => {
        dispatch(new GetExternalBillRateType({ pageNumber: pageNumber, pageSize: pageSize }));
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

  @Action(ExportBillRateSetup)
  ExportBillRateSetup({ }: StateContext<BillRatesStateModel>, { payload }: ExportBillRateSetup): Observable<any> {
    return this.billRatesService.exportBillRateSetup(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };
}
