import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { SkillCategoriesPage, SkillCategory } from 'src/app/shared/models/skill-category.model';

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
  public getAllSkillsCategories(): Observable<SkillCategoriesPage> {
    return this.http.get<SkillCategoriesPage>(`/api/skillCategories`, { params: { PageNumber: 1, PageSize: 100 }});
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

}
