import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { SkillGroup } from '../../shared/models/skill-group.model';

@Injectable({ providedIn: 'root' })
export class SkillGroupService {

  constructor(private http: HttpClient) {}

  /**
   * Get all skill groups by organization id
   * @return skill groups
   */
  public getSkillGroups(organizationId: number): Observable<SkillGroup[]> {
    return this.http.get<SkillGroup[]>(`/api/SkillGroups/organization/${organizationId}`)
  }

  /**
   * Create or update skill group
   * @param skillGroup object to save
   * @return Created/Updated skill group
   */
  public saveUpdateSkillGroup(skillGroup: SkillGroup): Observable<SkillGroup> {
    return skillGroup.id ?
      this.http.put<SkillGroup>(`/api/SkillGroups`, skillGroup) :
      this.http.post<SkillGroup>(`/api/SkillGroups`, skillGroup);
  }

  /**
   * Remove skill group by its id
   * @param skillGroup
   */
  public removeSkillGroup(skillGroup: SkillGroup): Observable<void> {
    return this.http.delete<void>(`/api/SkillGroups/${skillGroup.id}`);
  }
}
