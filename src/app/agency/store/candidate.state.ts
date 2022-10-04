import { Injectable } from '@angular/core';
import { Action, State, StateContext, Selector } from '@ngxs/store';
import { catchError, Observable, of, tap } from 'rxjs';

import {
  CandidateCredential,
  CandidateCredentialPage,
  CredentialGroupedFiles,
} from '@shared/models/candidate-credential.model';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import { CandidateImportResult } from '@shared/models/candidate-profile-import.model';
import { RECORD_ADDED, RECORD_MODIFIED } from 'src/app/shared/constants/messages';
import { MessageTypes } from 'src/app/shared/enums/message-types';
import { Candidate, CandidatePage } from 'src/app/shared/models/candidate.model';
import { Education } from 'src/app/shared/models/education.model';
import { Experience } from 'src/app/shared/models/experience.model';
import { ListOfSkills } from 'src/app/shared/models/skill.model';
import { SkillsService } from 'src/app/shared/services/skills.service';
import { ShowToast } from 'src/app/store/app.actions';
import { CandidateService } from '../services/candidates.service';
import {
  GetAllSkills,
  GetCandidateById,
  GetCandidateByIdSucceeded,
  GetCandidatePhoto,
  GetCandidatePhotoSucceeded,
  GetCandidateProfileErrors,
  GetCandidateProfileErrorsSucceeded,
  GetCandidateProfileTemplate,
  GetCandidateProfileTemplateSucceeded,
  GetCandidatesCredentialByPage,
  GetCredentialFiles,
  GetCredentialFilesSucceeded,
  GetCredentialPdfFiles,
  GetCredentialPdfFilesSucceeded,
  GetCredentialTypes,
  GetEducationByCandidateId,
  GetExperienceByCandidateId,
  GetGroupedCredentialsFiles,
  GetMasterCredentials,
  RemoveCandidateFromStore,
  RemoveCandidatePhoto,
  RemoveCandidatesCredential,
  RemoveCandidatesCredentialSucceeded,
  RemoveEducation,
  RemoveEducationSucceeded,
  RemoveExperience,
  RemoveExperienceSucceeded,
  SaveCandidate,
  SaveCandidateImportResult,
  SaveCandidateImportResultSucceeded,
  SaveCandidatesCredential,
  SaveCandidatesCredentialFailed,
  SaveCandidatesCredentialSucceeded,
  SaveCandidateSucceeded,
  SaveEducation,
  SaveEducationSucceeded,
  SaveExperience,
  SaveExperienceSucceeded,
  UploadCandidatePhoto,
  UploadCandidateProfileFile,
  UploadCandidateProfileFileSucceeded,
  UploadCredentialFiles,
  UploadCredentialFilesSucceeded,
} from './candidate.actions';
import { getAllErrors } from '@shared/utils/error.utils';

export interface CandidateStateModel {
  isCandidateLoading: boolean;
  candidate: Candidate | null;
  skills: ListOfSkills[];
  experiences: Experience[];
  educations: Education[];
  candidatePage: CandidatePage | null;
  candidateCredentialPage: CandidateCredentialPage | null;
  credentialTypes: CredentialType[];
  masterCredentials: Credential[];
  groupedCandidateCredentialsFiles: CredentialGroupedFiles[];
}

@State<CandidateStateModel>({
  name: 'candidate',
  defaults: {
    candidatePage: null,
    candidate: null,
    isCandidateLoading: false,
    skills: [],
    experiences: [],
    educations: [],
    candidateCredentialPage: null,
    credentialTypes: [],
    masterCredentials: [],
    groupedCandidateCredentialsFiles: [],
  },
})
@Injectable()
export class CandidateState {
  @Selector()
  static isCandidateCreated(state: CandidateStateModel): boolean {
    return !!state.candidate?.id;
  }

  @Selector()
  static skills(state: CandidateStateModel): ListOfSkills[] {
    return state.skills;
  }

  @Selector()
  static experiences(state: CandidateStateModel): Experience[] | null {
    return state.experiences;
  }

  @Selector()
  static educations(state: CandidateStateModel): Education[] | null {
    return state.educations;
  }

  @Selector()
  static candidates(state: CandidateStateModel): CandidatePage | null {
    return state.candidatePage;
  }

  @Selector()
  static candidateCredential(state: CandidateStateModel): CandidateCredentialPage | null {
    return state.candidateCredentialPage;
  }

  @Selector()
  static credentialTypes(state: CandidateStateModel): CredentialType[] {
    return state.credentialTypes;
  }

  @Selector()
  static masterCredentials(state: CandidateStateModel): Credential[] {
    return state.masterCredentials;
  }

  @Selector()
  static groupedCandidateCredentialsFiles(state: CandidateStateModel): CredentialGroupedFiles[] {
    return state.groupedCandidateCredentialsFiles;
  }

  constructor(private candidateService: CandidateService, private skillsService: SkillsService) {}

  @Action(GetCandidateById)
  GetCandidateById(
    { patchState, dispatch }: StateContext<CandidateStateModel>,
    { payload }: GetCandidateById
  ): Observable<Candidate> {
    patchState({ isCandidateLoading: true });
    return this.candidateService.getCandidateById(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false, candidate: payload });
        dispatch(new GetCandidateByIdSucceeded(payload));
        return payload;
      })
    );
  }

  @Action(SaveCandidate)
  SaveCandidate(
    { patchState, dispatch }: StateContext<CandidateStateModel>,
    { payload }: SaveCandidate
  ): Observable<Candidate | void> {
    patchState({ isCandidateLoading: true });
    const isCreating = !payload.id;
    return this.candidateService.saveCandidate(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false, candidate: payload });
        if (isCreating) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        }
        dispatch(new SaveCandidateSucceeded(payload));
        return payload;
      }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveCandidateFromStore)
  RemoveCandidateFromStore({ patchState }: StateContext<CandidateStateModel>, {}: GetAllSkills): void {
    patchState({ candidate: null });
  }

  @Action(GetAllSkills)
  GetAllSkills({ patchState }: StateContext<CandidateStateModel>, {}: GetAllSkills): Observable<ListOfSkills[]> {
    return this.skillsService.getAllMasterSkillsArray().pipe(
      tap((payload) => {
        patchState({ skills: payload });
        return payload;
      })
    );
  }

  @Action(UploadCandidatePhoto)
  UploadCandidatePhoto(
    { patchState }: StateContext<CandidateStateModel>,
    { file, candidateProfileId }: UploadCandidatePhoto
  ): Observable<any> {
    patchState({ isCandidateLoading: true });
    return this.candidateService.saveCandidatePhoto(file, candidateProfileId).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false });
        return payload;
      })
    );
  }

  @Action(GetCandidatePhoto)
  GetCandidatePhoto({ dispatch }: StateContext<CandidateStateModel>, { payload }: GetCandidatePhoto): Observable<any> {
    return this.candidateService.getCandidatePhoto(payload).pipe(
      tap((payload) => {
        dispatch(new GetCandidatePhotoSucceeded(payload));
        return payload;
      })
    );
  }

  @Action(RemoveCandidatePhoto)
  RemoveCandidatePhoto(
    { dispatch }: StateContext<CandidateStateModel>,
    { payload }: RemoveCandidatePhoto
  ): Observable<any> {
    return this.candidateService.removeCandidatePhoto(payload).pipe(
      tap((payload) => payload),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Photo cannot be deleted'))))
    );
  }

  @Action(GetExperienceByCandidateId)
  GetExperienceByCandidateId(
    { patchState, dispatch, getState }: StateContext<CandidateStateModel>,
    {}: GetExperienceByCandidateId
  ): Observable<Experience[]> {
    const id = getState().candidate?.id as number;
    return this.candidateService.getExperienceByCandidateId(id).pipe(
      tap((payload) => {
        patchState({ experiences: payload });
        return payload;
      })
    );
  }

  @Action(SaveExperience)
  SaveExperience(
    { patchState, dispatch, getState }: StateContext<CandidateStateModel>,
    { payload }: SaveExperience
  ): Observable<Experience | void> {
    const isCreating = !payload.id;
    payload.candidateProfileId = getState().candidate?.id as number;
    patchState({ isCandidateLoading: true });
    return this.candidateService.saveExperience(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false });
        dispatch(new SaveExperienceSucceeded(payload));
        dispatch(new ShowToast(MessageTypes.Success, isCreating ? RECORD_ADDED : RECORD_MODIFIED));
        return payload;
      }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveExperience)
  RemoveExperience(
    { patchState, dispatch }: StateContext<CandidateStateModel>,
    { payload }: RemoveExperience
  ): Observable<any> {
    patchState({ isCandidateLoading: true });
    return this.candidateService.removeExperience(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false });
        dispatch(new RemoveExperienceSucceeded());
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Experience cannot be deleted'))))
    );
  }

  @Action(GetEducationByCandidateId)
  GetEducationByCandidateId(
    { patchState, dispatch, getState }: StateContext<CandidateStateModel>,
    {}: GetEducationByCandidateId
  ): Observable<Education[]> {
    const id = getState().candidate?.id as number;
    return this.candidateService.getEducationByCandidateId(id).pipe(
      tap((payload) => {
        patchState({ educations: payload });
        return payload;
      })
    );
  }

  @Action(SaveEducation)
  SaveEducation(
    { patchState, dispatch, getState }: StateContext<CandidateStateModel>,
    { payload }: SaveEducation
  ): Observable<Education | void> {
    const isCreating = !payload.id;
    payload.candidateProfileId = getState().candidate?.id as number;
    patchState({ isCandidateLoading: true });
    return this.candidateService.saveEducation(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false });
        dispatch(new SaveEducationSucceeded(payload));
        dispatch(new ShowToast(MessageTypes.Success, isCreating ? RECORD_ADDED : RECORD_MODIFIED));
        return payload;
      }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveEducation)
  RemoveEducation(
    { patchState, dispatch }: StateContext<CandidateStateModel>,
    { payload }: RemoveEducation
  ): Observable<any> {
    patchState({ isCandidateLoading: true });
    return this.candidateService.removeEducation(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false });
        dispatch(new RemoveEducationSucceeded());
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Education cannot be deleted'))))
    );
  }

  @Action(GetCandidatesCredentialByPage)
  GetCandidatesCredentialByPage(
    { patchState, dispatch, getState }: StateContext<CandidateStateModel>,
    { pageNumber, pageSize }: GetCandidatesCredentialByPage
  ): Observable<CandidateCredentialPage> {
    patchState({ isCandidateLoading: true });
    const id = getState().candidate?.id as number;
    return this.candidateService.getCredentialByCandidateId(pageNumber, pageSize, id).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false, candidateCredentialPage: payload });
        return payload;
      })
    );
  }

  @Action(GetMasterCredentials)
  GetMasterCredentials(
    { patchState }: StateContext<CandidateStateModel>,
    { searchTerm, credentialTypeId }: GetMasterCredentials
  ): Observable<Credential[]> {
    patchState({ isCandidateLoading: true });
    return this.candidateService.getMasterCredentials(searchTerm, credentialTypeId).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false, masterCredentials: payload });
        return payload;
      })
    );
  }

  @Action(SaveCandidatesCredential)
  SaveCandidatesCredential(
    { patchState, dispatch, getState }: StateContext<CandidateStateModel>,
    { payload }: SaveCandidatesCredential
  ): Observable<CandidateCredential | void> {
    const isCreating = !payload.id;
    payload.candidateProfileId = getState().candidate?.id as number;
    patchState({ isCandidateLoading: true });
    return this.candidateService.saveCredential(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false });
        dispatch(new SaveCandidatesCredentialSucceeded(payload));
        dispatch(new ShowToast(MessageTypes.Success, isCreating ? RECORD_ADDED : RECORD_MODIFIED));
        return payload;
      }),
      catchError((error: any) => {
        dispatch(new SaveCandidatesCredentialFailed());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveCandidatesCredential)
  RemoveCandidatesCredential(
    { patchState, dispatch }: StateContext<CandidateStateModel>,
    { payload }: RemoveCandidatesCredential
  ): Observable<any> {
    patchState({ isCandidateLoading: true });
    return this.candidateService.removeCredential(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false });
        dispatch(new RemoveCandidatesCredentialSucceeded());
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Credential cannot be deleted'))))
    );
  }

  @Action(GetCredentialTypes)
  GetCredentialTypes(
    { patchState }: StateContext<CandidateStateModel>,
    {}: GetCredentialTypes
  ): Observable<CredentialType[]> {
    return this.candidateService.getCredentialTypes().pipe(
      tap((payload) => {
        patchState({ credentialTypes: payload });
        return payload;
      })
    );
  }

  @Action(UploadCredentialFiles)
  UploadCredentialFiles(
    { patchState, dispatch }: StateContext<CandidateStateModel>,
    { files, candidateCredentialId }: UploadCredentialFiles
  ): Observable<any> {
    patchState({ isCandidateLoading: true });
    return this.candidateService.saveCredentialFiles(files, candidateCredentialId).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false });
        dispatch(new UploadCredentialFilesSucceeded());
        return payload;
      })
    );
  }

  @Action(GetCredentialFiles)
  GetCredentialFiles(
    { dispatch }: StateContext<CandidateStateModel>,
    { payload }: GetCredentialFiles
  ): Observable<any> {
    return this.candidateService.getCredentialFile(payload).pipe(
      tap((payload) => {
        dispatch(new GetCredentialFilesSucceeded(payload));
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'No files found'))))
    );
  }

  @Action(GetCredentialPdfFiles)
  GetCredentialPdfFiles(
    { dispatch }: StateContext<CandidateStateModel>,
    { payload }: GetCredentialPdfFiles
  ): Observable<any> {
    return this.candidateService.getCredentialPdfFile(payload).pipe(
      tap((payload) => {
        dispatch(new GetCredentialPdfFilesSucceeded(payload));
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'No files found'))))
    );
  }

  @Action(GetGroupedCredentialsFiles)
  GetGroupedCredentialsFiles(
    { patchState, getState }: StateContext<CandidateStateModel>,
    {}: GetGroupedCredentialsFiles
  ): Observable<CredentialGroupedFiles[]> {
    const id = getState().candidate?.id as number;
    return this.candidateService.getCredentialGroupedFiles(id).pipe(
      tap((payload) => {
        patchState({ groupedCandidateCredentialsFiles: payload });
        return payload;
      })
    );
  }

  @Action(GetCandidateProfileTemplate)
  GetCandidateProfileTemplate({ dispatch }: StateContext<CandidateStateModel>): Observable<any> {
    return this.candidateService.getCandidateProfileTemplate().pipe(
      tap((payload) => {
        dispatch(new GetCandidateProfileTemplateSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the template'))))
    );
  }

  @Action(GetCandidateProfileErrors)
  GetCandidateProfileErrors(
    { dispatch }: StateContext<CandidateStateModel>,
    { payload }: GetCandidateProfileErrors
  ): Observable<any> {
    return this.candidateService.getCandidateProfileErrors(payload).pipe(
      tap((payload) => {
        dispatch(new GetCandidateProfileErrorsSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(UploadCandidateProfileFile)
  UploadCandidateProfileFile(
    { dispatch }: StateContext<CandidateStateModel>,
    { payload }: UploadCandidateProfileFile
  ): Observable<CandidateImportResult | Observable<void>> {
    return this.candidateService.uploadCandidateProfileFile(payload).pipe(
      tap((payload) => {
        dispatch(new UploadCandidateProfileFileSucceeded(payload));
        return payload;
      }),
      catchError((error: any) =>
        of(
          dispatch(
            new ShowToast(
              MessageTypes.Error,
              error && error.error ? getAllErrors(error.error) : 'File was not uploaded'
            )
          )
        )
      )
    );
  }

  @Action(SaveCandidateImportResult)
  SaveCandidateImportResult(
    { dispatch }: StateContext<CandidateStateModel>,
    { payload }: SaveCandidateImportResult
  ): Observable<CandidateImportResult | Observable<void>> {
    return this.candidateService.saveCandidateImportResult(payload).pipe(
      tap((payload) => {
        dispatch(new SaveCandidateImportResultSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Candidates were not imported'))))
    );
  }
}
