import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AssociateOrganizationsAgency,
  AssociateOrganizationsAgencyPage,
  FeeSettings,
  JobDistributionInitialData,
  PartnershipSettings,
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
  public invateOrganizations(
    businessUnitId: number,
    organizationIds: number[]
  ): Observable<AssociateOrganizationsAgency[]> {
    return this.http.post<AssociateOrganizationsAgency[]>(`/api/AssociateOrganizations`, {
      businessUnitId,
      organizationIds,
    });
  }

  /**
   * Get Associate Organizations by Agency ID
   * @param agencyId
   * @param pageNumber
   * @param pageSize
   * @return list of Associate Organizations
   */
  public getOrganizationsById(
    agencyId: number,
    pageNumber: number,
    pageSize: number
  ): Observable<AssociateOrganizationsAgencyPage> {
    return this.http.get<AssociateOrganizationsAgencyPage>(`/api/AssociateOrganizations/${agencyId}`, {
      params: { PageNumber: pageNumber, PageSize: pageSize },
    });
  }

  /**
   * Get Fee Setting By Organization Id
   * @param agencyId
   * @return Base fee with fee exceptions
   */
  public getFeeSettingByOrganizationId(
    associateOrganizationId: number,
    PageNumber: number,
    PageSize: number
  ): Observable<FeeSettings> {
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
   * Save Partnership Settings
   * @param PartnershipSettings
   * @return Partnership Settings
   */
  public savePartnershipSettings(jobDistribution: PartnershipSettings): Observable<PartnershipSettings> {
    return this.http.put<PartnershipSettings>(`/api/AssociateOrganizations/partnershipSettings`, jobDistribution);
  }

  /**
   * Get Partnership SettingsBy Organization Id
   * @param associateOrganizationId
   * @return Partnership Settings
   */
  public getPartnershipSettingsById(associateOrganizationId: number): Observable<PartnershipSettings> {
    return this.http.get<PartnershipSettings>(
      `/api/AssociateOrganizations/${associateOrganizationId}/partnershipSettings`
    );
  }

  /**
   * Save Base Fee
   * @param associateOrganizationId
   * @return FeeSettings
   */
  public saveBaseFee(associateOrganizationId: number, baseFee: number): Observable<FeeSettings> {
    return this.http.put<FeeSettings>(`/api/AssociateOrganizations/baseFee`, { associateOrganizationId, baseFee });
  }
}
