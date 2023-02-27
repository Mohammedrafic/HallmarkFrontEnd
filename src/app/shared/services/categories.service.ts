import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable } from 'rxjs';
import { SkillCategoriesPage, SkillCategory } from 'src/app/shared/models/skill-category.model';
import { ExportPayload } from '@shared/models/export.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { SkillParams } from '@client/order-management/interfaces';

@Injectable({ providedIn: 'root' })
export class CategoriesService {

  constructor(private http: HttpClient) { }

  /**
   * Get skills categories by page number
   * @param pageNumber
   * @param pageSize
   * @return list of skills categories
   */
  public getSkillsCategories(pageNumber: number, pageSize: number): Observable<SkillCategoriesPage> {
    return this.http.get<SkillCategoriesPage>(`/api/skillCategories`, { params: { PageNumber: pageNumber, PageSize: pageSize }});
  }

  /**
   * Get all skills categories by page number
   * @return list of skills categories
   */
  public getAllSkillsCategories(params?: SkillParams): Observable<SkillCategoriesPage> {
    let getParams;
    if (params) {
      getParams = { params: { SystemType: params.params.SystemType, PageNumber: 1, PageSize: 2147483647 }};
    } else {
      getParams = { params: { PageNumber: 1, PageSize: 2147483647 }};
    }
    return this.http.get<SkillCategoriesPage>(`/api/skillCategories`, getParams).pipe(map((data) => ({
      ...data,
      items: sortByField(data.items, 'name')
    })));
  }

  /**
   * Create or update skill category
   * @param skillCategory object to save
   * @return Created/Updated category
   */
  public saveSkillCategory(skillCategory: SkillCategory): Observable<SkillCategory> {
    return skillCategory.id ? 
      this.http.put<SkillCategory>(`/api/SkillCategories`, skillCategory) :
      this.http.post<SkillCategory>(`/api/SkillCategories`, skillCategory);
  }

  /**
   * Remove skills categories by its id
   * @param skillCategory
   */
  public removeSkillCategory(skillCategory: SkillCategory): Observable<any> {
    return this.http.delete<SkillCategory>(`/api/skillCategories/${skillCategory.id}`);
  }

  /**
   * Export skill categories
   */
  public export(payload: ExportPayload): Observable<any> {
    if (payload.ids) {
      return this.http.post(`/api/skillCategories/export/byIds`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/skillCategories/export`, payload, { responseType: 'blob' });
  }
}
