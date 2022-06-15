import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import {
  GetWorkflowMappingPages,
  GetWorkflows,
  GetWorkflowsSucceed,
  RemoveWorkflow,
  RemoveWorkflowMapping,
  RemoveWorkflowDeclined,
  SaveWorkflow,
  SaveWorkflowMapping,
  UpdateWorkflow, SaveWorkflowMappingSucceed, GetRolesForWorkflowMapping, GetUsersForWorkflowMapping
} from './workflow.actions';
import { WorkflowService } from '@shared/services/workflow.service';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_CANNOT_BE_DELETED, RECORD_CANNOT_BE_SAVED, RECORD_MODIFIED } from '@shared/constants';
import {  WorkflowWithDetails } from '@shared/models/workflow.model';
import { WorkflowMappingPage, WorkflowMappingPost } from '@shared/models/workflow-mapping.model';
import { RolesPerUser, User } from '@shared/models/user-managment-page.model';
import { UsersService } from '../../security/services/users.service';

export interface WorkflowStateModel {
  workflows: WorkflowWithDetails[] | null,
  workflowMappingPages: WorkflowMappingPage | null,
  rolesPerUsers: RolesPerUser[] | null;
  users: User[];
}

@State<WorkflowStateModel>({
  name: 'workflow',
  defaults: {
    workflows: [],
    workflowMappingPages: null,
    rolesPerUsers: [],
    users: []
  }
})
@Injectable()
export class WorkflowState {
  @Selector()
  static workflows(state: WorkflowStateModel): WorkflowWithDetails[] | null { return state.workflows; }

  @Selector()
  static workflowMappingPages(state: WorkflowStateModel): WorkflowMappingPage | null { return state.workflowMappingPages; }

  @Selector()
  static rolesPerUsers(state: WorkflowStateModel): RolesPerUser[] | null {
    return state.rolesPerUsers;
  }

  @Selector()
  static users(state: WorkflowStateModel): User[] | [] {
    return state.users;
  }

  constructor(private workflowService: WorkflowService,
              private userService: UsersService) {}

  @Action(GetWorkflows)
  GetWorkflows({ patchState, dispatch }: StateContext<WorkflowStateModel>, { }: GetWorkflows): Observable<WorkflowWithDetails[]> {
    return this.workflowService.getWorkflows().pipe(tap((payload) => {
      patchState({ workflows: payload });
      dispatch(new GetWorkflowsSucceed(payload));
      return payload;
    }));
  }

  @Action(SaveWorkflow)
  SaveWorkflow({ patchState, dispatch }: StateContext<WorkflowStateModel>, { payload }: SaveWorkflow): Observable<WorkflowWithDetails | void> {
    return this.workflowService.saveWorkflow(payload)
      .pipe(tap((payloadResponse) => {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
          dispatch(new GetWorkflows());
          return payloadResponse;
        }),
        catchError((error: any) => {
          if (error.error && error.error.errors && error.error.errors.WorkflowName[0]) {
            return dispatch(new ShowToast(MessageTypes.Error, error.error.errors.WorkflowName[0]));
          } else {
            return dispatch(new ShowToast(MessageTypes.Error, RECORD_CANNOT_BE_SAVED));
          }
        })
      );
  }

  @Action(UpdateWorkflow)
  UpdateWorkflow({ patchState, dispatch }: StateContext<WorkflowStateModel>, { workflow, isRemoveStep }: UpdateWorkflow): Observable<WorkflowWithDetails | void> {
    return this.workflowService.updateWorkflow(workflow)
      .pipe(tap((payloadResponse) => {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED))
          dispatch(new GetWorkflows());
          return payloadResponse;
        }),
        catchError((error: any) => {
          dispatch(new ShowToast(MessageTypes.Error, error.error.detail))
          if (isRemoveStep) {
            dispatch(new RemoveWorkflowDeclined());
          }
          return of(error);
        })
      );
  }

  @Action(RemoveWorkflow)
  RemoveWorkflow({ patchState, dispatch }: StateContext<WorkflowStateModel>, { payload }: RemoveWorkflow): Observable<void> {
    return this.workflowService.removeWorkflow(payload)
      .pipe(tap(() => {
          dispatch(new GetWorkflows());
          return payload;
        }),
        catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, RECORD_CANNOT_BE_DELETED))));
  }

  @Action(GetWorkflowMappingPages)
  GetWorkflowMappingPages({ patchState }: StateContext<WorkflowStateModel>, { filters }: GetWorkflowMappingPages): Observable<WorkflowMappingPage> {
    return this.workflowService.getWorkflowMappingPages(filters).pipe(tap((payload) => {
      patchState({ workflowMappingPages: payload });
      return payload;
    }));
  }

  @Action(SaveWorkflowMapping)
  SaveWorkflowMapping({ dispatch }: StateContext<WorkflowStateModel>, { payload, filters }: SaveWorkflowMapping): Observable<WorkflowMappingPost | void> {
    return this.workflowService.saveWorkflowMapping(payload)
      .pipe(tap((payloadResponse) => {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
          dispatch(new GetWorkflowMappingPages(filters));
          dispatch(new SaveWorkflowMappingSucceed());
          return payloadResponse;
        }),
        catchError((error: any) => {
          if (error.error && error.error.errors && error.error.errors.SkillIds[0]) {
            return dispatch(new ShowToast(MessageTypes.Error, error.error.errors.SkillIds[0]));
          } else {
            return dispatch(new ShowToast(MessageTypes.Error, RECORD_CANNOT_BE_SAVED));
          }
        })
      );
  }

  @Action(RemoveWorkflowMapping)
  RemoveWorkflowMapping({ dispatch }: StateContext<WorkflowStateModel>, { payload, filters }: RemoveWorkflowMapping): Observable<void> {
    return this.workflowService.removeWorkflowMapping(payload)
      .pipe(tap(() => {
          dispatch(new GetWorkflowMappingPages(filters));
          return payload;
        }),
        catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
      );
  }

  @Action(GetRolesForWorkflowMapping)
  GetRolesForWorkflowMapping({ patchState }: StateContext<WorkflowStateModel>,{ }: GetRolesForWorkflowMapping): Observable<RolesPerUser[]>{
    return this.workflowService.getRolesForWorkflowMapping().pipe(
      tap((payload) => {
        patchState({ rolesPerUsers: payload });
        return payload;
      })
    );
  }

  @Action(GetUsersForWorkflowMapping)
  GetUsersForWorkflowMapping({ patchState }: StateContext<WorkflowStateModel>,{ }: GetUsersForWorkflowMapping): Observable<User[]>{
    return this.workflowService.getUsersForWorkflowMapping().pipe(
      tap((payload) => {
        patchState({ users: payload });
        return payload;
      })
    );
  }
}
