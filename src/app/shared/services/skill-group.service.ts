import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CredentialSkillGroup, CredentialSkillGroupPage } from '@shared/models/skill-group.model';
import { SkillGroupMapping } from '@shared/models/credential-group-mapping.model';
import { ExportPayload } from '@shared/models/export.model';

@Injectable({ providedIn: 'root' })
export class SkillGroupService {

  constructor(private http: HttpClient) {}

  /**
   * Get all skill group pages
   * @return skill group pages
   */
  public getSkillGroups(): Observable<CredentialSkillGroupPage> {
    return this.http.get<CredentialSkillGroupPage>(`/api/SkillGroups/organization`)
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

  /**
   * Get all skill groups mapping
   * @return skill groups mapping
   */
  public getSkillGroupsMapping(): Observable<SkillGroupMapping[]> {  // TODO: deprecated, can be removed after verification
    return this.http.get<SkillGroupMapping[]>(`/api/SkillGroupsMapping`);
  }

  /**
   * Create or update skill group mapping
   * @param skillGroupMapping object to save
   * @return Created/Updated skill group mapping
   */
  public saveUpdateSkillGroupMapping(skillGroupMapping: SkillGroupMapping): Observable<SkillGroupMapping> { // TODO: deprecated, can be removed after verification
    return skillGroupMapping.mappingId ?
      this.http.put<SkillGroupMapping>(`/api/SkillGroupsMapping`, skillGroupMapping) :
      this.http.post<SkillGroupMapping>(`/api/SkillGroupsMapping`, skillGroupMapping);
  }

  /**
   * Remove skill group mapping by its id
   * @param skillGroupMappingId
   */
  public removeSkillGroupMapping(skillGroupMappingId: number): Observable<void> { // TODO: deprecated, can be removed after verification
    return this.http.delete<void>(`/api/SkillGroupsMapping/${skillGroupMappingId}`);
  }

  /**
   * Export credential list
   */
  public exportCredentialTypes(payload: ExportPayload): Observable<any> {
    return this.http.post(`/api/MasterCredentials/export`, payload, { responseType: 'blob' });
  }
}
