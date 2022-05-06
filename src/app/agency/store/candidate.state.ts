import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { Candidate } from 'src/app/shared/models/candidate.model';
import { SkillsPage } from 'src/app/shared/models/skill.model';
import { SkillsService } from 'src/app/shared/services/skills.service';
import { CandidateService } from '../services/candidates.service';
import { GetAllSkills, SaveCandidate, SaveCandidateSucceeded } from './candidate.actions';

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
  SaveCandidate({ patchState, dispatch }: StateContext<CandidateStateModel>, { payload }: SaveCandidate): Observable<Candidate> {
    patchState({ isCandidateLoading: true });
    return this.candidateService.saveCandidate(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false, candidate: payload });
        dispatch(new SaveCandidateSucceeded(payload));
        return payload;
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
}
