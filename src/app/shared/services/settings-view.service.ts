import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OrganizationalHierarchy, OrganizationSettingKeys } from '@shared/constants';
import { GetQueryParams } from '@core/helpers';

@Injectable()
export class SettingsViewService {
  constructor(private http: HttpClient) {}

  public getViewSettingKey(
    settingKeys: OrganizationSettingKeys,
    hierarchyLevel: OrganizationalHierarchy,
    id: number,
    organizationId?: number,
    includeInIrp = false,
    jobId?: number
  ): Observable<Record<string, string>> {
    const params = {
      SettingKeys: settingKeys,
      HierarchyId: id,
      HierarchyLevel: hierarchyLevel,
      IsIRPConfiguration: includeInIrp,
      ...organizationId ? { OrganizationId: organizationId } : {},
      ...jobId ? { JobId: jobId } : {}
    };
    const url = includeInIrp ? '/api/OrganizationSettings/hierarchy/byKeys' : '/api/OrganizationSettings/byKeys';

    return this.http.get<Record<string, string>>(url, { params: GetQueryParams(params) });
  }
}
