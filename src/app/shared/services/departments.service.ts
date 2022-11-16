import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map, Observable } from 'rxjs';

import {
  Department,
  DepartmentFilter,
  DepartmentFilterOptions,
  DepartmentsPage,
  ImportedDepartment
} from '@shared/models/department.model';
import { ImportResult } from "@shared/models/import.model";
import { ExportPayload } from '@shared/models/export.model';
import { sortBy } from '@shared/helpers/sort-array.helper';

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
  public getDepartmentsByLocationId(locationId?: number, filters?: DepartmentFilter): Observable<Department[] | DepartmentsPage> {
    if (filters) {
      filters.inactiveDate = filters.inactiveDate as Date || null;
      return this.http.post<DepartmentsPage>(`/api/Departments/filter`, filters);
    }
    return this.http.get<Department[]>(`/api/Departments/byLocation/${locationId}`);
  }

  /**
   * Get department data
   */
   public getDepartmentData(departmentId: number, lastSelectedBusinessId?: number): Observable<Department> {
    let headers = {};

    if (lastSelectedBusinessId) {
      headers = new HttpHeaders({ 'selected-businessunit-id': `${lastSelectedBusinessId}` });
    }
    return this.http.get<Department>(`/api/Departments/${departmentId}`, { headers });
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
    return this.http
      .get<DepartmentFilterOptions>(`/api/Departments/filteringoptions`, { params: { LocationId: locationId } })
      .pipe(map((data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [[key], sortBy(value)]))));
  }

  public getDepartmentsImportTemplate(errorRecords: ImportedDepartment[]): Observable<any> {
    return this.http.post('/api/Departments/template', errorRecords, { responseType: 'blob' });
  }

  public uploadDepartmentsFile(file: Blob): Observable<ImportResult<ImportedDepartment>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResult<ImportedDepartment>>('/api/Departments/import', formData);
  }

  public saveDepartmentsImportResult(successfulRecords: ImportedDepartment[]): Observable<ImportResult<ImportedDepartment>> {
    return this.http.post<ImportResult<ImportedDepartment>>('/api/Departments/saveimport', successfulRecords);
  }
}
