import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, Observable, tap } from 'rxjs';

import { ManualInvoiceReasonsApiService } from '@shared/services/manual-invoice-reasons-api.service';
import { ManualInvoiceReasons } from '@admin/store/manual-invoice-reasons.actions';
import { ManualInvoiceReason, ManualInvoiceReasonPage } from '@shared/models/manual-invoice-reasons.model';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_DELETE, RECORD_MODIFIED } from '@shared/constants';
import { getAllErrors } from '@shared/utils/error.utils';

import { ShowToast } from '../../store/app.actions';

export interface ManualInvoiceReasonsModel {
  manualInvoiceReasons: ManualInvoiceReasonPage | null;
}

@State<ManualInvoiceReasonsModel>({
  name: 'manualInvoiceReasons',
  defaults: {
    manualInvoiceReasons: null,
  }
})
@Injectable()
export class ManualInvoiceReasonsState {
  constructor(private manualInvoiceReasonsApiService: ManualInvoiceReasonsApiService) {}

  @Selector([ManualInvoiceReasonsState])
  static manualInvoiceReasons(state: ManualInvoiceReasonsModel): ManualInvoiceReasonPage | null {
    return state.manualInvoiceReasons;
  }

  @Action(ManualInvoiceReasons.GetAll)
  GetAll(
    { patchState }: StateContext<ManualInvoiceReasonsModel>,
    { pageNumber, pageSize }: ManualInvoiceReasons.GetAll
  ): Observable<ManualInvoiceReasonPage> {
    return this.manualInvoiceReasonsApiService.getManualInvoiceReasonsByPage(pageNumber, pageSize).pipe(
      tap((payload) =>
        patchState({
          manualInvoiceReasons: payload
        })
      )
    );
  }

  @Action(ManualInvoiceReasons.Save)
  Save(
    { patchState, dispatch }: StateContext<ManualInvoiceReasonsModel>,
    { payload }: ManualInvoiceReasons.Save
  ): Observable<ManualInvoiceReason | void> {
    return this.manualInvoiceReasonsApiService.postManualInvoiceReason(payload).pipe(
      tap(() => {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        dispatch(new ManualInvoiceReasons.UpdateSuccess());
        dispatch(new ManualInvoiceReasons.SaveSuccess());
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new ManualInvoiceReasons.SaveError());

        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      }),
    );
  }

  @Action(ManualInvoiceReasons.Update)
  Update(
    { dispatch }: StateContext<ManualInvoiceReasonsModel>,
    { payload }: ManualInvoiceReasons.Update
  ): Observable<void> {
    return this.manualInvoiceReasonsApiService.updateManualInvoiceReason(payload).pipe(
      tap(() => {
        dispatch(new ManualInvoiceReasons.UpdateSuccess());
        dispatch(new ManualInvoiceReasons.SaveSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new ManualInvoiceReasons.SaveError());

        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(ManualInvoiceReasons.Remove)
  Remove(
    { dispatch }: StateContext<ManualInvoiceReasonsModel>,
    { id,businessUnitId }: ManualInvoiceReasons.Remove
  ): Observable<void> {
    return this.manualInvoiceReasonsApiService.removeManualInvoiceReason(id,businessUnitId).pipe(
      tap(() => {
        dispatch(new ManualInvoiceReasons.UpdateSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      }),
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }
}
