import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrganizationSettingFilter, OrganizationSettingsGet, OrganizationSettingsPost } from '@shared/models/organization-settings.model';

@Injectable({ providedIn: 'root' })
export class OrganizationSettingsService {
  constructor(private http: HttpClient) { }

  /**
   * Get the list of organization settings
   * @param organizationId organization id to search by
   * @return Array of organization settings
   */
  public getOrganizationSettings(filters?: OrganizationSettingFilter): Observable<OrganizationSettingsGet[]> {
    if (filters) {
      return this.http.post<OrganizationSettingsGet[]>(`/api/OrganizationSettings/filter`, filters);
    }
    return this.http.get<OrganizationSettingsGet[]>(`/api/OrganizationSettings/`);
  }

  /**
   * Save the organization settings
   @param organizationSettings organization setting
   */
  public saveOrganizationSetting(organizationSettings: OrganizationSettingsPost): Observable<void> {
    return this.http.post<void>(`/api/OrganizationSettings/`, organizationSettings);
  }

  /**
   * Get organization settings filtering options
   */
  public getOrganizationSettingsFilteringOptions(): Observable<string[]> {
    return this.http.get<string[]>(`/api/OrganizationSettings/filteringOptions`);
  }
}
