import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { SpecialProjectMapping, SpecialProjectMappingPage,SaveSpecialProjectMappingDto, ProjectNames } from 'src/app/shared/models/special-project-mapping.model';
import {
  GetSpecialProjectMappings, SaveSpecialProjectMapping, SaveSpecialProjectMappingSucceeded, SetIsDirtySpecialProjectMappingForm,
  DeletSpecialProjectMapping,
  DeletSpecialProjectMappingSucceeded,
  GetProjectNamesByTypeId,
  GetSpecialProjectMappingById,
  ShowConfirmationPopUp
} from './special-project-mapping.actions';
import { SpecialProjectMappingService } from '@shared/services/special-project.-mapping.service';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from 'src/app/shared/enums/message-types';
import { RECORD_ADDED, RECORD_CANNOT_BE_SAVED, RECORD_CANNOT_BE_UPDATED, RECORD_MODIFIED } from '@shared/constants';
import { ProjectType } from '@shared/models/project.model';
import { ProjectsService } from '@shared/services/projects.service';
import { getAllErrors } from '@shared/utils/error.utils';

export interface SpecialProjectMappingStateModel {
  specialProjectMappingPage: SpecialProjectMappingPage | null;
  isSpecialProjectMappingLoading: boolean,
  projectTypes: ProjectType[];
  SpecialProjectMappingEntity: SpecialProjectMapping | null;
  projectNames: ProjectNames[];
}


@State<SpecialProjectMappingStateModel>({
  name: 'specialProjectMappings',
  defaults: {
    specialProjectMappingPage: null,
    isSpecialProjectMappingLoading: false,
    projectTypes: [],
    SpecialProjectMappingEntity: null,
    projectNames:[]
  },
})
@Injectable()
export class SpecialProjectMappingState {

  @Selector()
  static specialProjectMappingPage(state: SpecialProjectMappingStateModel): SpecialProjectMappingPage | null {
    return state.specialProjectMappingPage;
  }

  @Selector()
  static isSpecialProjectMappingLoading(state: SpecialProjectMappingStateModel): boolean { return state.isSpecialProjectMappingLoading; }

  @Selector()
  static SpecialProjectMappingEntity(state: SpecialProjectMappingStateModel): SpecialProjectMapping | null {
    return state.SpecialProjectMappingEntity;
  }

  @Selector()
  static projectNames(state: SpecialProjectMappingStateModel): ProjectNames[] {
    return state.projectNames;
  }


  constructor(private specialProjectMappingService: SpecialProjectMappingService,
    private projectsService: ProjectsService) { }

  @Action(GetSpecialProjectMappings)
  GetSpecialProjectMappings({ patchState }: StateContext<SpecialProjectMappingStateModel>, { filter }: GetSpecialProjectMappings): Observable<SpecialProjectMappingPage> {
    patchState({ isSpecialProjectMappingLoading: true });
    return this.specialProjectMappingService.getSpecialProjectMappings(filter).pipe(
      tap((payload) => {
        patchState({ isSpecialProjectMappingLoading: false, specialProjectMappingPage: payload });
        return payload;
      })
    );
  }

  @Action(SaveSpecialProjectMapping)
  SaveSpecialProjectMapping(
    { dispatch }: StateContext<SpecialProjectMappingStateModel>,
    { specialProjectMapping }: SaveSpecialProjectMapping
  ): Observable<SaveSpecialProjectMappingDto | void> {
    var isEdit = specialProjectMapping.Id > 0 ? true : false;
    return this.specialProjectMappingService.saveSpecialProjectMapping(specialProjectMapping).pipe(
      tap((payloadResponse) => {
        dispatch([
          new ShowToast(MessageTypes.Success, isEdit ? RECORD_MODIFIED : RECORD_ADDED),
          new SaveSpecialProjectMappingSucceeded(),
          new SetIsDirtySpecialProjectMappingForm(false),
        ]);
        return payloadResponse;
      }),
      catchError((error: any) => {
        if (specialProjectMapping.Id) {
          if (error.error && error.error.errors && error.error.errors.ForceUpsert) {
            return dispatch(new ShowConfirmationPopUp());
          } else {
            return dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_UPDATED));
          }
        } else {
          if (error.error && error.error.errors && error.error.errors.ForceUpsert) {
            return dispatch(new ShowConfirmationPopUp());
          } else {
            return dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_SAVED));
          }
        }
      })
    );
  }

  @Action(DeletSpecialProjectMapping)
  DeletSpecialProjectMapping({ patchState, dispatch }: StateContext<SpecialProjectMappingStateModel>, { id }: DeletSpecialProjectMapping): Observable<any> {
    patchState({ isSpecialProjectMappingLoading: true });
    return this.specialProjectMappingService.removeSpecialProjectMapping(id).pipe(
      tap(() => {
        patchState({ isSpecialProjectMappingLoading: false });
        const message = 'Special Project Mapping deleted successfully';
        const actions = [new DeletSpecialProjectMappingSucceeded(), new ShowToast(MessageTypes.Success, message)];
        dispatch([...actions, new DeletSpecialProjectMappingSucceeded()]);
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Special Project cannot be deleted'))))
    );
  }

  @Action(GetSpecialProjectMappingById)
  GetSpecialProjectsMappingById({ patchState }: StateContext<SpecialProjectMappingStateModel>, { id }: GetSpecialProjectMappingById): Observable<SpecialProjectMapping> {
    return this.specialProjectMappingService.getSpecialProjectMappingById(id).pipe(
      tap((payload) => {
        patchState({ SpecialProjectMappingEntity: payload });
      })
    );
  }

  @Action(GetProjectNamesByTypeId)
  GetProjectNamesByTypeId({ patchState }: StateContext<SpecialProjectMappingStateModel>, { typeId }: GetProjectNamesByTypeId): Observable<ProjectNames[]> {
    return this.specialProjectMappingService.getProjectNamesByTypeId(typeId).pipe(
      tap((payload) => {
        patchState({ projectNames: payload });
      })
    );
  }
}
