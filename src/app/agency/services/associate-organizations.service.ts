import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AssociateOrganizations,
  AssociateOrganizationsPage,
  FeeExceptionsInitialData,
  FeeSettings,
  JobDistribution,
  JobDistributionInitialData,
} from 'src/app/shared/models/associate-organizations.model';

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
    return this.http.get<AssociateOrganizationsPage>(`/api/AssociateOrganizations/${agencyId}`, {
      params: { PageNumber: pageNumber, PageSize: pageSize },
    });
  }

  /**
   * Get Fee Setting By Organization Id
   * @param agencyId
   * @return Base fee with fee exceptions
   */
  public getFeeSettingByOrganizationId(associateOrganizationId: number, PageNumber: number, PageSize: number): Observable<FeeSettings> {
    return this.http.get<FeeSettings>(`/api/AssociateOrganizations/${associateOrganizationId}/feeSettings`, {
      params: { PageNumber, PageSize },
    });
  }

  /**
   * Delete department
   * @param id
   */
  public deleteAssociateOrganizationsById(id: number): Observable<never> {
    return this.http.delete<never>(`/api/AssociateOrganizations/${id}`);
  }

  /**
   * Get Fee Exceptions Initial Data By Organization Id
   * @param OrganizationId
   * @return Initial Data for Fee Exceptions
   */
  public getFeeExceptionsInitialData(OrganizationId: number): Observable<FeeExceptionsInitialData> {
    return this.http.get<FeeExceptionsInitialData>(`/api/AssociateOrganizations/feeExceptionsInitialData`, {
      params: { OrganizationId },
    });
  }

  /**
   * Get Job Distribution Initial Data By Organization Id
   * @param OrganizationId
   * @return Initial Data for Job Distribution
   */
  public getJobDistributionInitialData(OrganizationId: number): Observable<JobDistributionInitialData> {
    return this.http.get<JobDistributionInitialData>(`/api/AssociateOrganizations/jobDistributionInitialData`, {
      params: { OrganizationId },
    });
  }

  /**
   * Save Job Distribution
   * @param JobDistribution
   * @return Job Distribution
   */
  public saveJobDistribution(jobDistribution: JobDistribution): Observable<JobDistribution> {
    return this.http.put<JobDistribution>(`/api/AssociateOrganizations/jobDistribution`, jobDistribution);
  }

    /**
   * Get Job Distribution By Organization Id
   * @param agencyId
   * @return Job Distribution
   */
     public getJobDistributionById(associateOrganizationId: number): Observable<JobDistribution> {
      return this.http.get<JobDistribution>(`/api/AssociateOrganizations/${associateOrganizationId}/jobDistribution`);
    }
}
