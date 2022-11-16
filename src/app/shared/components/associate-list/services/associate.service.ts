import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  AssociateOrganizationsAgency,
  AssociateOrganizationsAgencyPage,
  FeeExceptionsDTO,
  FeeExceptionsInitialData,
  FeeExceptionsPage,
  FeeSettings,
  JobDistributionInitialData,
  PartnershipSettings,
} from '@shared/models/associate-organizations.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';

@Injectable()
export class AssociateService {
  constructor(private http: HttpClient) {}

  /**
   * @param pageNumber,
   * @param pageSize
   * @return associate list
   */
  public getAssociateListByPage(pageNumber: number, pageSize: number): Observable<AssociateOrganizationsAgencyPage> {
    return this.http.get<any>(
      `/api/AssociateOrganizations/associateBusinessUnits?PageNumber=${pageNumber}&PageSize=${pageSize}`
    );
  }

  /**
   * Get Fee Setting By Organization / Agency Id
   * @param associateOrganizationAgencyId,
   * @param PageNumber,
   * @param PageSize,
   * @return Base fee with fee exceptions
   */
  public getFeeSettingByOrganizationId(
    associateOrganizationAgencyId: number,
    PageNumber: number,
    PageSize: number
  ): Observable<FeeSettings> {
    return this.http.get<FeeSettings>(`/api/AssociateOrganizations/${associateOrganizationAgencyId}/feeSettings`, {
      params: { PageNumber, PageSize },
    });
  }

  /**
   * Save Base Fee
   * @param associateOrganizationAgencyId,
   * @param baseFee,
   * @return FeeSettings
   */
  public saveBaseFee(associateOrganizationAgencyId: number, baseFee: number): Observable<FeeSettings> {
    return this.http.put<FeeSettings>(`/api/AssociateOrganizations/baseFee`, {
      associateOrganizationId: associateOrganizationAgencyId,
      baseFee,
    });
  }

  /**
   * Get Job Distribution Initial Data By Organization / Agency Id
   * @return Initial Data for Job Distribution
   */
  public getJobDistributionInitialData(): Observable<JobDistributionInitialData> {
    return this.http.get<JobDistributionInitialData>(`/api/AssociateOrganizations/agencyJobDistributionInitialData`);
  }

  /**
   * Get Partnership SettingsBy Organization /Agency Id
   * @param associateOrganizationAgencyId
   * @return Partnership Settings
   */
  public getPartnershipSettingsById(associateOrganizationAgencyId: number): Observable<PartnershipSettings> {
    return this.http.get<PartnershipSettings>(
      `/api/AssociateOrganizations/${associateOrganizationAgencyId}/partnershipSettings`
    );
  }

  /**
   * Save Partnership Settings
   * @param jobDistribution
   * @return Partnership Settings
   */
  public savePartnershipSettings(jobDistribution: PartnershipSettings): Observable<PartnershipSettings> {
    return this.http.put<PartnershipSettings>(`/api/AssociateOrganizations/partnershipSettings`, jobDistribution);
  }

  /**
   * Delete department
   * @param id
   */
  public deleteAssociateOrganizationsAgencyById(id: number): Observable<never> {
    return this.http.delete<never>(`/api/AssociateOrganizations/${id}`);
  }

  /**
   * @return associate Agency / Org
   */
  public getAssociateAgencyOrg(): Observable<string> {
    return this.http.get<string>('/api/businessUnit/basicInfo');
  }

  /**
   * Invite Organization / Agency to unit
   * @param organizationAgencyIds
   * @return Created Organization / Agency
   */
  public inviteOrganizationsAgency(organizationAgencyIds: number[]): Observable<AssociateOrganizationsAgency[]> {
    return this.http.post<AssociateOrganizationsAgency[]>(`/api/AssociateOrganizations`, {
      businessUnitIds: organizationAgencyIds,
    });
  }

  /**
   * Save FeeExceptions
   * @param feeExceptions
   * @return UpdatedFeeExceptionsPage
   */
  public saveFeeExceptions(feeExceptions: FeeExceptionsDTO): Observable<FeeExceptionsPage> {
    return this.http.put<FeeExceptionsPage>(`/api/FeeExceptions`, feeExceptions);
  }

  /**
   * Remove FeeExceptions
   * @param id
   */
  public removeFeeExceptionsById(id: number): Observable<never> {
    return this.http.delete<never>(`/api/FeeExceptions/${id}`);
  }

  /**
   * Get Fee Exceptions Initial Data By Organization Id
   * @param organizationAgencyId
   * @return Initial Data for Fee Exceptions
   */
  public getFeeExceptionsInitialData(organizationAgencyId: number): Observable<FeeExceptionsInitialData> {
    return this.http.get<FeeExceptionsInitialData>(`/api/FeeExceptions/initialData`, {
      params: { OrganizationId: organizationAgencyId },
    }).pipe(map((data) => { 
      const sortedFields: Record<keyof FeeExceptionsInitialData, string> = {
        regions: 'name',
        masterSkills: 'skillDescription'
      }
      return Object.fromEntries(Object.entries(data).map(([key, value]) => [[key], sortByField(value, sortedFields[key as keyof FeeExceptionsInitialData])]))}));
  }
}
