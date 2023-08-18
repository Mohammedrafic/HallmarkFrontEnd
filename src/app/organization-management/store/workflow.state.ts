import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { catchError, map, Observable, of, tap } from 'rxjs';

import {
  GetRolesForWorkflowMapping,
  GetUsersForWorkflowMapping,
  GetWorkflowMappingPages,
  GetWorkflows,
  GetWorkflowsSucceed,
  RemoveWorkflow,
  RemoveWorkflowDeclined,
  RemoveWorkflowMapping,
  RemoveWorkflowSucceed,
  SaveWorkflow,
  SaveWorkflowMapping,
  SaveWorkflowMappingSucceed,
  SaveWorkflowSucceed,
  UpdateWorkflow,
} from './workflow.actions';
import { WorkflowService } from '@shared/services/workflow.service';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import {
  RECORD_ADDED,
  RECORD_CANNOT_BE_DELETED,
  RECORD_CANNOT_BE_SAVED,
  RECORD_CANNOT_BE_UPDATED,
  RECORD_MODIFIED,
  usedByOrderErrorMessage,
  usedInMappingMessage,
} from '@shared/constants';
import { WorkflowWithDetails } from '@shared/models/workflow.model';
import {
  RoleListsByPermission,
  UserListsByPermission,
  WorkflowMappingPage,
  WorkflowMappingPost,
} from '@shared/models/workflow-mapping.model';
import { getAllErrors } from '@shared/utils/error.utils';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { GetWorkflowFlags, PrepareWorkflowMapping } from '@organization-management/workflow/helpers';

export interface WorkflowStateModel {
  workflows: WorkflowWithDetails[] | null;
  workflowMappingPages: WorkflowMappingPage | null;
  rolesPerUsers: RoleListsByPermission;
  users: UserListsByPermission;
}

@State<WorkflowStateModel>({
  name: 'workflow',
  defaults: {
    workflows: [],
    workflowMappingPages: null,
    rolesPerUsers: {
      irpRoles: [],
      vmsRoles: [],
    },
    users: {
      vmsUsers: [],
      irpUsers: [],
    },
  },
})
@Injectable()
export class WorkflowState {
  @Selector()
  static sortedWorkflows(state: WorkflowStateModel): WorkflowWithDetails[] | null {
    return sortByField(state.workflows ?? [], 'name');
  }

  @Selector()
  static workflowMappingPages(state: WorkflowStateModel): WorkflowMappingPage | null {
    return state.workflowMappingPages;
  }

  @Selector()
  static rolesPerUsers(state: WorkflowStateModel): RoleListsByPermission {
    return state.rolesPerUsers;
  }

  @Selector()
  static users(state: WorkflowStateModel): UserListsByPermission {
    return state.users;
  }

  constructor(private workflowService: WorkflowService) {}

  @Action(GetWorkflows)
  GetWorkflows(
    { patchState, dispatch }: StateContext<WorkflowStateModel>,
    { payload }: GetWorkflows
  ): Observable<WorkflowWithDetails[]> {
    return this.workflowService.getWorkflows(payload).pipe(
      tap((payload) => {
        patchState({ workflows: payload });
        dispatch(new GetWorkflowsSucceed(payload));
        return payload;
      })
    );
  }

  @Action(SaveWorkflow)
  SaveWorkflow(
    { patchState, dispatch }: StateContext<WorkflowStateModel>,
    { payload }: SaveWorkflow
  ): Observable<WorkflowWithDetails | void> {
    return this.workflowService.saveWorkflow(payload).pipe(
      tap((payloadResponse) => {
        dispatch([
          new ShowToast(MessageTypes.Success, RECORD_ADDED),
          new GetWorkflows(GetWorkflowFlags(payload.isIRP)),
          new SaveWorkflowSucceed(),
        ]);

        return payloadResponse;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(
          new ShowToast(
            MessageTypes.Error,
            error.error && error.error.errors ? getAllErrors(error.error) : RECORD_CANNOT_BE_SAVED
          )
        );
      })
    );
  }

  @Action(UpdateWorkflow)
  UpdateWorkflow(
    { patchState, dispatch }: StateContext<WorkflowStateModel>,
    { workflow, isRemoveStep }: UpdateWorkflow
  ): Observable<WorkflowWithDetails | void> {
    return this.workflowService.updateWorkflow(workflow).pipe(
      tap((payloadResponse) => {
        payloadResponse?.requireMappingsUpdate && !isRemoveStep
          ? dispatch(new ShowToast(MessageTypes.Warning, usedInMappingMessage('Workflow')))
          : dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        dispatch(new GetWorkflows(GetWorkflowFlags(workflow.isIRP)));
        return payloadResponse;
      }),
      catchError((error: any) => {
        if (isRemoveStep) {
          const message =
            'The custom step cannot be deleted. User should delete Mapping(s) firstly and after that delete Custom step from Workflow';
          dispatch(new ShowToast(MessageTypes.Error, message));
          dispatch(new RemoveWorkflowDeclined());
        } else {
          dispatch(
            new ShowToast(
              MessageTypes.Error,
              error.error && error.error.errors ? getAllErrors(error.error) : RECORD_CANNOT_BE_UPDATED
            )
          );
        }
        return of(error);
      })
    );
  }

  @Action(RemoveWorkflow)
  RemoveWorkflow({ dispatch }: StateContext<WorkflowStateModel>, { payload }: RemoveWorkflow): Observable<void> {
    return this.workflowService.removeWorkflow(payload).pipe(
      tap(() => {
        dispatch([
          new RemoveWorkflowSucceed(),
          new GetWorkflows(GetWorkflowFlags(payload.isIRP)),
        ]);
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        const message = error.error.errors?.EntityInUse
          ? usedByOrderErrorMessage('Workflow', error.error.errors['EntityInUse'])
          : 'Workflow cannot be deleted';
        return dispatch(new ShowToast(MessageTypes.Error, message));
      })
    );
  }

  @Action(GetWorkflowMappingPages)
  GetWorkflowMappingPages(
    { patchState }: StateContext<WorkflowStateModel>,
    { filters }: GetWorkflowMappingPages
  ): Observable<WorkflowMappingPage> {
    return this.workflowService.getWorkflowMappingPages(filters).pipe(
      map((payload: WorkflowMappingPage) => {
        return PrepareWorkflowMapping(payload);
      }),
      tap((payload) => {
        patchState({ workflowMappingPages: payload });
        return payload;
      })
    );
  }

  @Action(SaveWorkflowMapping)
  SaveWorkflowMapping(
    { dispatch }: StateContext<WorkflowStateModel>,
    { payload, filters }: SaveWorkflowMapping
  ): Observable<WorkflowMappingPost | void> {
    return this.workflowService.saveWorkflowMapping(payload).pipe(
      tap((payloadResponse) => {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        dispatch(new GetWorkflowMappingPages(filters));
        dispatch(new SaveWorkflowMappingSucceed());
        return payloadResponse;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error && error.error.errors && error.error.errors.SkillIds[0]) {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.errors.SkillIds[0]));
        } else {
          return dispatch(new ShowToast(MessageTypes.Error, RECORD_CANNOT_BE_SAVED));
        }
      })
    );
  }

  @Action(RemoveWorkflowMapping)
  RemoveWorkflowMapping(
    { dispatch }: StateContext<WorkflowStateModel>,
    { payload, filters }: RemoveWorkflowMapping
  ): Observable<void> {
    return this.workflowService.removeWorkflowMapping(payload).pipe(
      tap(() => {
        dispatch(new GetWorkflowMappingPages(filters));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        const message = error.error.errors?.EntityInUse
          ? usedByOrderErrorMessage('Workflow Mapping', error.error.errors['EntityInUse'])
          : RECORD_CANNOT_BE_DELETED;
        return dispatch(new ShowToast(MessageTypes.Error, message));
      })
    );
  }

  @Action(GetRolesForWorkflowMapping)
  GetRolesForWorkflowMapping(
    { patchState }: StateContext<WorkflowStateModel>,
    {}: GetRolesForWorkflowMapping
  ): Observable<RoleListsByPermission> {
    return this.workflowService.getRolesForWorkflowMapping().pipe(
      tap((payload) => {
        patchState({ rolesPerUsers: payload });
        return payload;
      })
    );
  }

  @Action(GetUsersForWorkflowMapping)
  GetUsersForWorkflowMapping(
    { patchState }: StateContext<WorkflowStateModel>,
    {}: GetUsersForWorkflowMapping
  ): Observable<UserListsByPermission> {
    return this.workflowService.getUsersForWorkflowMapping().pipe(
      tap((payload) => {
        patchState({ users: payload });
        return payload;
      })
    );
  }
}
