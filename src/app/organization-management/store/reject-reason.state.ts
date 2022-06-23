import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { RejectReasonService } from "@shared/services/reject-reason.service";
import {
  GetRejectReasonsByPage,
  RemoveRejectReasons,
  SaveRejectReasons, SaveRejectReasonsError, SaveRejectReasonsSuccess,
  UpdateRejectReasons, UpdateRejectReasonsSuccess
} from "@organization-management/store/reject-reason.actions";
import { catchError, Observable, tap } from "rxjs";
import { RejectReason, RejectReasonPage } from "@shared/models/reject-reason.model";
import { HttpErrorResponse } from "@angular/common/http";
import { ShowToast } from "../../store/app.actions";
import { MessageTypes } from "@shared/enums/message-types";
import { getAllErrors } from "@shared/utils/error.utils";

export interface RejectReasonStateModel {
  rejectReasonsPage: RejectReasonPage | null;
  isReasonLoading: boolean
}

@State<RejectReasonStateModel>({
  name: 'rejectReason',
  defaults: {
    rejectReasonsPage: null,
    isReasonLoading: false
  }
})
@Injectable()
export class RejectReasonState {
  @Selector()
  static rejectReasonsPage(state: RejectReasonStateModel): RejectReasonPage | null {
    return state.rejectReasonsPage;
  }

  constructor(private rejectReasonService:RejectReasonService) {}

  @Action(GetRejectReasonsByPage)
  GetRejectReasonsByPage(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize }: GetRejectReasonsByPage
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });
    
    return this.rejectReasonService.getRejectReasonsByPage(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({rejectReasonsPage: payload});
        return payload;
      })
    );
  }

  @Action(SaveRejectReasons)
  SaveRejectReasons(
    { patchState, getState, dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SaveRejectReasons
  ): Observable<RejectReason | void> {
    const state = getState();

    return this.rejectReasonService.saveRejectReasons(payload).pipe(
      tap(payload => {
        if(state.rejectReasonsPage){
          const items = [payload, ...state.rejectReasonsPage?.items];
          const rejectReasonsPage = { ...state.rejectReasonsPage, items };
          patchState({rejectReasonsPage});
        }
        dispatch(new SaveRejectReasonsSuccess());

        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveRejectReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveRejectReasons)
  RemoveRejectReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveRejectReasons
  ): Observable<void> {
    return this.rejectReasonService.removeRejectReason(id).pipe(
      tap(() => {
        dispatch(new UpdateRejectReasonsSuccess());
      })
    );
  }

  @Action(UpdateRejectReasons)
  UpdateRejectReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { payload }: UpdateRejectReasons
  ): Observable<void> {
    return this.rejectReasonService.updateRejectReason(payload).pipe(
      tap(() => {
        dispatch(new UpdateRejectReasonsSuccess());
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveRejectReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }
}
