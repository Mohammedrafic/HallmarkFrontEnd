import { RejectReason, RejectReasonPage } from "@shared/models/reject-reason.model";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { RejectReasonService } from "@shared/services/reject-reason.service";
import { catchError, Observable, tap } from "rxjs";
import {
  GetRejectReasonsMasterByPage,
  RemoveRejectMaterReasons,
  SaveRejectMasterReasons,
  SaveRejectMasterReasonsError,
  SaveRejectMasterReasonsSuccess,
  UpdateRejectMasterReasons,
  UpdateRejectMasterReasonsSuccess
} from "@admin/store/reject-reason-mater.action";
import { ShowToast } from "../../store/app.actions";
import { MessageTypes } from "@shared/enums/message-types";
import { RECORD_ADDED, RECORD_DELETE, RECORD_MODIFIED } from "@shared/constants";
import { HttpErrorResponse } from "@angular/common/http";
import { getAllErrors } from "@shared/utils/error.utils";

export interface RejectReasonStateModel {
  rejectReasonsPage: RejectReasonPage | null;
  isReasonLoading: boolean
}

@State<RejectReasonStateModel>({
  name: 'rejectReasonMaster',
  defaults: {
    rejectReasonsPage: null,
    isReasonLoading: false
  }
})
@Injectable()
export class RejectReasonMasterState {
  @Selector()
  static rejectReasonsPage(state: RejectReasonStateModel): RejectReasonPage | null {
    return state.rejectReasonsPage;
  }

  constructor(private rejectReasonService:RejectReasonService) {}

  @Action(GetRejectReasonsMasterByPage)
  GetRejectReasonsMasterByPage(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize }: GetRejectReasonsMasterByPage
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getRejectReasonsByPage(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({rejectReasonsPage: payload});
        return payload;
      })
    );
  }

  @Action(SaveRejectMasterReasons)
  SaveRejectMasterReasons(
    { patchState, getState, dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SaveRejectMasterReasons
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
        dispatch(new SaveRejectMasterReasonsSuccess());

        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveRejectMasterReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(UpdateRejectMasterReasons)
  UpdateRejectMasterReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { payload }: UpdateRejectMasterReasons
  ): Observable<void> {
    return this.rejectReasonService.updateRejectReason(payload).pipe(
      tap(() => {
        dispatch(new UpdateRejectMasterReasonsSuccess());
        dispatch(new SaveRejectMasterReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveRejectMasterReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveRejectMaterReasons)
  RemoveRejectMaterReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveRejectMaterReasons
  ): Observable<void> {
    return this.rejectReasonService.removeRejectReason(id).pipe(
      tap(() => {
        dispatch(new UpdateRejectMasterReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      })
    );
  }
}

