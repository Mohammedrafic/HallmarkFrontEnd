import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { CredentialSetupFilter } from '@shared/models/credential-setup-filter.model';
import {
  DeleteCredentialGroupMappingById,
  ExportCredentialList,
  GetCredentialGroupMapping,
  GetCredentialSetupByMappingId,
  GetFilteredCredentialSetupData,
  RemoveCredentialSetupByMappingId,
  SaveCredentialGroupMapping,
  UpdateCredentialSetup,
  SetCredentialSetupFilter,
  SetNavigationTab,
  UpdateCredentialSetupSucceeded,
  SaveUpdateCredentialSetupMappingData, SaveUpdateCredentialSetupMappingSucceeded, GetCredentialsDataSources
} from './credentials.actions';
import { catchError, Observable, tap } from 'rxjs';
import { SkillGroupMapping } from '@shared/models/credential-group-mapping.model';
import { SkillGroupService } from '@shared/services/skill-group.service';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import {
  RECORD_ADDED,
  RECORD_CANNOT_BE_DELETED,
  RECORD_CANNOT_BE_SAVED,
  RECORD_MODIFIED
} from '@shared/constants';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { CredentialsService } from '@shared/services/credentials.service';
import { CredentialSetupFilterGet, CredentialSetupGet, SaveUpdatedCredentialSetupDetailIds } from '@shared/models/credential-setup.model';
import { getAllErrors } from '@shared/utils/error.utils';
import { CredentialFilterDataSources } from '@shared/models/credential.model';

export interface CredentialsStateModel {
  activeTab: number;
  setupFilter: CredentialSetupFilter | null;
  groupMappings: SkillGroupMapping[],
  filteredCredentialSetupData: CredentialSetupFilterGet[],
  credentialSetupList: CredentialSetupGet[],
  credentialDataSources: CredentialFilterDataSources | null,
}

@State<CredentialsStateModel>({
  name: 'credentials',
  defaults: {
    activeTab: 0,
    setupFilter: null,
    groupMappings: [],
    filteredCredentialSetupData: [],
    credentialSetupList: [],
    credentialDataSources: null,
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
  static filteredCredentialSetupData(state: CredentialsStateModel): CredentialSetupFilterGet[] { return state.filteredCredentialSetupData; }

  @Selector()
  static credentialSetupList(state: CredentialsStateModel): CredentialSetupGet[] { return state.credentialSetupList; }

  @Selector()
  static credentialDataSources(state: CredentialsStateModel): CredentialFilterDataSources | null { return state.credentialDataSources; }

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
  SaveCredentialGroupMapping({ dispatch }: StateContext<CredentialsStateModel>, { payload }: SaveCredentialGroupMapping): Observable<SkillGroupMapping | void> {
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
  DeleteCredentialGroupMappingById({ dispatch }: StateContext<CredentialsStateModel>, { payload }: DeleteCredentialGroupMappingById): Observable<any> {
    return this.skillGroupService.removeSkillGroupMapping(payload).pipe(tap(() => {
        dispatch(new GetCredentialGroupMapping());
        return payload;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail))));
  }

  @Action(ExportCredentialList)
  ExportCredentialList({ }: StateContext<CredentialsStateModel>, { payload }: ExportCredentialList): Observable<any> {
    return this.skillGroupService.exportCredentialTypes(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };

  @Action(GetFilteredCredentialSetupData)
  GetFilteredCredentialSetupData({ patchState }: StateContext<CredentialsStateModel>, { payload }: GetFilteredCredentialSetupData): Observable<CredentialSetupFilterGet[]> {
    return this.credentialService.getFilteredCredentialSetupData(payload).pipe(tap((responseData) => {
      patchState({ filteredCredentialSetupData: responseData });
      return responseData;
    }));
  }

  @Action(SaveUpdateCredentialSetupMappingData)
  SaveUpdateCredentialSetupMappingData({ dispatch }: StateContext<CredentialsStateModel>, { credentialSetupMapping }: SaveUpdateCredentialSetupMappingData): Observable<SaveUpdatedCredentialSetupDetailIds | void> {
    return this.credentialService.saveUpdateCredentialSetupMapping(credentialSetupMapping).pipe(tap((response) => {
      if (credentialSetupMapping) {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
      } else {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      }
      dispatch(new SaveUpdateCredentialSetupMappingSucceeded(true));
      return response;
    }),
    catchError((error: any) => {
      if (error.error && error.error.errors && error.error.errors.ForceUpsert) {
        return dispatch(new SaveUpdateCredentialSetupMappingSucceeded(false));
      } else {
        return dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_SAVED));
      }
    }));
  }

  @Action(GetCredentialSetupByMappingId)
  GetCredentialSetupByMappingId({ patchState }: StateContext<CredentialsStateModel>, { mappingId }: GetCredentialSetupByMappingId): Observable<CredentialSetupGet[]> {
    return this.credentialService.getCredentialSetupByMappingId(mappingId).pipe(tap((response) => {
      patchState({ credentialSetupList: response });
      return response;
    }));
  }

  @Action(RemoveCredentialSetupByMappingId)
  RemoveCredentialSetupByMappingId({ dispatch }: StateContext<CredentialsStateModel>, { mappingId, filter }: RemoveCredentialSetupByMappingId): Observable<void> {
    return this.credentialService.removeCredentialSetups(mappingId).pipe(tap(() => {
        dispatch(new GetFilteredCredentialSetupData(filter));
        return mappingId;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_DELETED))));
  }

  @Action(UpdateCredentialSetup)
  UpdateCredentialSetup({ dispatch }: StateContext<CredentialsStateModel>, { credentialSetup }: UpdateCredentialSetup): Observable<CredentialSetupGet> {
    return this.credentialService.updateCredentialSetup(credentialSetup).pipe(tap((response) => {
      dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED))
      dispatch(new UpdateCredentialSetupSucceeded());
      return response;
    }));
  }
  
  @Action(GetCredentialsDataSources)
  GetCredentialsDataSources({ patchState }: StateContext<CredentialsStateModel>, { }: GetCredentialsDataSources): Observable<CredentialFilterDataSources> {
    return this.credentialService.getCredentialsDataSources().pipe(tap((response) => {
      patchState({ credentialDataSources: response });
      return response;
    }));
  }
}
