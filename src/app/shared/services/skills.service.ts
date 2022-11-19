import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable } from 'rxjs';
import {
  AssignedSkillsByOrganization,
  AssignedSkillTree,
  ListOfSkills,
  MasterSkillByOrganization,
  MasterSkillDataSources,
  MasterSkillFilters,
  Skill,
  SkillDataSource,
  SkillFilters,
  SkillsPage
} from '@shared/models/skill.model';
import { ExportPayload } from '@shared/models/export.model';
import { GRID_CONFIG } from '@shared/constants';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { sortBy } from '@shared/helpers/sort-array.helper';

@Injectable({ providedIn: 'root' })
export class SkillsService {
  constructor(private http: HttpClient) {}

  /**
   * Get all master skills
   * @return skills page
   */
  public getAllMasterSkills(): Observable<SkillsPage> {
    return this.http.get<SkillsPage>(`/api/masterSkills`, { params: { PageNumber: GRID_CONFIG.initialPage, PageSize: GRID_CONFIG.initialRowsPerPage } });
  }

  /**
   * Get all master skills array
   * @return list of master skills
   */
  public getAllMasterSkillsArray(): Observable<ListOfSkills[]> {
    return this.http.get<ListOfSkills[]>('/api/MasterSkills/listByActiveBusinessUnit').pipe(map((data) => sortByField(data, 'name')));
  }

  /**
   * Get master skills by page number
   * @param pageNumber
   * @param pageSize
   * @return list of master skills
   */
  public getMasterSkills(pageNumber: number, pageSize: number, filters?: MasterSkillFilters): Observable<SkillsPage> {
    if (filters) {
      filters.pageSize = pageSize;
      filters.pageNumber = pageNumber;
      return this.http.post<SkillsPage>(`/api/masterSkills/filter`, filters);
    }
    return this.http.get<SkillsPage>(`/api/masterSkills`, { params: { PageNumber: pageNumber, PageSize: pageSize } });
  }

  /**
   * Get all master skills by organization
   * @return list of master skills by organization
   */
  public getMasterSkillsByOrganization(): Observable<MasterSkillByOrganization[]> {
    return this.http.get<MasterSkillByOrganization[]>(`/api/masterSkills/listByOrganization`).pipe(map((data) => sortByField(data, 'name')
));
  }

  /**
   * Create or update master skill
   * @param skill object to save
   * @return Created/Updated master skill
   */
  public saveMasterSkill(skill: Skill): Observable<Skill> {
    return skill.id
      ? this.http.put<Skill>(`/api/masterSkills`, skill)
      : this.http.post<Skill>(`/api/masterSkills`, skill);
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
        filters.glNumbers = filters.glNumbers.map((val: string) => (val === 'blank' ? null : val)) as [];
      }
      return this.http.post<SkillsPage>(`/api/AssignedSkills/filter`, filters);
    }
    return this.http.get<SkillsPage>(`/api/AssignedSkills`, { params: { PageNumber: pageNumber, PageSize: pageSize } });
  }

  /**
   * Create or update Assigned skill
   * @param skill object to save
   * @return Created/Updated Assigned skill
   */
  public saveAssignedSkill(skill: Skill): Observable<Skill> {
    return skill.id
      ? this.http.put<Skill>(`/api/AssignedSkills`, skill)
      : this.http.post<Skill>(`/api/AssignedSkills`, skill);
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
    return this.http
      .get<SkillDataSource>(`/api/AssignedSkills/getAvailableData`)
      .pipe(map((data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [[key], sortBy(value)]))));
  }

  /**
   * Get all organization skills
   * @return list of master skills
   */
  public getAllOrganizationSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`/api/AssignedSkills/all`).pipe(map((data) => sortByField(data, 'skillDescription')));
  }

  /**
   * Get master skills filtering options
   * @return list of master skills filtering options
   */
  public getMasterSkillsDataSources(): Observable<MasterSkillDataSources> {
    return this.http.get<MasterSkillDataSources>(`/api/masterSkills/filteringOptions`).pipe(
      map((data) => ({
        skillCategories: sortByField(data.skillCategories, 'name'),
        skillAbbreviations: sortBy(data.skillAbbreviations),
        skillDescriptions: sortBy(data.skillDescriptions),
      }))
    );
  }

  public getAssignedSkillsTree(): Observable<AssignedSkillTree> {
    return this.http.get<AssignedSkillTree>('/api/AssignedSkills/assignedSkillsTree');
  }

  public saveAssignedSkillValue(treeValue: number[]): Observable<number[]> {
    return this.http.put<number[]>(`/api/AssignedSkills/assignSkills`, treeValue);
  }

  public getAssignedSkillsByOrganization(): Observable<AssignedSkillsByOrganization[]> {
    return this.http.get<AssignedSkillsByOrganization[]>(`/api/AssignedSkills/assignedSkillsForCurrentBusinessUnit`);
  }
}
