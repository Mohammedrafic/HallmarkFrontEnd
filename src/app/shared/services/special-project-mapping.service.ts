import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpecialProjectMapping, SpecialProjectMappingPage, SaveSpecialProjectMappingDto, ProjectNames, SpecialProjectMappingFilters } from 'src/app/shared/models/special-project-mapping.model';

@Injectable({ providedIn: 'root' })
export class SpecialProjectMappingService {

  constructor(private http: HttpClient) { }

  /**
 * Get all special project mappings
 * @return list of special projects
 */
  public getSpecialProjectMappings(filter: SpecialProjectMappingFilters): Observable<SpecialProjectMappingPage> {
    return this.http.post<SpecialProjectMappingPage>(`/api/SpecialProjectsSettings/setup/getFiltered`, filter);
  }

  /**
    * Get special project mapping by id
    * @return single special project mapping record
    */
  public getSpecialProjectMappingById(Id: number): Observable<SpecialProjectMapping> {
    return this.http.get<SpecialProjectMapping>(`/api/SpecialProjectsSettings/${Id}`);
  }

  /**
   * insert or update a special project mapping record
   * @return created/updated record
   */
  public saveSpecialProjectMapping(specialProjectMapping: SaveSpecialProjectMappingDto): Observable<SaveSpecialProjectMappingDto> {
    return this.http.post<SaveSpecialProjectMappingDto>(`/api/SpecialProjectsSettings/setup`, specialProjectMapping);
  }

  /**
   * Remove special project mapping by its id
   * @param id
   */
  public removeSpecialProjectMapping(id: number): Observable<any> {
    return this.http.delete<SpecialProjectMapping>(`/api/SpecialProjectsSettings/setup/${id}`);
  }

  /**
   * Get project names by type id
   * @return List project names by project category
   */
  public getProjectNamesByTypeId(Id: number): Observable<ProjectNames[]> {
    return this.http.get<ProjectNames[]>(`/api/SpecialProjectsSettings/Category/${Id}`);
  }
}

