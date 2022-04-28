import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Department } from '../../shared/models/department.model';

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
  public getDepartmentsByLocationId(locationId?: number): Observable<Department[]> {
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
  public deleteDepartmentById(departmentId?: number): Observable<void> {
    return this.http.delete<void>(`/api/Departments/${departmentId}`);
  }
}
