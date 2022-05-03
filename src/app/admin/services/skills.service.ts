import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Skill, SkillsPage } from 'src/app/shared/models/skill.model';

@Injectable({ providedIn: 'root' })
export class SkillsService {

  constructor(private http: HttpClient) { }

  /**
   * Get master skills by page number
   * @param pageNumber
   * @param pageSize
   * @return list of master skills
   */
  public getMasterSkills(pageNumber: number, pageSize: number): Observable<SkillsPage> {
    return this.http.get<any>(`/api/masterSkills`, { params: { PageNumber: pageNumber, PageSize: pageSize }});
  }

  /**
   * Create or update master skill
   * @param skill object to save
   * @return Created/Updated master skill
   */
  public saveMasterSkill(skill: Skill): Observable<Skill> {
    return skill.id ? 
      this.http.put<Skill>(`/api/masterSkills`, skill) :
      this.http.post<Skill>(`/api/masterSkills`, skill);
  }
  
  /**
   * Remove master skills by its id
   * @param skill
   */
  public removeMasterSkill(skill: Skill): Observable<any> {
    return this.http.delete<Skill>(`/api/masterSkills/${skill.id}`);
  }

  /**
   * Get Assigned skills by page number
   * @param pageNumber
   * @param pageSize
   * @return list of Assigned skills
   */
  public getAssignedSkills(pageNumber: number, pageSize: number): Observable<SkillsPage> {
    return this.http.get<any>(`/api/AssignedSkills`, { params: { PageNumber: pageNumber, PageSize: pageSize, organizationId: 7 }});
  }

  /**
   * Create or update Assigned skill
   * @param skill object to save
   * @return Created/Updated Assigned skill
   */
  public saveAssignedSkill(skill: Skill): Observable<Skill> {
    return skill.id ? 
      this.http.put<Skill>(`/api/AssignedSkills`, skill) :
      this.http.post<Skill>(`/api/AssignedSkills`, skill);
  }

  /**
   * Remove Assigned skills by its id
   * @param skill
   */
  public removeAssignedSkill(skill: Skill): Observable<any> {
    return this.http.delete<Skill>(`/api/AssignedSkills/${skill.id}`);
  }
}
