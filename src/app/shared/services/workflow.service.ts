import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { WorkflowWithDetails, WorkflowWithDetailsPut } from '@shared/models/workflow.model';
import { WorkflowMappingPage, WorkflowMappingPost } from '@shared/models/workflow-mapping.model';

@Injectable({ providedIn: 'root' })
export class WorkflowService {

  constructor(private http: HttpClient) {}

  /**
   * Get all workflows by businessUnitId
   * @param businessUnitId parameter to search by
   * @return workflows
   */
  public getWorkflows(businessUnitId: number | null): Observable<WorkflowWithDetails[]> {
    return this.http.get<WorkflowWithDetails[]>(`/api/Workflows/byBusinessUnit/`)
  }

  /**
   * Create or update workflow
   * @param workflow object to save
   * @return Created/Updated workflow
   */
  public saveWorkflow(workflow: WorkflowWithDetails): Observable<WorkflowWithDetails | void> {
    return workflow.id ?
      this.http.put<WorkflowWithDetails | void>(`/api/Workflows`, workflow) :
      this.http.post<WorkflowWithDetails | void>(`/api/Workflows`, workflow);
  }

  /**
   * Update workflow
   * @param workflow object to update
   * @return Updated workflow
   */
  public updateWorkflow(workflow: WorkflowWithDetailsPut): Observable<WorkflowWithDetails | void> {
    return this.http.put<WorkflowWithDetails | void>(`/api/Workflows`, workflow);
  }

  /**
   * Remove workflow by its id
   * @param workflow
   */
  public removeWorkflow(workflow: WorkflowWithDetails): Observable<void> {
    return this.http.delete<void>(`/api/Workflows/${workflow.id}`);
  }

  /**
   * Gets workflow mapping page
   */
  public getWorkflowMappingPages(): Observable<WorkflowMappingPage> {
    return this.http.get<WorkflowMappingPage>(`/api/WorkflowMapping`)
  }

  /**
   * Creates workflow mapping
   * @param workflowMapping object to save
   * @return Created workflow mapping
   */
  public saveWorkflowMapping(workflowMapping: WorkflowMappingPost): Observable<WorkflowMappingPost | void> {
    return this.http.post<WorkflowMappingPost | void>(`/api/WorkflowMapping`, workflowMapping);
  }

  /**
   * Remove workflow mapping by its mappingId
   * @param mappingId
   */
  public removeWorkflowMapping(mappingId: number): Observable<void> {
    return this.http.delete<void>(`/api/WorkflowMapping/${mappingId}`);
  }
}
