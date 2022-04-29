import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Region } from '../../shared/models/region.model';

@Injectable({ providedIn: 'root' })
export class RegionService {

  constructor(private http: HttpClient) { }

  /**
   * Get the list of available regions by organizationId
   * @return Array of regions
   */
  public getRegionsByOrganizationId(organizationId: number): Observable<Region[]> {
    return this.http.get<Region[]>(`/api/Regions/byorganizationId/${organizationId}`);
  }

  /**
   * Save the region
   */
  public saveRegion(region: Region): Observable<Region> {
    return this.http.post<Region>(`/api/Regions/`, region);
  }

  /**
   * Update the region
   */
  public updateRegion(region: Region): Observable<void> {
    return this.http.put<void>(`/api/Regions/`, region);
  }

  /**
   * Delete the region by id
   */
  public deleteRegionById(regionId: number): Observable<void> {
    return this.http.delete<void>(`/api/Regions/${regionId}`);
  }
}
