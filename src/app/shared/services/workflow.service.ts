import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  EditedWorkflowDto,
  WorkflowFilters,
  WorkflowFlags,
  WorkflowWithDetails,
  WorkflowWithDetailsPut,
} from '@shared/models/workflow.model';
import {
  RoleListsByPermission,
  UserListsByPermission,
  WorkflowMappingPage,
  WorkflowMappingPost,
} from '@shared/models/workflow-mapping.model';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  constructor(private http: HttpClient) {}

  public getWorkflows(flags: WorkflowFlags): Observable<WorkflowWithDetails[]> {
    const { includeInIRP, includeInVMS } = flags;
    return this.http.get<WorkflowWithDetails[]>(`/api/Workflows/byBusinessUnit`, { params: { includeInIRP, includeInVMS } });
  }

  public saveEditedWorkflow(workflow: EditedWorkflowDto): Observable<WorkflowWithDetails | void> {
    return this.http.post<WorkflowWithDetails | void>(`/api/workflows/edit`, workflow);
  }

  public saveWorkflow(workflow: WorkflowWithDetails): Observable<WorkflowWithDetails | void> {
    return workflow.id
      ? this.http.put<WorkflowWithDetails | void>(`/api/Workflows`, workflow)
      : this.http.post<WorkflowWithDetails | void>(`/api/workflows/create`, workflow);
  }

  public updateWorkflow(workflow: WorkflowWithDetailsPut): Observable<WorkflowWithDetails | void> {
    return this.http.put<WorkflowWithDetails | void>(`/api/Workflows`, workflow);
  }

  public removeWorkflow(workflow: WorkflowWithDetails): Observable<void> {
    return this.http.delete<void>(`/api/Workflows/${workflow.id}`);
  }

  public getWorkflowMappingPages(filters?: WorkflowFilters): Observable<WorkflowMappingPage> {
    if (filters) {
      return this.http.post<WorkflowMappingPage>(`/api/WorkflowMapping/filter`, filters);
    }
    return this.http.get<WorkflowMappingPage>(`/api/WorkflowMapping`);
  }

  public saveWorkflowMapping(workflowMapping: WorkflowMappingPost): Observable<WorkflowMappingPost | void> {
    return this.http.post<WorkflowMappingPost | void>(`/api/WorkflowMapping`, workflowMapping);
  }

  public updateWorkflowMapping(workflowMapping: WorkflowMappingPost): Observable<WorkflowMappingPost | void> {
    return this.http.put<WorkflowMappingPost | void>(`/api/WorkflowMapping`, workflowMapping);
  }

  public removeWorkflowMapping(mappingId: number): Observable<void> {
    return this.http.delete<void>(`/api/WorkflowMapping/${mappingId}`);
  }

  public getUsersForWorkflowMapping(): Observable<UserListsByPermission> {
    return this.http.get<UserListsByPermission>(`/api/WorkflowMapping/usersByPermission`);
  }

  public getRolesForWorkflowMapping(): Observable<RoleListsByPermission> {
    return this.http.get<RoleListsByPermission>(`/api/WorkflowMapping/rolesByPermission`);
  }
}
