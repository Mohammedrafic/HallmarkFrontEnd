import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpecialProject, SpecialProjectPage } from 'src/app/shared/models/special-project.model';

@Injectable({ providedIn: 'root' })
export class SpecialProjectService {

  constructor(private http: HttpClient) { }

  /**
 * Get all special projects
 * @return list of special projects
 */
  public getSpecialProjects(): Observable<SpecialProjectPage> {
    return this.http.get<SpecialProjectPage>(`/api/SpecialProjects`);
  }

  /**
    * Get special project by id
    * @return single special project record
    */
  public getSpecialProjectById(Id: number): Observable<SpecialProject> {
    return this.http.get<SpecialProject>(`/api/SpecialProjects/${Id}`);
  }

  /**
   * Get special project by name
   * @return single special project record
   */
  public getSpecialProjectByName(name: string): Observable<SpecialProject[]> {
    return this.http.get<SpecialProject[]>(`/api/SpecialProjects/${name}`);
  }

  /**
   * insert or update a special project record
   * @return created/updated record
   */
  public saveSpecialProject(specialProject: SpecialProject): Observable<SpecialProject> {
    return this.http.put<SpecialProject>(`/api/SpecialProjects/`, specialProject);
  }

  /**
   * Remove special project by its id
   * @param id
   */
  public removeSpecialProject(id: number): Observable<any> {
    return this.http.delete<SpecialProject>(`/api/SpecialProjects?id=${id}`);
  }
}

