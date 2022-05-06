import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, Observable, tap } from 'rxjs';
import { RECORD_ADDED, RECORD_MODIFIED } from 'src/app/shared/constants/messages';
import { MessageTypes } from 'src/app/shared/enums/message-types';

import { Candidate } from 'src/app/shared/models/candidate.model';
import { SkillsPage } from 'src/app/shared/models/skill.model';
import { SkillsService } from 'src/app/shared/services/skills.service';
import { ShowToast } from 'src/app/store/app.actions';
import { CandidateService } from '../services/candidates.service';
import { GetAllSkills, GetCandidatePhoto, SaveCandidate, SaveCandidateSucceeded, UploadCandidatePhoto } from './candidate.actions';

export interface CandidateStateModel {
  isCandidateLoading: boolean;
  candidate: Candidate | null;
  skills: SkillsPage | null;
}

@State<CandidateStateModel>({
  name: 'candidate',
  defaults: {
    candidate: null,
    isCandidateLoading: false,
    skills: null
  },
})
@Injectable()
export class CandidateState {

  @Selector()
  static skills(state: CandidateStateModel): any { return state.skills; }

  constructor(private candidateService: CandidateService, private skillsService: SkillsService) {}

  @Action(SaveCandidate)
  SaveCandidate({ patchState, dispatch }: StateContext<CandidateStateModel>, { payload }: SaveCandidate): Observable<Candidate | void> {
    patchState({ isCandidateLoading: true });
    return this.candidateService.saveCandidate(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false, candidate: payload });
        if (payload.id) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        dispatch(new SaveCandidateSucceeded(payload));
        return payload;
      }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail))
      })
    );
  }

  @Action(GetAllSkills)
  GetAllSkills({ patchState }: StateContext<CandidateStateModel>, { }: GetAllSkills): Observable<SkillsPage> {
    return this.skillsService.getAllMasterSkills().pipe(
      tap((payload) => {
        patchState({ skills: payload });
        return payload;
      })
    );
  }

  @Action(UploadCandidatePhoto)
  UploadCandidatePhoto({ patchState }: StateContext<CandidateStateModel>, { file, candidateProfileId }: UploadCandidatePhoto): Observable<any> {
    patchState({ isCandidateLoading: true });
    return this.candidateService.saveCandidatePhoto(file, candidateProfileId).pipe(tap((payload) => {
      patchState({ isCandidateLoading: false });
      return payload;
    }));
  }

  @Action(GetCandidatePhoto)
  GetCandidatePhoto({ dispatch }: StateContext<CandidateStateModel>, { payload }: GetCandidatePhoto): Observable<any> {
    return this.candidateService.getCandidatePhoto(payload).pipe(tap((payload) => {
      return payload;
    }));
  }
}
