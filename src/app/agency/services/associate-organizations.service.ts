import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AssociateOrganizations, AssociateOrganizationsPage } from 'src/app/shared/models/associate-organizations.model';

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
}
