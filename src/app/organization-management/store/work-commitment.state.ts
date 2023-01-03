import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, Observable, tap } from 'rxjs';

import { WorkCommitmentDTO, WorkCommitmentsPage } from '../work-commitment/interfaces';
import { WorkCommitmentStateModel } from '../interfaces';
import { WorkCommitmentApiService } from '@shared/services/work-commitment-api.service';
import { WorkCommitment } from './work-commitment.actions';
import { ShowSideDialog, ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { getAllErrors } from '@shared/utils/error.utils';

@State<WorkCommitmentStateModel>({
  name: 'workCommitment',
  defaults: {
    commitmentsByPage: null,
  },
})
@Injectable()
export class WorkCommitmentState {
  constructor(private workCommitmentApiService: WorkCommitmentApiService) {}

  @Selector()
  static workCommitmentsPage(state: WorkCommitmentStateModel): WorkCommitmentsPage | null {
    return state.commitmentsByPage;
  }

  @Action(WorkCommitment.GetCommitmentsByPage)
  GetCommitmentsByPage(
    { patchState }: StateContext<WorkCommitmentStateModel>,
    { pageNumber, pageSize }: WorkCommitment.GetCommitmentsByPage
  ): Observable<WorkCommitmentsPage> {
    return this.workCommitmentApiService.getCommitmentsByPage(pageNumber, pageSize).pipe(
      tap((commitmentsByPage: WorkCommitmentsPage) => {
        patchState({ commitmentsByPage: commitmentsByPage });
      })
    );
  }

  @Action(WorkCommitment.SaveCommitment)
  SaveCommitment(
    { dispatch }: StateContext<WorkCommitmentStateModel>,
    { payload, isEdit }: WorkCommitment.SaveCommitment
  ): Observable<WorkCommitmentDTO | void> {
    return this.workCommitmentApiService.addCommitment(payload).pipe(
      tap(() => {
        dispatch([
          new ShowToast(MessageTypes.Success, isEdit ? RECORD_MODIFIED : RECORD_ADDED),
          new ShowSideDialog(false),
          new WorkCommitment.UpdatePageAfterSuccessAction(),
        ]);
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }
}
