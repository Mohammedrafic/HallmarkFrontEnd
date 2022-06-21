import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { CredentialSetupFilter } from '@shared/models/credential-setup-filter.model';
import {
  DeleteCredentialGroupMappingById,
  GetCredentialGroupMapping,
  GetFilteredCredentialSetupData,
  SaveCredentialGroupMapping,
  SetCredentialSetupFilter,
  SetNavigationTab
} from './credentials.actions';
import { catchError, Observable, tap } from 'rxjs';
import { SkillGroupMapping } from '@shared/models/credential-group-mapping.model';
import { SkillGroupService } from '@shared/services/skill-group.service';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { CredentialsService } from '@shared/services/credentials.service';
import { CredentialSetupFilterData } from '@shared/models/credential-setup.model';

export interface CredentialsStateModel {
  activeTab: number;
  setupFilter: CredentialSetupFilter | null;
  groupMappings: SkillGroupMapping[],
  filteredCredentialSetupData: CredentialSetupFilterData[]
}

@State<CredentialsStateModel>({
  name: 'credentials',
  defaults: {
    activeTab: 0,
    setupFilter: null,
    groupMappings: [],
    filteredCredentialSetupData: []
  }
})
@Injectable()
export class CredentialsState {
  @Selector()
  static activeTab(state: CredentialsStateModel): number { return state.activeTab; }

  @Selector()
  static setupFilter(state: CredentialsStateModel): CredentialSetupFilter | null { return state.setupFilter; }

  @Selector()
  static groupMappings(state: CredentialsStateModel): SkillGroupMapping[] { return state.groupMappings; }

  @Selector()
  static filteredCredentialSetupData(state: CredentialsStateModel): CredentialSetupFilterData[] { return state.filteredCredentialSetupData; }

  constructor(private skillGroupService: SkillGroupService,
              private credentialService: CredentialsService) {}

  @Action(SetNavigationTab)
  SetNavigationTab({ patchState }: StateContext<CredentialsStateModel>, { payload }: SetNavigationTab): void {
    patchState({ activeTab: payload });
  }

  @Action(SetCredentialSetupFilter)
  SetCredentialSetupFilter({ patchState }: StateContext<CredentialsStateModel>, { payload }: SetCredentialSetupFilter): void {
    patchState({ setupFilter: payload });
  }

  @Action(GetCredentialGroupMapping)
  GetCredentialGroupMapping({ patchState }: StateContext<CredentialsStateModel>, { }: GetCredentialGroupMapping): Observable<SkillGroupMapping[]> {
    return this.skillGroupService.getSkillGroupsMapping().pipe(tap((payload) => {
      patchState({ groupMappings: payload });
      return payload;
    }));
  }

  @Action(SaveCredentialGroupMapping)
  SaveCredentialGroupMapping({ patchState, dispatch }: StateContext<CredentialsStateModel>, { payload }: SaveCredentialGroupMapping): Observable<SkillGroupMapping | void> {
    return this.skillGroupService.saveUpdateSkillGroupMapping(payload)
      .pipe(tap((payloadResponse) => {
          if (payload.mappingId) {
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

  @Action(GetFilteredCredentialSetupData)
  GetFilteredCredentialSetupData({ patchState }: StateContext<CredentialsStateModel>, { payload }: GetFilteredCredentialSetupData): Observable<CredentialSetupFilterData[]> {
    return this.credentialService.getFilteredCredentialSetupData(payload).pipe(tap((responseData) => {
      patchState({ filteredCredentialSetupData: responseData });
      return responseData;
    }));
  }
}
