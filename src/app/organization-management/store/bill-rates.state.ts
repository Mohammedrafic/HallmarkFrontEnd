import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import {
  DeleteBillRatesById,
  DeleteBillRatesTypeById,
  GetBillRateOptions,
  ShowConfirmationPopUp,
  ExportBillRateSetup,
  GetBillRates,
  GetExternalBillRateType,
  SaveUpdateBillRate,
  SaveUpdateBillRateSucceed,
  SaveBillRateType,
  UpdateBillRateType,
  GetExternalBillRateMapping,
  DeleteBillRatesMappingById,
  SaveUpdateBillRateMapping,
  GetExternalBillRateMappingById,
  ExportExternalBillRate,
  ExportExternalBillRateMapping
} from '@organization-management/store/bill-rates.actions';
import { BillRatesService } from '@shared/services/bill-rates.service';
import {
  RECORD_ADDED, RECORD_ALREADY_EXISTS,
  RECORD_CANNOT_BE_DELETED,
  RECORD_CANNOT_BE_SAVED,
  RECORD_CANNOT_BE_UPDATED,
  RECORD_MODIFIED
} from '@shared/constants';
import {
  BillRateOption,
  BillRateSetup,
  BillRateSetupPage,
  ExternalBillRateTypePage,
  ExternalBillRateType,
  ExternalBillRateMappingPage, ExternalBillRateMapped
} from '@shared/models/bill-rate.model';
import { getAllErrors } from '@shared/utils/error.utils';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { DateTimeHelper } from '@core/helpers';

export interface BillRatesStateModel {
  billRatesPage: BillRateSetupPage | null,
  externalBillRateTypePage: ExternalBillRateTypePage | null,
  externalBillRateMappingPage: ExternalBillRateMappingPage | null,
  externalBillRateMapped: ExternalBillRateMapped[],
  billRateOptions: BillRateOption[]
}

@State<BillRatesStateModel>({
  name: 'billrates',
  defaults: {
    billRatesPage: null,
    externalBillRateTypePage: null,
    externalBillRateMappingPage: null,
    externalBillRateMapped: [],
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
  static externalBillRateMapping(state: BillRatesStateModel): ExternalBillRateMappingPage | null { return state.externalBillRateMappingPage; }

  @Selector()
  static externalBillRateMapped(state: BillRatesStateModel): ExternalBillRateMapped[] { return state.externalBillRateMapped; }

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

  @Action(GetExternalBillRateMapping)
  GetExternalBillRateMapping({ patchState }: StateContext<BillRatesStateModel>, { filter }: GetBillRates): Observable<ExternalBillRateMappingPage> {
    return this.billRatesService.getExternalBillRateMapping(filter).pipe(tap((payload) => {
      patchState({ externalBillRateMappingPage: payload });
      return payload;
    }));
  }

  @Action(GetExternalBillRateMappingById)
  GetExternalBillRateMappingById({ patchState }: StateContext<BillRatesStateModel>, {id}: { id: number }): Observable<ExternalBillRateMapped[]> {
    return this.billRatesService.getExternalBillRateMappingById(id).pipe(tap((payload) => {
      patchState({ externalBillRateMapped: payload });
      return payload;
    }));
  }

  @Action(SaveUpdateBillRate)
  SaveUpdateBillRate({ dispatch }: StateContext<BillRatesStateModel>, { payload, filters }: SaveUpdateBillRate): Observable<BillRateSetup[] | void> {
    payload.effectiveDate = DateTimeHelper.setUtcTimeZone(payload.effectiveDate);
    return this.billRatesService.saveUpdateBillRate(payload)
      .pipe(tap((payloadResponse) => {
          if (payload.billRateSettingId) {
            dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
          } else {
            dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
          }
          dispatch(new GetBillRates(filters));
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
          let message;
          if (error.status === 400) {
            message = RECORD_ALREADY_EXISTS;
          } else {
            message = error.error?.detail || RECORD_CANNOT_BE_SAVED;
          }
          return dispatch(new ShowToast(MessageTypes.Error, message))
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

  @Action(SaveUpdateBillRateMapping)
  SaveUpdateBillRateMapping(
    { patchState, dispatch }: StateContext<BillRatesStateModel>,
    { id, payload, pageNumber, pageSize }: SaveUpdateBillRateMapping,
  ): Observable<ExternalBillRateType | void> {
    return this.billRatesService.saveUpdateExternalBillRateMapping(id, payload)
      .pipe(
        tap(() => dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED))),
        tap((payloadResponse) => {
          dispatch(new GetExternalBillRateMapping({ pageNumber: pageNumber, pageSize: pageSize }));
          dispatch(new SaveUpdateBillRateSucceed());
          return payloadResponse;
        }),
        catchError((error: any) => {
          return dispatch(new ShowToast(MessageTypes.Error, error && error.error && error.error.detail ? error.error.detail : RECORD_CANNOT_BE_SAVED))
        }));
  }

  @Action(DeleteBillRatesById)
  DeleteBillRatesById({ dispatch }: StateContext<BillRatesStateModel>, { payload, filters }: DeleteBillRatesById): Observable<void> {
    return this.billRatesService.removeBillRateById(payload).pipe(tap(() => {
        dispatch(new GetBillRates(filters));
        return payload;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_DELETED))));
  }

  @Action(DeleteBillRatesTypeById)
  DeleteBillRatesTypeById({ dispatch }: StateContext<BillRatesStateModel>, { payload, pageNumber, pageSize }: DeleteBillRatesTypeById): Observable<void> {
    return this.billRatesService.removeExternalBillRateById(payload).pipe(tap(() => {
        dispatch(new GetExternalBillRateType({ pageNumber: pageNumber, pageSize: pageSize }));
        return payload;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail))));
  }

  @Action(DeleteBillRatesMappingById)
  DeleteBillRatesMappingById({ dispatch }: StateContext<BillRatesStateModel>, { payload, pageNumber, pageSize }: DeleteBillRatesMappingById): Observable<void> {
    return this.billRatesService.removeExternalBillRateMappingById(payload).pipe(tap(() => {
        dispatch(new GetExternalBillRateMapping({ pageNumber: pageNumber, pageSize: pageSize }));
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

  @Action(ExportExternalBillRate)
  ExportExternalBillRate({ }: StateContext<BillRatesStateModel>, { payload }: ExportExternalBillRate): Observable<any> {
    return this.billRatesService.exportExternalBillRate(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };

  @Action(ExportExternalBillRateMapping)
  ExportExternalBillRateMapping({ }: StateContext<BillRatesStateModel>, { payload }: ExportExternalBillRateMapping): Observable<any> {
    return this.billRatesService.exportExternalBillRateMapping(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };
}
