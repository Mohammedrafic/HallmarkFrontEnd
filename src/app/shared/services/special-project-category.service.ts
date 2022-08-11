import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpecialProjectCategory, SpecialProjectCategoryPage } from 'src/app/shared/models/special-project-category.model';

@Injectable({ providedIn: 'root' })
export class SpecialProjectCategoryService {

  constructor(private http: HttpClient) { }

  /**
 * Get all special project categories
 * @return list of special project categories
 */
  public getSpecialProjectCategories(): Observable<SpecialProjectCategoryPage> {
    return this.http.get<SpecialProjectCategoryPage>(`/api/ProjectCategories`);
  }

  /**
    * Get special project category by id
    * @return single special project category record
    */
  public getSpecialProjectCategoryById(Id: number): Observable<SpecialProjectCategory> {
    return this.http.get<SpecialProjectCategory>(`/api/ProjectCategories/${Id}`);
  }

  /**
   * Get special project categories by name
   * @return list special project categories
   */
  public getSpecialProjectCategoryByName(name: string): Observable<SpecialProjectCategory[]> {
    return this.http.get<SpecialProjectCategory[]>(`/api/ProjectCategories/${name}`);
  }

  /**
   * insert or update a special project category record
   * @return created/updated record
   */
  public saveSpecialProjectCategory(specialProjectCategory: SpecialProjectCategory): Observable<SpecialProjectCategory> {
    return this.http.put<SpecialProjectCategory>(`/api/ProjectCategories/`, specialProjectCategory);
  }

  /**
   * Remove special project category by its id
   * @param id
   */
  public removeSpecialProjectCategory(id: number): Observable<any> {
    return this.http.delete<SpecialProjectCategory>(`/api/ProjectCategories?id=${id}`);
  }
}

