import { Injectable } from '@angular/core';
import { CandidateList } from '../types/candidate-list.model';
import { Action, State, StateContext, Selector } from '@ngxs/store';
import { catchError, Observable, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ShowToast } from 'src/app/store/app.actions';
import { getAllErrors } from "@shared/utils/error.utils";
import { MessageTypes } from '@shared/enums/message-types';
import { CandidateListService } from '../services/candidate-list.service';
import {
  ChangeCandidateProfileStatus,
  ExportCandidateList,
  GetAllSkills,
  GetCandidatesByPage,
} from './candidate-list.actions';
import { ListOfSkills } from '@shared/models/skill.model';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';

export interface CandidateListStateModel {
  isCandidateLoading: boolean;
  candidateList: CandidateList | null;
  listOfSkills: ListOfSkills[] | null;
}

@State<CandidateListStateModel>({
  name: 'candidateList',
  defaults: {
    isCandidateLoading: false,
    candidateList: null,
    listOfSkills: null,
  },
})
@Injectable()
export class CandidateListState {
  @Selector()
  static candidates(state: CandidateListStateModel): CandidateList | null {
    return state.candidateList;
  }

  @Selector()
  static listOfSkills(state: CandidateListStateModel): ListOfSkills[] | null {
    return state.listOfSkills;
  }
  constructor(private candidateListService: CandidateListService) {}

  @Action(GetCandidatesByPage, { cancelUncompleted: true })
  GetCandidatesByPage(
    { patchState, dispatch }: StateContext<CandidateListStateModel>,
    { payload }: GetCandidatesByPage
  ): Observable<CandidateList | unknown> {
    patchState({ isCandidateLoading: true });
    return this.candidateListService.getCandidates(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false, candidateList: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        patchState({ isCandidateLoading: false, candidateList: null });
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetAllSkills)
  GetAllSkills({ patchState }: StateContext<CandidateListStateModel>): Observable<ListOfSkills[]> {
    return this.candidateListService.getAllSkills().pipe(tap((data) => patchState({ listOfSkills: data })));
  }

  @Action(ChangeCandidateProfileStatus)
  ChangeCandidateProfileStatus(
    { dispatch }: StateContext<CandidateListStateModel>,
    { candidateProfileId, profileStatus }: ChangeCandidateProfileStatus
  ): Observable<void> {
    return this.candidateListService.changeCandidateStatus(candidateProfileId, profileStatus).pipe(
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(ExportCandidateList)
  ExportUserList({}: StateContext<CandidateListStateModel>, { payload }: ExportCandidateList): Observable<Blob> {
    return this.candidateListService.export(payload).pipe(
      tap((file: Blob) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }
}
