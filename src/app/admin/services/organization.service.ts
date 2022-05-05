import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization, OrganizationPage } from 'src/app/shared/models/organization.model';
import { BusinessUnit } from 'src/app/shared/models/business-unit.model';

@Injectable({ providedIn: 'root' })
export class OrganizationService {

  constructor(private http: HttpClient) { }

  /**
   * Get organizations by page number
   * @param pageNumber
   * @param pageSize
   * @return list of organizations
   */
  public getOrganizations(pageNumber: number, pageSize: number): Observable<OrganizationPage> {
    return this.http.get<OrganizationPage>(`/api/Organizations`, { params: { PageNumber: pageNumber, PageSize: pageSize }});
  }

  /**
   * Get organization by id
   * @param id
   * @return specific organization
   */
  public getOrganizationById(id: number): Observable<Organization> {
    return this.http.get<Organization>(`/api/Organizations/${id}`);
  }

  /**
   * Create or update organization
   * @param Organization object to save
   * @return Created/Updated organization
   */
  public saveOrganization(organization: Organization): Observable<Organization> {
    return organization.organizationId ? 
      this.http.put<Organization>(`/api/Organizations`, organization) :
      this.http.post<Organization>(`/api/Organizations`, organization);
  }

  /**
   * Get the list of available business units
   * @return Array of units
   */
  public getBusinessUnit(): Observable<BusinessUnit[]> {
    return this.http.get<BusinessUnit[]>(`/api/BusinessUnit`);
  }

  /**
   * Get the list of available business units
   * @return Array of units
   */
  public saveOrganizationLogo(file: Blob, businessUnitId: number): Observable<any> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post(`/api/BusinessUnit/${businessUnitId}/logo`, formData);
  }

  public getOrganizationLogo(businessUnitId: number): Observable<Blob> {
    return this.http.get(`/api/BusinessUnit/${businessUnitId}/logo`, { responseType: 'blob' });
  }
}
