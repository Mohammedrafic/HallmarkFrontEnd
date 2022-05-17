import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrganizationSettingsGet, OrganizationSettingsPost } from '@shared/models/organization-settings.model';

@Injectable({ providedIn: 'root' })
export class OrganizationSettingsService {
  constructor(private http: HttpClient) { }

  /**
   * Get the list of organization settings
   * @param organizationId organization id to search by
   * @return Array of organization settings
   */
  public getOrganizationSettingsByOrganizationId(organizationId: number): Observable<OrganizationSettingsGet[]> {
    return this.http.get<OrganizationSettingsGet[]>(`/api/OrganizationSettings/${organizationId}`);
  }

  /**
   * Save the organization settings
   @param organizationSettings organization setting
   */
  public saveOrganizationSetting(organizationSettings: OrganizationSettingsPost): Observable<void> {
    return this.http.post<void>(`/api/OrganizationSettings/`, organizationSettings);
  }
}
