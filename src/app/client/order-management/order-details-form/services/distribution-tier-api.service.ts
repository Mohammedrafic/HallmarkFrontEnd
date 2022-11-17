import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OrganizationalHierarchy, OrganizationSettingKeys } from '@shared/constants';

@Injectable()
export class DistributionTierApiService {
  constructor(private http: HttpClient) {}

  public getTierSettingsForDistribution(
    settingKeys: OrganizationSettingKeys,
    hierarchyLevel: OrganizationalHierarchy,
    id: number
  ): Observable<{TieringLogic: boolean}> {
    return this.http.get<{TieringLogic: boolean}>(
      `/api/OrganizationSettings/byKeys?SettingKeys=${settingKeys}&HierarchyLevel=${hierarchyLevel}&HierarchyId=${id}`
    );
  }
}
