import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { catchError, Observable, tap } from "rxjs";
import { ShowToast } from "../../store/app.actions";
import { MessageTypes } from "@shared/enums/message-types";
import { RECORD_ADDED, RECORD_DELETE, RECORD_MODIFIED } from "@shared/constants";
import { HttpErrorResponse } from "@angular/common/http";
import { getAllErrors } from "@shared/utils/error.utils";
import { MasterCommitment, MasterCommitmentsPage } from "@shared/models/commitment.model";
import { CommitmentService } from "@shared/services/commitment.service";
import { GetCommitmentByPage, RemoveCommitment, SaveCommitment, SaveCommitmentError, SaveCommitmentSuccess, UpdateCommitmentSuccess } from "./commitment.actions";

export interface CommitmentStateModel {
  commitmentsPage: MasterCommitmentsPage | null;
  isCommitmentLoading: boolean;
}

@State<CommitmentStateModel>({
  name: 'masterCommitment',
  defaults: {
    commitmentsPage: null,
    isCommitmentLoading: false
  }
})
@Injectable()
export class MasterCommitmentState {
  @Selector()
  static commitmentsPage(state: CommitmentStateModel): MasterCommitmentsPage | null {
    return state.commitmentsPage;
  }

  constructor(private commitmentService: CommitmentService) {}

  @Action(GetCommitmentByPage)
  GetCommitmentByPage(
    { patchState }: StateContext<CommitmentStateModel>,
    { pageNumber, pageSize }: GetCommitmentByPage
  ): Observable<MasterCommitmentsPage> {
    patchState({ isCommitmentLoading: true });

    return this.commitmentService.getMasterCommitments(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({commitmentsPage: payload, isCommitmentLoading: false});
        return payload;
      })
    );
  }

  @Action(SaveCommitment)
  SaveCommitment(
    { patchState, getState, dispatch}: StateContext<CommitmentStateModel>,
    { payload }: SaveCommitment
  ): Observable<MasterCommitment | void> {
    const state = getState();
    const commitmentToSave = payload;

    return this.commitmentService.saveMasterCommitment(payload).pipe(
      tap(payload => {
        if (commitmentToSave.id) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
          dispatch(new UpdateCommitmentSuccess());
        } else {
          if(state.commitmentsPage){
            const items = [payload, ...state.commitmentsPage?.items];
            const commitmentsPage = { ...state.commitmentsPage, items, totalCount: state.commitmentsPage?.totalCount + 1 };
            patchState({ commitmentsPage });
          }
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
          dispatch(new SaveCommitmentSuccess());
        }

        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveCommitmentError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveCommitment)
  RemoveCommitment(
    { dispatch }: StateContext<CommitmentStateModel>,
    { id }: RemoveCommitment
  ): Observable<void> {
    return this.commitmentService.removeMasterCommitment(id).pipe(
      tap(() => {
        dispatch(new UpdateCommitmentSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveCommitmentError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }
}

