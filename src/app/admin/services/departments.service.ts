import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
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
    return this.http.post<Department>(`${environment.host}/api/Departments`, department);
  }

  /**
   * Get the list of available departments by locationId
   * @return Array of departments
   */
  public getDepartmentsByLocationId(locationId: number): Observable<Department[]> {
    return this.http.get<Department[]>(`${environment.host}/api/Departments/byLocation/${locationId}`);
  }

  /**
   * Update department
   * @return Updated department
   */
  public updateDepartment(department: Department): Observable<Department> {
    return this.http.put<Department>(`${environment.host}/api/Departments/`, department);
  }

  /**
   * Delete department
   */
  public deleteDepartmentById(departmentId: number): Observable<void> {
    return this.http.delete<void>(`${environment.host}/api/Departments/${departmentId}`);
  }

  /**
   * Get the list of available regions by organizationId
   * @return Array of regions
   */
  public getRegions(organizationId: number): Observable<Region[]> {
    return this.http.get<Region[]>(`${environment.host}/api/Regions/byorganizationId/${organizationId}`);
  }

  /**
   * Get the list of available locations
   * @return Array of locations
   */
  public getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${environment.host}/api/Locations`);
  }
}
