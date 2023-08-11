import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { CredentialSetupFilter } from '@shared/models/credential-setup-filter.model';
import {
  DeleteCredentialGroupMappingById,
  GetCredentialGroupMapping,
  GetCredentialSetupByMappingId,
  GetFilteredCredentialSetupData,
  RemoveCredentialSetupByMappingId,
  SaveCredentialGroupMapping,
  UpdateCredentialSetup,
  SetCredentialSetupFilter,
  UpdateCredentialSetupSucceeded,
  SaveUpdateCredentialSetupMappingData,
  SaveUpdateCredentialSetupMappingSucceeded,
  ClearCredentialSetup,
  GetAssignedCredentialTree,
  SaveAssignedCredentialValue,
  ClearFilteredCredentialSetup,
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
  RECORD_MODIFIED,
} from '@shared/constants';
import { CredentialsService } from '@shared/services/credentials.service';
import {
  CredentialSetupGet,
  CredentialSetupPage,
  SaveUpdatedCredentialSetupDetailIds,
} from '@shared/models/credential-setup.model';
import { getAllErrors } from '@shared/utils/error.utils';
import {
  AssignedCredentialTree,
  AssignedCredentialTreeData,
} from '@shared/models/credential.model';
import { compact } from 'lodash';

export interface CredentialsStateModel {
  setupFilter: CredentialSetupFilter | null;
  groupMappings: SkillGroupMapping[],
  filteredCredentialSetupData: CredentialSetupPage | null,
  credentialSetupList: CredentialSetupGet[],
  assignedCredentialTreeData: AssignedCredentialTreeData | null,
}

@State<CredentialsStateModel>({
  name: 'credentials',
  defaults: {
    setupFilter: null,
    groupMappings: [],
    filteredCredentialSetupData: null,
    credentialSetupList: [],
    assignedCredentialTreeData: null,
  }
})
@Injectable()
export class CredentialsState {
  @Selector()
  static setupFilter(state: CredentialsStateModel): CredentialSetupFilter | null { return state.setupFilter; }

  @Selector()
  static groupMappings(state: CredentialsStateModel): SkillGroupMapping[] { return state.groupMappings; }

  @Selector()
  static filteredCredentialSetupData(state: CredentialsStateModel): CredentialSetupPage | null { return state.filteredCredentialSetupData; }

  @Selector()
  static credentialSetupList(state: CredentialsStateModel): CredentialSetupGet[] { return state.credentialSetupList; }

  @Selector()
  static assignedCredentialTree(state: CredentialsStateModel): AssignedCredentialTree { return state.assignedCredentialTreeData?.treeItems || []; }

  @Selector()
  static assignedCredentialTreeValue(state: CredentialsStateModel): string[] { return state.assignedCredentialTreeData?.assignedCredentialIds || []; }

  constructor(private skillGroupService: SkillGroupService,
              private credentialService: CredentialsService) {}

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

  @Action(GetFilteredCredentialSetupData)
  GetFilteredCredentialSetupData({ patchState }: StateContext<CredentialsStateModel>, { payload }: GetFilteredCredentialSetupData): Observable<CredentialSetupPage> {
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

  @Action(ClearCredentialSetup)
  ClearCredentialSetup({ patchState }: StateContext<CredentialsStateModel>): CredentialsStateModel {
    return patchState({ credentialSetupList: [] });
  }

  @Action(ClearFilteredCredentialSetup)
  ClearFilteredCredentialSetup({ patchState }: StateContext<CredentialsStateModel>): CredentialsStateModel {
    return patchState({ filteredCredentialSetupData: null });
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
  UpdateCredentialSetup(
    { dispatch }: StateContext<CredentialsStateModel>,
    { credentialSetup }: UpdateCredentialSetup
  ): Observable<CredentialSetupGet> {
    return this.credentialService.updateCredentialSetup(credentialSetup)
      .pipe(tap((response) => {
        dispatch([
          new ShowToast(MessageTypes.Success, RECORD_MODIFIED),
          new UpdateCredentialSetupSucceeded(credentialSetup.mappingId),
        ]);
      return response;
    }));
  }

  @Action(GetAssignedCredentialTree)
  GetAssignedCredentialTree({ patchState }: StateContext<CredentialsStateModel>): Observable<AssignedCredentialTreeData> {
    return this.credentialService.getAssignedCredentialTreeData().pipe(tap((response) => {
      const assignedCredentialIds = response.assignedCredentialIds.map(cid => response.treeItems.find(treeItem => !treeItem.hasChild && treeItem.cid === Number(cid))?.id);
      const assignedCredentialTreeData = {
        treeItems: response.treeItems,
        assignedCredentialIds: compact(assignedCredentialIds)
      }
      patchState({ assignedCredentialTreeData });
      return response;
    }));
  }

  @Action(SaveAssignedCredentialValue)
  SaveAssignedCredentialValue({ dispatch, getState }: StateContext<CredentialsStateModel>, { payload }: SaveAssignedCredentialValue): Observable<number[] | void> {
    const state = getState();
    const newValue = (state.assignedCredentialTreeData?.treeItems || []).filter(item => !item.hasChild && payload.includes(item.id)).map(item => item.cid);
    return this.credentialService.saveAssignedCredentialValue(newValue).pipe(tap((response) => {
      dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED))
      return response;
    }),
    catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_SAVED))));
  }
}
