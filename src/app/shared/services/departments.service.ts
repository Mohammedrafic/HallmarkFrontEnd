import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Department, DepartmentFIlter, DepartmentFilterOptions, DepartmentsPage } from '../../shared/models/department.model';
import { ExportPayload } from '@shared/models/export.model';

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
  public getDepartmentsByLocationId(locationId?: number, filters?: DepartmentFIlter): Observable<Department[] | DepartmentsPage> {
    if (filters) {
      filters.inactiveDate = filters.inactiveDate as Date || null;
      return this.http.post<DepartmentsPage>(`/api/Departments/filter`, filters);
    }
    return this.http.get<Department[]>(`/api/Departments/byLocation/${locationId}`);
  }

  /**
   * Update department
   */
  public updateDepartment(department: Department): Observable<void> {
    return this.http.put<void>(`/api/Departments/`, department);
  }

  /**
   * Delete department
   */
  public deleteDepartmentById(departmentId?: number): Observable<any> {
    return this.http.delete<any>(`/api/Departments/${departmentId}`);
  }

  /**
   * Export departments
   */
  public export(payload: ExportPayload): Observable<any> {
    if (payload.ids) {
      return this.http.post(`/api/Departments/export/byIds`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/Departments/export`, payload, { responseType: 'blob' });
  }

  /**
   * Get Department Filtering Options
   */
  public getDepartmentFilterOptions(locationId: number): Observable<DepartmentFilterOptions> {
    return this.http.get<DepartmentFilterOptions>(`/api/Departments/filteringoptions`, { params: { LocationId: locationId }});
  }
}
