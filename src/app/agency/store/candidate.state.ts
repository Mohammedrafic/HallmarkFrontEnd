import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, Observable, of, tap } from "rxjs";

import { RECORD_ADDED, RECORD_MODIFIED } from "src/app/shared/constants/messages";
import { MessageTypes } from "src/app/shared/enums/message-types";
import { Candidate } from 'src/app/shared/models/candidate.model';
import { Education } from "src/app/shared/models/education.model";
import { Experience } from "src/app/shared/models/experience.model";
import { SkillsPage } from 'src/app/shared/models/skill.model';
import { SkillsService } from 'src/app/shared/services/skills.service';
import { ShowToast } from "src/app/store/app.actions";
import { CandidateService } from '../services/candidates.service';
import {
  GetAllSkills,
  GetCandidatePhoto,
  GetEducationByCandidateId,
  GetExperienceByCandidateId,
  RemoveEducation,
  RemoveEducationSucceeded,
  RemoveExperience,
  RemoveExperienceSucceeded,
  SaveCandidate,
  SaveCandidateSucceeded,
  SaveEducation,
  SaveEducationSucceeded,
  SaveExperience,
  SaveExperienceSucceeded,
  UploadCandidatePhoto
} from './candidate.actions';

export interface CandidateStateModel {
  isCandidateLoading: boolean;
  candidate: Candidate | null;
  skills: SkillsPage | null;
  experiences: Experience[];
  educations: Education[];
}

@State<CandidateStateModel>({
  name: 'candidate',
  defaults: {
    candidate: null,
    isCandidateLoading: false,
    skills: null,
    experiences: [],
    educations: []
  },
})
@Injectable()
export class CandidateState {

  @Selector()
  static skills(state: CandidateStateModel): any { return state.skills; }

  @Selector()
  static experiences(state: CandidateStateModel): Experience[] | null { return state.experiences; }

  @Selector()
  static educations(state: CandidateStateModel): Education[] | null { return state.educations; }

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

  @Action(GetExperienceByCandidateId)
  GetExperienceByCandidateId({ patchState, dispatch, getState  }: StateContext<CandidateStateModel>, { }: GetExperienceByCandidateId): Observable<Experience[]> {
    const id = getState().candidate?.id as number;
    return this.candidateService.getExperienceByCandidateId(id).pipe(
      tap((payload) => {
        patchState({ experiences: payload });
        return payload;
      })
    );
  }

  @Action(SaveExperience)
  SaveExperience({ patchState, dispatch, getState }: StateContext<CandidateStateModel>, { payload }: SaveExperience): Observable<Experience | void> {
    const isCreating = !payload.id;
    payload.candidateProfileId = getState().candidate?.id as number;
    patchState({ isCandidateLoading: true });
    return this.candidateService.saveExperience(payload).pipe(tap((payload) => {
        patchState({ isCandidateLoading: false });
        dispatch(new SaveExperienceSucceeded(payload));
        dispatch(new ShowToast(MessageTypes.Success, isCreating ? RECORD_ADDED : RECORD_MODIFIED));
        return payload;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, 'Experience already exists')))
    );
  }

  @Action(RemoveExperience)
  RemoveExperience({ patchState, dispatch }: StateContext<CandidateStateModel>, { payload }: RemoveExperience): Observable<any> {
    patchState({ isCandidateLoading: true });
    return this.candidateService.removeExperience(payload).pipe(tap((payload) => {
        patchState({ isCandidateLoading: false });
        dispatch(new RemoveExperienceSucceeded());
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Experience cannot be deleted')))));
  }

  @Action(GetEducationByCandidateId)
  GetEducationByCandidateId({ patchState, dispatch, getState  }: StateContext<CandidateStateModel>, { }: GetEducationByCandidateId): Observable<Education[]> {
    const id = getState().candidate?.id as number;
    return this.candidateService.getEducationByCandidateId(id).pipe(
      tap((payload) => {
        patchState({ educations: payload });
        return payload;
      })
    );
  }

  @Action(SaveEducation)
  SaveEducation({ patchState, dispatch, getState }: StateContext<CandidateStateModel>, { payload }: SaveEducation): Observable<Education | void> {
    const isCreating = !payload.id;
    payload.candidateProfileId = getState().candidate?.id as number;
    patchState({ isCandidateLoading: true });
    return this.candidateService.saveEducation(payload).pipe(tap((payload) => {
        patchState({ isCandidateLoading: false });
        dispatch(new SaveEducationSucceeded(payload));
        dispatch(new ShowToast(MessageTypes.Success, isCreating ? RECORD_ADDED : RECORD_MODIFIED));
        return payload;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, 'Education already exists')))
    );
  }

  @Action(RemoveEducation)
  RemoveEducation({ patchState, dispatch }: StateContext<CandidateStateModel>, { payload }: RemoveEducation): Observable<any> {
    patchState({ isCandidateLoading: true });
    return this.candidateService.removeEducation(payload).pipe(tap((payload) => {
        patchState({ isCandidateLoading: false });
        dispatch(new RemoveEducationSucceeded());
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Education cannot be deleted')))));
  }
}
