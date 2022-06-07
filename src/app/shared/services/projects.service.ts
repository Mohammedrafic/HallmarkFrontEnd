import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ProjectName, ProjectType } from '@shared/models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsService {

  constructor(private http: HttpClient) { }

  /**
   * Get all project names
   * @return list of project names
   */
  public getProjectNames(): Observable<ProjectName[]> {
    return this.http.get<ProjectName[]>(`/api/orders/projectNames`);
  }

  /**
   * Get all project types
   * @return list of project types
   */
  public getProjectTypes(): Observable<ProjectType[]> {
    return this.http.get<ProjectType[]>(`/api/orders/projectTypes`);
  }
}