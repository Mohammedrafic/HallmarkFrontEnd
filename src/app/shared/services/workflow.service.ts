import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { WorkflowFilters, WorkflowFlags, WorkflowWithDetails, WorkflowWithDetailsPut } from '@shared/models/workflow.model';
import {
  RolesByPermission,
  UsersByPermission,
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

  public saveWorkflow(workflow: WorkflowWithDetails): Observable<WorkflowWithDetails | void> {
    return workflow.id
      ? this.http.put<WorkflowWithDetails | void>(`/api/Workflows`, workflow)
      : this.http.post<WorkflowWithDetails | void>(`/api/Workflows`, workflow);
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

  public removeWorkflowMapping(mappingId: number): Observable<void> {
    return this.http.delete<void>(`/api/WorkflowMapping/${mappingId}`);
  }

  public getUsersForWorkflowMapping(): Observable<UsersByPermission[]> {
    return this.http.get<any>(`/api/WorkflowMapping/usersByPermission`);
  }

  public getRolesForWorkflowMapping(): Observable<RolesByPermission[]> {
    return this.http.get<any>(`/api/WorkflowMapping/rolesByPermission`);
  }
}
