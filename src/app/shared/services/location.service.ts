import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable } from 'rxjs';

import { ImportResult } from "@shared/models/import.model";
import {

  BulkLocationsAction,
  ImportedLocation,
  Location,
  LocationFilter,
  LocationFilterOptions,
  LocationsPage,
  LocationType,
  TimeZoneModel
} from '../../shared/models/location.model';
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
  public getLocationsByRegionId(regionId: number, filters?: LocationFilter): Observable<Location[] | LocationsPage> {
    if (filters) {
      return this.http.post<LocationsPage>(`/api/Locations/filter`, filters);
    }
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
  public updateLocation(location: Location, ignoreWarning: boolean): Observable<void> {
    if (ignoreWarning) {
      return this.http.put<void>(`/api/Locations/`, { location, ignoreValidationWarning: true });
    }
    return this.http.put<void>(`/api/Locations/`, { location });
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
/**
 * Bulk Update Location
 */
public bulkupdatelocations(selectedItems: Location[]): Observable<BulkLocationsAction> {
  return  this.http.put<BulkLocationsAction>(`/api/Locations/bulk-update-Location`, selectedItems)
}

/**
 * Bulk Delete Location
 */
public bulkdeletelocations(selectedItems: Number[]): Observable<BulkLocationsAction> {
  return  this.http.delete<BulkLocationsAction>(`/api/Locations/bulk-delete-Location`,  { body: selectedItems })
}


  /**
   * Get Location Filtering Options
   */
  public getLocationFilterOptions(regionId: number): Observable<LocationFilterOptions> {
    return this.http.get<LocationFilterOptions>(`/api/Locations/filteringoptions`, { params: { RegionId: regionId }}).pipe(map((data) => {
      return Object.fromEntries(Object.entries(data).map(([key, value]) => [[key], [...value].sort()]));
    }));
  }

  /**
   * Get all locationTypes
   * @return Array of locationTypes
   */
   public getLocationTypes(): Observable<LocationType[]> {
    return this.http.get<LocationType[]>(`/api/Locations/locationtypes`);
  }

  /**
   * Get usa canada timezoneids from noda
   * @return Array of timezoneIds
   */
  public getUSCanadaTimeZoneIds(): Observable<TimeZoneModel[]> {
    return this.http.get<TimeZoneModel[]>(`/api/NodaTime/uscanadatimezones`);
  }

  /**
   * Get Locations import template
   * @return blob
   */
  public getLocationsImportTemplate(errorRecords: ImportedLocation[]): Observable<any> {
    return this.http.post('/api/Locations/template', errorRecords, { responseType: 'blob' });
  }

  public uploadLocationsFile(file: Blob): Observable<ImportResult<ImportedLocation>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResult<ImportedLocation>>('/api/Locations/import', formData);
  }

  public saveLocationImportResult(successfulRecords: ImportedLocation[]): Observable<ImportResult<ImportedLocation>> {
    return this.http.post<ImportResult<ImportedLocation>>('/api/Locations/saveimport', successfulRecords);
  }
}
