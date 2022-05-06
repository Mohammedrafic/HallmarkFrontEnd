import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AssociateOrganizations, AssociateOrganizationsPage, FeeSettings } from 'src/app/shared/models/associate-organizations.model';

@Injectable({
  providedIn: 'root',
})
export class AssociateOrganizationsService {
  constructor(private http: HttpClient) {}
  /**
   * Invate Organization to unit
   * @param businessUnitId
   * @param organizationIds
   * @return Created Organization
   */
  public invateOrganizations(businessUnitId: number, organizationIds: number[]): Observable<AssociateOrganizations[]> {
    return this.http.post<AssociateOrganizations[]>(`/api/AssociateOrganizations`, { businessUnitId, organizationIds });
  }

  /**
   * Get Associate Organizations by Agency ID
   * @param agencyId
   * @param pageNumber
   * @param pageSize
   * @return list of Associate Organizations
   */
  public getOrganizationsById(agencyId: number, pageNumber: number, pageSize: number): Observable<AssociateOrganizationsPage> {
    return this.http.get<AssociateOrganizationsPage>(`/api/AssociateOrganizations/${agencyId}`, { params: { PageNumber: pageNumber, PageSize: pageSize } });
  }

  /**
   * Get Fee Setting By Organization Id
   * @param agencyId
   * @return Base fee with fee exceptions
   */
  public getFeeSettingByOrganizationId(associateOrganizationId: number): Observable<FeeSettings> {
    return this.http.get<FeeSettings>(`/api/AssociateOrganizations/${associateOrganizationId}/feeSettings`);
  }
}
