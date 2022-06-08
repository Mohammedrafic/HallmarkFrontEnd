import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { CreateOrderDto, Order, Organization, OrganizationPage, OrganizationStructure } from 'src/app/shared/models/organization.model';
import { BusinessUnit } from 'src/app/shared/models/business-unit.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';

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
   * Get organization structure with its regions-locations-departments
   */
  public getOrganizationStructure(): Observable<OrganizationStructure> {
    return this.http.get<OrganizationStructure>(`/api/Organizations/structure`);
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

  /**
   * Remove logo
   * @param businessUnitId
   */
  public removeOrganizationLogo(businessUnitId: number): Observable<never> {
    return this.http.delete<never>(`/api/BusinessUnit/${businessUnitId}/logo`);
  }

  /**
   * Get the list of agencies for organization
   * @return Array of associate agencies
   */
  public getAssociateAgencies(): Observable<AssociateAgency[]> {
    return this.http.get<AssociateAgency[]>('/api/AssociateAgencies');
  }

  /**
   * Create order
   * @param order object to save
   * @return saved order
   */
  public saveOrder(order: CreateOrderDto, documents: Blob[]): Observable<Order> {
    return this.http.post<Order>('/api/Orders', order).pipe(switchMap(order => {
      const formData = new FormData();
      documents.forEach(document => formData.append('documents', document));
      return this.http.post(`/api/Orders/${order.id}/documents`, formData).pipe(map(() => order));
    }));
  }
}
