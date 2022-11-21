import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OrganizationalHierarchy, OrganizationSettingKeys } from '@shared/constants';

@Injectable()
export class SettingsViewService {
  constructor(private http: HttpClient) {}

  public getViewSettingKey(
    settingKeys: OrganizationSettingKeys,
    hierarchyLevel: OrganizationalHierarchy,
    id: number
  ): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(
      `/api/OrganizationSettings/byKeys?SettingKeys=${settingKeys}&HierarchyLevel=${hierarchyLevel}&HierarchyId=${id}`
    );
  }
}
