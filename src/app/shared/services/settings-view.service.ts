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
  ): Observable<Record<string, string>> {
    const params = {
      SettingKeys: settingKeys,
      HierarchyId: id,
      HierarchyLevel: hierarchyLevel,
      ...organizationId ? { OrganizationId: organizationId } : {},
      ...includeInIrp ? { IsIRPConfiguration: includeInIrp }: {},
    };

    return this.http.get<Record<string, string>>('/api/OrganizationSettings/byKeys', { params: GetQueryParams(params) });
  }
}
