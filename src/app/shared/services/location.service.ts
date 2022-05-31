import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from '../../shared/models/location.model';
import { ExportPayload } from '@shared/models/export.model';

@Injectable({ providedIn: 'root' })
export class LocationService {

  constructor(private http: HttpClient) { }

  /**
   * Get the list of available locations by organizationId
   * @return Array of locations
   */
  public getLocationsByOrganizationId(organizationId: number): Observable<Location[]> {
    return this.http.get<Location[]>(`/api/Locations/${organizationId}`);
  }

  /**
   * Get the list of available locations by regionId
   * @return Array of locations
   */
  public getLocationsByRegionId(regionId: number): Observable<Location[]> {
    return this.http.get<Location[]>(`/api/Locations/region/${regionId}`);
  }

  /**
   * Get the location by id
   * @return Array of locations
   */
  public getLocationById(locationId: number): Observable<Location> {
    return this.http.get<Location>(`/api/Locations/${locationId}`);
  }

  /**
   * Save the location
   */
  public saveLocation(location: Location): Observable<Location> {
    return this.http.post<Location>(`/api/Locations/`, location);
  }

  /**
   * Update the location
   */
  public updateLocation(location: Location): Observable<void> {
    return this.http.put<void>(`/api/Locations/`, { location: location });
  }

  /**
   * Delete the location by id
   */
  public deleteLocationById(locationId: number): Observable<any> {
    return this.http.delete<any>(`/api/Locations/${locationId}`);
  }

  /**
   * Export locations
   */
  public export(payload: ExportPayload): Observable<any> {
    if (payload.ids) {
      return this.http.post(`/api/Locations/export/byIds`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/Locations/export`, payload, { responseType: 'blob' });
  }
}
