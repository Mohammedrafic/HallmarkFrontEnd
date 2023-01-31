import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  Agency,
  AgencyFilteringOptions,
  AgencyListFilters,
  AgencyPage,
  AgencyRegionSkills,
} from 'src/app/shared/models/agency.model';
import { ExportPayload } from '@shared/models/export.model';
import { sortBy } from '@shared/helpers/sort-array.helper';

@Injectable({
  providedIn: 'root',
})
export class AgencyService {
  constructor(private http: HttpClient) {}

  public getAgencies(
    PageNumber: number,
    PageSize: number,
    OrderBy: string,
    Filters: AgencyListFilters
  ): Observable<AgencyPage> {
    return this.http.post<AgencyPage>(`/api/Agency/filtered`, { PageNumber, PageSize, OrderBy, ...Filters });
  }

  /**
   * Get agency by id
   * @param id
   * @return specific agency
   */
  public getAgencyById(id: number): Observable<Agency> {
    return this.http.get<Agency>(`/api/agency/${id}`);
  }

  /**
   * Create or update agency
   * @param agency object to save
   * @return Created/Updated agency
   */
  public saveAgency(agency: Agency): Observable<Agency> {
    return agency.agencyDetails.id
      ? this.http.put<Agency>(`/api/agency`, agency)
      : this.http.post<Agency>(`/api/agency`, agency);
  }

  /**
   * Get the list of available business units
   * @return Array of units
   */
  public saveAgencyLogo(file: Blob, businessUnitId: number): Observable<any> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post(`/api/BusinessUnit/${businessUnitId}/logo`, formData);
  }

  public getAgencyLogo(businessUnitId: number): Observable<Blob> {
    return this.http.get(`/api/BusinessUnit/${businessUnitId}/logo`, { responseType: 'blob' });
  }

  /**
   * Remove logo
   * @param businessUnitId
   */
  public removeAgencyLogo(businessUnitId: number): Observable<never> {
    return this.http.delete<never>(`/api/BusinessUnit/${businessUnitId}/logo`);
  }

  /**
   * Export agency list
   * @param payload
   */
  public export(payload: ExportPayload): Observable<Blob> {
    return this.http.post(`/api/Agency/export`, payload, { responseType: 'blob' });
  }

  public getAgencyFilteringOptions(): Observable<AgencyFilteringOptions> {
    return this.http
      .get<AgencyFilteringOptions>(`/api/Agency/filteringOptions`)
      .pipe(map((data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [[key], sortBy(value)]))));
  }

  /**
   * Get the list of regions and skills
   * @return Object of regions and skills
   */
  public getAgencyRegionSkills(): Observable<AgencyRegionSkills> {
    return this.http.get<AgencyRegionSkills>('/api/AssociateOrganizations/agencyJobDistributionInitialData');
  }
}
