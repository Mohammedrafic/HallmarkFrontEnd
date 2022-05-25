import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { CredentialSetupFilter } from '@shared/models/credential-setup-filter.model';
import {
  DeleteCredentialGroupMappingById,
  GetCredentialGroupMapping,
  SaveCredentialGroupMapping,
  SetCredentialSetupFilter,
  SetNavigationTab
} from './credentials.actions';
import { catchError, Observable, tap } from 'rxjs';
import { CredentialGroupMapping } from '@shared/models/credential-group-mapping.model';
import { SkillGroupService } from '@shared/services/skill-group.service';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';

export interface CredentialsStateModel {
  activeTab: number;
  setupFilter: CredentialSetupFilter | null;
  groupMappings: CredentialGroupMapping[]
}

@State<CredentialsStateModel>({
  name: 'credentials',
  defaults: {
    activeTab: 0,
    setupFilter: null,
    groupMappings: []
  }
})
@Injectable()
export class CredentialsState {
  @Selector()
  static activeTab(state: CredentialsStateModel): number { return state.activeTab; }

  @Selector()
  static setupFilter(state: CredentialsStateModel): CredentialSetupFilter | null { return state.setupFilter; }

  @Selector()
  static groupMappings(state: CredentialsStateModel): CredentialGroupMapping[] { return state.groupMappings; }

  constructor(private skillGroupService: SkillGroupService) {}

  @Action(SetNavigationTab)
  SetNavigationTab({ patchState }: StateContext<CredentialsStateModel>, { payload }: SetNavigationTab): void {
    patchState({ activeTab: payload });
  }

  @Action(SetCredentialSetupFilter)
  SetCredentialSetupFilter({ patchState }: StateContext<CredentialsStateModel>, { payload }: SetCredentialSetupFilter): void {
    patchState({ setupFilter: payload });
  }

  @Action(GetCredentialGroupMapping)
  GetCredentialGroupMapping({ patchState }: StateContext<CredentialsStateModel>, { }: GetCredentialGroupMapping): Observable<CredentialGroupMapping[]> {
    return this.skillGroupService.getSkillGroupsMapping().pipe(tap((payload) => {
      patchState({ groupMappings: payload });
      return payload;
    }));
  }

  @Action(SaveCredentialGroupMapping)
  SaveCredentialGroupMapping({ patchState, dispatch }: StateContext<CredentialsStateModel>, { payload }: SaveCredentialGroupMapping): Observable<CredentialGroupMapping | void> {
    return this.skillGroupService.saveUpdateSkillGroupMapping(payload)
      .pipe(tap((payloadResponse) => {
          if (payload.id) {
            dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
          } else {
            dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
          }
          dispatch(new GetCredentialGroupMapping());
          return payloadResponse;
        }),
        catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
      );
  }

  @Action(DeleteCredentialGroupMappingById)
  DeleteCredentialGroupMappingById({ patchState, dispatch }: StateContext<CredentialsStateModel>, { payload }: DeleteCredentialGroupMappingById): Observable<any> {
    return this.skillGroupService.removeSkillGroupMapping(payload).pipe(tap(() => {
        dispatch(new GetCredentialGroupMapping());
        return payload;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail))));
  }
}
