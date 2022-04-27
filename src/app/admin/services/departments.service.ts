import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Department } from '../../shared/models/department.model';
import { Region } from '../../shared/models/region.model';
import { Location } from '../../shared/models/location.model';

@Injectable({ providedIn: 'root' })
export class DepartmentsService {

  constructor(private http: HttpClient) { }

  /**
   * Create department
   * @param department object to save
   * @return Created department
   */
  public saveDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(`/api/Departments`, department);
  }

  /**
   * Get the list of available departments by locationId
   * @return Array of departments
   */
  public getDepartmentsByLocationId(locationId: number): Observable<Department[]> {
    return this.http.get<Department[]>(`/api/Departments/byLocation/${locationId}`);
  }

  /**
   * Update department
   * @return Updated department
   */
  public updateDepartment(department: Department): Observable<void> {
    return this.http.put<void>(`/api/Departments/`, department);
  }

  /**
   * Delete department
   */
  public deleteDepartmentById(departmentId: number): Observable<void> {
    return this.http.delete<void>(`/api/Departments/${departmentId}`);
  }

  /**
   * Get the list of available regions by organizationId
   * @return Array of regions
   */
  public getRegionsByOragnizationId(organizationId: number): Observable<Region[]> {
    return this.http.get<Region[]>(`/api/Regions/byorganizationId/${organizationId}`);
  }

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
    return this.http.get<Location[]>(`/api/Locations/${regionId}`);
  }

  /**
   * Get the location by id
   * @return Array of locations
   */
  public getLocationById(locationId: number): Observable<Location> {
    return this.http.get<Location>(`/api/Locations/${locationId}`);
  }
}
