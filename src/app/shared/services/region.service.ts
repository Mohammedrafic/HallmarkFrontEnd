import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Region, regionFilter } from '@shared/models/region.model';
import { ExportPayload } from '@shared/models/export.model';

@Injectable({ providedIn: 'root' })
export class RegionService {

  constructor(private http: HttpClient) { }

  /**
   * Get the list of available regions by organizationId
   * @return Array of regions
   */
  public getRegionsByOrganizationId(filter:any): Observable<Region[]| regionFilter> {

    if(filter){
      return this.http.post<regionFilter>(`/api/Regions/filter`, filter);
    }else{
      return this.http.get<Region[]>(`/api/Regions`);
    }
   
  }

  /**
   * Save the region
   */
  public saveRegion(region: Region): Observable<Region> {
    return this.http.post<Region>(`/api/Regions/`, region);
  }

    /**
   * Export Regions
   */
     public exportRegion(payload: ExportPayload): Observable<any> {
  

      return this.http.post(`/api/Regions/export1`, payload, { responseType: 'blob' });
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
  public getRegionFilterOptions(regionId: any): Observable<regionFilter> {
    
    return this.http.post<regionFilter>(`/api/Regions/filter`, regionId);
  }
}
