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
  RemoveWorkflowSucceed,
  SaveWorkflow,
  SaveWorkflowMapping,
  UpdateWorkflow
} from './workflow.actions';
import { WorkflowService } from '@shared/services/workflow.service';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { Step, WorkflowWithDetails } from '@shared/models/workflow.model';
import { WorkflowMappingPage, WorkflowMappingPost } from '@shared/models/workflow-mapping.model';

export interface WorkflowStateModel {
  workflows: WorkflowWithDetails[] | null,
  workflowMappingPages: WorkflowMappingPage | null
}

@State<WorkflowStateModel>({
  name: 'workflow',
  defaults: {
    workflows: [],
    workflowMappingPages: null
  }
})
@Injectable()
export class WorkflowState {
  @Selector()
  static workflows(state: WorkflowStateModel): WorkflowWithDetails[] | null { return state.workflows; }

  @Selector()
  static workflowMappingPages(state: WorkflowStateModel): WorkflowMappingPage | null { return state.workflowMappingPages; }

  constructor(private workflowService: WorkflowService) {}

  @Action(GetWorkflows)
  GetWorkflows({ patchState, dispatch }: StateContext<WorkflowStateModel>, { businessUnitId }: GetWorkflows): Observable<WorkflowWithDetails[]> {
    return this.workflowService.getWorkflows(businessUnitId).pipe(tap((payload) => {
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
          dispatch(new GetWorkflows(payload.businessUnitId));
          return payloadResponse;
        }),
        catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
      );
  }

  @Action(UpdateWorkflow)
  UpdateWorkflow({ patchState, dispatch }: StateContext<WorkflowStateModel>, { workflow, businessUnitId, isRemoveStep }: UpdateWorkflow): Observable<WorkflowWithDetails | void> {
    return this.workflowService.updateWorkflow(workflow)
      .pipe(tap((payloadResponse) => {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED))
          dispatch(new GetWorkflows(businessUnitId));
          if (isRemoveStep) {
            dispatch(new RemoveWorkflowSucceed());
          }
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
          dispatch(new GetWorkflows(payload.businessUnitId));
          return payload;
        }),
        catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail))));
  }

  @Action(GetWorkflowMappingPages)
  GetWorkflowMappingPages({ patchState }: StateContext<WorkflowStateModel>, { }: GetWorkflowMappingPages): Observable<GetWorkflowMappingPages> {
    return this.workflowService.getWorkflowMappingPages().pipe(tap((payload) => {
      patchState({ workflowMappingPages: payload });
      return payload;
    }));
  }

  @Action(SaveWorkflowMapping)
  SaveWorkflowMapping({ patchState, dispatch }: StateContext<WorkflowStateModel>, { payload }: SaveWorkflowMapping): Observable<WorkflowMappingPost | void> {
    return this.workflowService.saveWorkflowMapping(payload)
      .pipe(tap((payloadResponse) => {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
          dispatch(new GetWorkflowMappingPages());
          return payloadResponse;
        }),
        catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
      );
  }

  @Action(RemoveWorkflowMapping)
  RemoveWorkflowMapping({ patchState, dispatch }: StateContext<WorkflowStateModel>, { payload }: RemoveWorkflowMapping): Observable<void> {
    return this.workflowService.removeWorkflowMapping(payload)
      .pipe(tap(() => {
          dispatch(new GetWorkflowMappingPages());
          return payload;
        }),
        catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
      );
  }
}
