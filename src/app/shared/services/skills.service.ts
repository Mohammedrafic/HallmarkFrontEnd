import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { MasterSkillByOrganization, Skill, SkillDataSource, SkillFilters, SkillsPage } from '@shared/models/skill.model';
import { ExportPayload } from '@shared/models/export.model';

@Injectable({ providedIn: 'root' })
export class SkillsService {

  constructor(private http: HttpClient) { }

  /**
   * Get all master skills
   * @return list of master skills
   */
  public getAllMasterSkills(): Observable<SkillsPage> {
    return this.http.get<any>(`/api/masterSkills`, { params: { PageNumber: 1, PageSize: 100 }}); // TODO: need API to get all skills
  }

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
   * Get all master skills by organization
   * @return list of master skills by organization
   */
  public getMasterSkillsByOrganization(): Observable<MasterSkillByOrganization[]> {
    return this.http.get<MasterSkillByOrganization[]>(`/api/masterSkills/listByOrganization`);
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
  public getAssignedSkills(pageNumber: number, pageSize: number, filters: SkillFilters): Observable<SkillsPage> {
    if (Object.keys(filters).length) {
      filters.pageNumber = pageNumber;
      filters.pageSize = pageSize;
      filters.allowOnboard = filters.allowOnboard || null;
      if (filters.glNumbers) {
        filters.glNumbers = filters.glNumbers.map((val: string) => val === 'blank' ? null : val) as [];
      }
      return this.http.post<SkillsPage>(`/api/AssignedSkills/filter`, filters);
    }
    return this.http.get<SkillsPage>(`/api/AssignedSkills`, { params: { PageNumber: pageNumber, PageSize: pageSize }});
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

  /**
   * Export skills
   */
  public export(payload: ExportPayload): Observable<any> {
    if (payload.ids) {
      return this.http.post(`/api/masterSkills/export/byIds`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/masterSkills/export`, payload, { responseType: 'blob' });
  }

  /**
   * Export assigned skills
   */
  public exportAssignedSkills(payload: ExportPayload): Observable<any> {
    if (payload.ids) {
      return this.http.post(`/api/AssignedSkills/export/byIds`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/AssignedSkills/export`, payload, { responseType: 'blob' });
  }

  /**
   * Get Assigned skills data sources for filter dropdown
   * @return list of skill descriptions, abbrs, GL numbers
   */
  public getSkillsDataSources(): Observable<SkillDataSource> {
    return this.http.get<SkillDataSource>(`/api/AssignedSkills/getAvailableData`);
  }

  /**
   * Get all organization skills
   * @return list of master skills
   */
  public getAllOrganizationSkills(): Observable<SkillsPage> {
    return this.http.get<any>(`/api/AssignedSkills/all`);
  }
}
