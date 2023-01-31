import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AgencySettingKeys } from '@shared/constants/agency-settings';
import { Observable } from 'rxjs';

@Injectable()
export class AgencySettingsService {
  constructor(private http: HttpClient) {}

  /**
   * Get agency by id
   * @param key - agency setting id
   * @return value of specific setting
   */
  public getAgencySettingByKey(key: AgencySettingKeys): Observable<boolean> {
    return this.http.get<boolean>(`/api/AgencySettings`, { params: { key }});
  }

  /**
   * Check if candidate profile can be edited
   * @param id - candidate profile id
   * @return flag
   */
  public isCandidateUserCreated(CandidateProfileId: number): Observable<boolean> {
    return this.http.get<boolean>(`/api/CandidateProfile/canProfileBeEdited`, { params: { CandidateProfileId }});
  }
}
