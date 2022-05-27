import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { GetWorkflows, GetWorkflowsSucceed, RemoveWorkflow, SaveWorkflow, UpdateWorkflow } from './workflow.actions';
import { WorkflowService } from '@shared/services/workflow.service';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { WorkflowWithDetails } from '@shared/models/workflow.model';

export interface WorkflowStateModel {
  workflows: WorkflowWithDetails[] | null;
}

@State<WorkflowStateModel>({
  name: 'workflow',
  defaults: {
    workflows: []
  }
})
@Injectable()
export class WorkflowState {
  @Selector()
  static workflows(state: WorkflowStateModel): WorkflowWithDetails[] | null { return state.workflows; }

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
  UpdateWorkflow({ patchState, dispatch }: StateContext<WorkflowStateModel>, { workflow, businessUnitId }: UpdateWorkflow): Observable<WorkflowWithDetails | void> {
    return this.workflowService.updateWorkflow(workflow)
      .pipe(tap((payloadResponse) => {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED))
          dispatch(new GetWorkflows(businessUnitId));
          return payloadResponse;
        }),
        catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
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
}
