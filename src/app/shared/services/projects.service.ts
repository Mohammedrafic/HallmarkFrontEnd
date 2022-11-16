import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map, Observable } from 'rxjs';

import { ProjectName, ProjectType } from '@shared/models/project.model';
import {ProjectSpecialData} from "@shared/models/project-special-data.model";
import { sortByField } from '@shared/helpers/sort-by-field.helper';

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
    return this.http.get<ProjectType[]>(`/api/orders/projectTypes`).pipe(map((data) => sortByField(data, 'projectType')));
  }

  /**
   * Get project special data
   * @return list of project types
   */
  public getProjectSpecialData(lastSelectedBusinessUnitId?: number): Observable<ProjectSpecialData> {
    let headers = {};

    if (lastSelectedBusinessUnitId) {
      headers = new HttpHeaders({ 'selected-businessunit-id': `${lastSelectedBusinessUnitId}` });
    }
    return this.http.get<ProjectSpecialData>(`/api/orders/specialProjectData`, { headers }).pipe(
      map((data) => {
        const sortedFields: Record<string, string> = {
          poNumbers: 'poNumber',
          projectNames: 'projectName',
          specialProjectCategories: 'projectType',
        };

        return Object.fromEntries(
          Object.entries(data).map(([key, value]) => [[key], sortByField(value, sortedFields[key])])
        );
      })
    );
  }
}
