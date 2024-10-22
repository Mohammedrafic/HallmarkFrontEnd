import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map, Observable } from 'rxjs';

import { GetQueryParams } from '@core/helpers';
import { OrganizationSettingFilter, Configuration, ConfigurationDTO } from '@shared/models/organization-settings.model';
import { sortBy } from '@shared/helpers/sort-array.helper';

@Injectable({ providedIn: 'root' })
export class OrganizationSettingsService {
  constructor(private http: HttpClient) { }

  /**
   * Get the list of organization settings
   * @param organizationId organization id to search by
   * @return Array of organization settings
   */
  public getOrganizationSettings(
    filters?: OrganizationSettingFilter,
    lastSelectedBusinessUnitId?: number
  ): Observable<Configuration[]> {
    let headers = {};
    if (lastSelectedBusinessUnitId) {
      headers = new HttpHeaders({ 'selected-businessunit-id': `${lastSelectedBusinessUnitId}` });
    }

    if (filters) {
      return this.http.post<Configuration[]>(`/api/OrganizationSettings/filter`, filters);
    }
    return this.http.get<Configuration[]>(`/api/OrganizationSettings/`, { headers });
  }

  /**
   * Save the organization settings
   @param organizationSettings organization setting
   */
  public saveOrganizationSetting(organizationSettings: ConfigurationDTO): Observable<void> {
    return this.http.post<void>(`/api/OrganizationSettings/`, organizationSettings);
  }

  /**
   * Get organization settings filtering options
   */
  public getOrganizationSettingsFilteringOptions(includeInIRP?: boolean, includeInVMS?: boolean): Observable<string[]> {
    const params = includeInIRP && includeInVMS || !includeInIRP && !includeInVMS
      ? {} : { includeInIRP, includeInVMS };

    return this.http.get<string[]>(
      `/api/OrganizationSettings/filteringOptions`,
      { params: GetQueryParams(params) }
    ).pipe(map((data) => sortBy(data)));
  }
  public deleteOrganizationSettingValues(settingValueId?:Number):Observable<any>{
    return this.http.delete<any>(`/api/OrganizationSettings/${settingValueId}`);
  }
}
