import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';

@Injectable({ providedIn: 'root' })
export class SkillGroupService {

  constructor(private http: HttpClient) {}

  /**
   * Get all skill groups
   * @return skill groups
   */
  public getSkillGroups(): Observable<CredentialSkillGroup[]> {
    return this.http.get<CredentialSkillGroup[]>(`/api/SkillGroups`)
  }

  /**
   * Create or update skill group
   * @param skillGroup object to save
   * @return Created/Updated skill group
   */
  public saveUpdateSkillGroup(skillGroup: CredentialSkillGroup): Observable<CredentialSkillGroup> {
    return skillGroup.id ?
      this.http.put<CredentialSkillGroup>(`/api/SkillGroups`, skillGroup) :
      this.http.post<CredentialSkillGroup>(`/api/SkillGroups`, skillGroup);
  }

  /**
   * Remove skill group by its id
   * @param skillGroup
   */
  public removeSkillGroup(skillGroup: CredentialSkillGroup): Observable<void> {
    return this.http.delete<void>(`/api/SkillGroups/${skillGroup.id}`);
  }
}
