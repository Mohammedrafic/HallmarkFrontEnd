import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { RejectReasonService } from "@shared/services/reject-reason.service";
import {
  GetClosureReasonsByPage,
  GetRejectReasonsByPage,
  RemoveClosureReasons,
  RemoveRejectReasons,
  SaveClosureReasons,
  SaveClosureReasonsError,
  SaveRejectReasons, SaveRejectReasonsError, SaveRejectReasonsSuccess,
  UpdateClosureReasonsSuccess,
  UpdateRejectReasons, UpdateRejectReasonsSuccess
} from "@organization-management/store/reject-reason.actions";
import { catchError, Observable, tap } from "rxjs";
import { RejectReason, RejectReasonPage } from "@shared/models/reject-reason.model";
import { HttpErrorResponse } from "@angular/common/http";
import { ShowToast } from "../../store/app.actions";
import { MessageTypes } from "@shared/enums/message-types";
import { getAllErrors } from "@shared/utils/error.utils";
import { RECORD_ADDED, RECORD_DELETE, RECORD_MODIFIED } from "@shared/constants";

export interface RejectReasonStateModel {
  rejectReasonsPage: RejectReasonPage | null;
  closureReasonsPage: RejectReasonPage | null;
  isReasonLoading: boolean
}

@State<RejectReasonStateModel>({
  name: 'rejectReason',
  defaults: {
    rejectReasonsPage: null,
    closureReasonsPage: null,
    isReasonLoading: false
  }
})
@Injectable()
export class RejectReasonState {
  @Selector()
  static rejectReasonsPage(state: RejectReasonStateModel): RejectReasonPage | null {
    return state.rejectReasonsPage;
  }

  @Selector()
  static closureReasonsPage(state: RejectReasonStateModel): RejectReasonPage | null {
    return state.closureReasonsPage;
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
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
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
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
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
        dispatch(new SaveRejectReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveRejectReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveClosureReasons)
  RemoveClosureReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveClosureReasons
  ): Observable<void> {
    return this.rejectReasonService.removeClosureReason(id).pipe(
      tap(() => {
        dispatch(new UpdateClosureReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      })
    );
  }

  @Action(GetClosureReasonsByPage)
  GetClosureReasonsByPage(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize, orderBy }: GetClosureReasonsByPage
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getClosureReasonsByPage(pageNumber, pageSize, orderBy).pipe(
      tap((payload) => {
        patchState({closureReasonsPage: payload});
        return payload;
      })
    );
  }

  @Action(SaveClosureReasons)
  SaveClosureReasons(
    { dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SaveClosureReasons
  ): Observable<RejectReason | void> {
    return this.rejectReasonService.saveClosureReasons(payload).pipe(
      tap(payload => {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        dispatch(new UpdateClosureReasonsSuccess());
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveClosureReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }
}
